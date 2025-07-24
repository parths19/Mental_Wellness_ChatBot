import { Request, Response, NextFunction } from 'express';
import OpenAI from 'openai';
import { Chat } from '../models/Chat';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { analyzeSentiment, detectCrisis } from '../utils/ai';

// Validate OpenAI API key
if (!process.env.OPENAI_API_KEY) {
  logger.error('OPENAI_API_KEY is not set in environment variables');
  throw new Error('OPENAI_API_KEY is required');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Default bot response when AI is unavailable
const DEFAULT_BOT_RESPONSE = "I apologize, but I'm having trouble processing your message right now. " +
  "Please try again in a moment. If you're in immediate need of support, remember you can always " +
  "reach out to professional help services or emergency contacts.";

export const sendMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { content } = req.body;
    const userId = req.user._id;

    if (!content) {
      throw new AppError('Message content is required', 400);
    }

    logger.info('Processing new message', { userId, contentLength: content.length });

    // Get or create active chat
    let chat = await Chat.findOne({ userId, isActive: true });
    if (!chat) {
      logger.info('Creating new chat session', { userId });
      chat = await Chat.create({
        userId,
        messages: [],
        isActive: true,
      });
    }

    // Add user message
    const userMessage = {
      content,
      sender: 'user' as const,
      timestamp: new Date(),
      type: 'text' as const,
    };
    chat.messages.push(userMessage);

    try {
      // Check for crisis keywords
      const crisisLevel = await detectCrisis(content);
      if (crisisLevel.severity === 'high' || crisisLevel.severity === 'critical') {
        logger.warn('Crisis detected in message', { 
          userId, 
          severity: crisisLevel.severity,
          keywords: crisisLevel.keywords
        });

        const crisisMessage = {
          content:
            'I notice you might be going through a difficult time. Please remember that help is available 24/7:\n\n' +
            '🆘 988 Suicide & Crisis Lifeline - Call or text 988\n' +
            '💬 Crisis Text Line - Text HOME to 741741\n\n' +
            'Would you like me to help you connect with a mental health professional?',
          sender: 'bot' as const,
          timestamp: new Date(),
          type: 'crisis' as const,
          metadata: {
            severity: crisisLevel.severity,
          },
        };
        chat.messages.push(crisisMessage);
        await chat.save();

        // Trigger emergency protocols if configured
        if (crisisLevel.severity === 'critical') {
          logger.warn('Critical crisis detected', {
            userId,
            content,
            crisisLevel,
          });
          // Additional emergency protocols can be implemented here
        }

        return res.json({
          status: 'success',
          data: {
            messages: [userMessage, crisisMessage],
            crisisDetected: true,
          },
        });
      }

      // Generate AI response
      logger.info('Generating AI response', { userId });
      let botResponse: string;
      
      try {
        const completion = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content:
                'You are an empathetic mental health support chatbot. Provide supportive, ' +
                'non-judgmental responses. Never diagnose or provide medical advice. ' +
                'Instead, encourage professional help when appropriate. Use a warm, ' +
                'caring tone while maintaining appropriate boundaries. Keep responses concise but helpful.',
            },
            {
              role: 'user',
              content,
            },
          ],
          temperature: 0.7,
          max_tokens: 150,
        });

        botResponse = completion.choices[0]?.message?.content || DEFAULT_BOT_RESPONSE;
        logger.info('AI response generated', { userId, responseLength: botResponse.length });
      } catch (openaiError) {
        logger.error('OpenAI API error', {
          userId,
          error: openaiError instanceof Error ? openaiError.message : 'Unknown OpenAI error'
        });
        botResponse = DEFAULT_BOT_RESPONSE;
      }

      // Analyze sentiment
      let sentiment;
      try {
        sentiment = await analyzeSentiment(content);
        logger.info('Sentiment analysis completed', { userId, sentiment });
      } catch (sentimentError) {
        logger.error('Sentiment analysis failed', {
          userId,
          error: sentimentError instanceof Error ? sentimentError.message : 'Unknown sentiment error'
        });
        sentiment = 'neutral' as 'positive' | 'neutral' | 'negative';
      }

      // Add bot message
      const botMessage = {
        content: botResponse,
        sender: 'bot' as const,
        timestamp: new Date(),
        type: 'text' as const,
      };
      chat.messages.push(botMessage);
      chat.sentiment = sentiment;

      await chat.save();
      logger.info('Chat session updated', { userId, messageCount: chat.messages.length });

      res.json({
        status: 'success',
        data: {
          messages: [userMessage, botMessage],
        },
      });
    } catch (aiError) {
      logger.error('Error processing message with AI', {
        userId,
        error: aiError instanceof Error ? aiError.message : 'Unknown error'
      });
      
      // Save the user message even if AI processing fails
      await chat.save();
      
      // Send a fallback response instead of throwing an error
      const fallbackMessage = {
        content: DEFAULT_BOT_RESPONSE,
        sender: 'bot' as const,
        timestamp: new Date(),
        type: 'text' as const,
      };
      
      res.json({
        status: 'success',
        data: {
          messages: [userMessage, fallbackMessage],
          aiError: true
        },
      });
    }
  } catch (error) {
    logger.error('Error in sendMessage', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: req.user?._id
    });
    next(error);
  }
};

export const getMessages = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user._id;
    logger.info('Fetching messages', { userId });

    const chat = await Chat.findOne({ userId, isActive: true });

    if (!chat) {
      logger.info('No active chat found', { userId });
      return res.json({
        status: 'success',
        data: {
          messages: [],
        },
      });
    }

    res.json({
      status: 'success',
      data: {
        messages: chat.messages,
      },
    });
  } catch (error) {
    logger.error('Error in getMessages', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: req.user?._id
    });
    next(error);
  }
};

export const getActiveChat = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user._id;
    logger.info('Fetching active chat', { userId });

    const chat = await Chat.findOne({ userId, isActive: true });

    if (!chat) {
      logger.info('No active chat found', { userId });
      throw new AppError('No active chat found', 404);
    }

    res.json({
      status: 'success',
      data: {
        chat,
      },
    });
  } catch (error) {
    logger.error('Error in getActiveChat', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: req.user?._id
    });
    next(error);
  }
};

export const endChat = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user._id;
    logger.info('Ending chat session', { userId });

    const chat = await Chat.findOne({ userId, isActive: true });

    if (!chat) {
      logger.info('No active chat found to end', { userId });
      throw new AppError('No active chat found', 404);
    }

    chat.isActive = false;
    await chat.save();
    logger.info('Chat session ended successfully', { userId });

    res.json({
      status: 'success',
      message: 'Chat ended successfully',
    });
  } catch (error) {
    logger.error('Error in endChat', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: req.user?._id
    });
    next(error);
  }
}; 