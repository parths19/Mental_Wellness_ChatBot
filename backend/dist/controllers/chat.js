import OpenAI from 'openai';
import { Chat } from '../models/Chat';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { analyzeSentiment, detectCrisis } from '../utils/ai';
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});
export const sendMessage = async (req, res, next) => {
    try {
        const { content } = req.body;
        const userId = req.user._id;
        // Get or create active chat
        let chat = await Chat.findOne({ userId, isActive: true });
        if (!chat) {
            chat = await Chat.create({
                userId,
                messages: [],
                isActive: true,
            });
        }
        // Add user message
        const userMessage = {
            content,
            sender: 'user',
            timestamp: new Date(),
            type: 'text',
        };
        chat.messages.push(userMessage);
        // Check for crisis keywords
        const crisisLevel = await detectCrisis(content);
        if (crisisLevel.severity === 'high' || crisisLevel.severity === 'critical') {
            const crisisMessage = {
                content: 'I notice you might be going through a difficult time. Please remember that help is available 24/7:\n\n' +
                    '🆘 988 Suicide & Crisis Lifeline - Call or text 988\n' +
                    '💬 Crisis Text Line - Text HOME to 741741\n\n' +
                    'Would you like me to help you connect with a mental health professional?',
                sender: 'bot',
                timestamp: new Date(),
                type: 'crisis',
                metadata: {
                    severity: crisisLevel.severity,
                },
            };
            chat.messages.push(crisisMessage);
            await chat.save();
            // Trigger emergency protocols if configured
            if (crisisLevel.severity === 'critical') {
                logger.warn(`Critical crisis detected for user ${userId}`, {
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
        const completion = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                {
                    role: 'system',
                    content: 'You are an empathetic mental health support chatbot. Provide supportive, ' +
                        'non-judgmental responses. Never diagnose or provide medical advice. ' +
                        'Instead, encourage professional help when appropriate. Use a warm, ' +
                        'caring tone while maintaining appropriate boundaries.',
                },
                {
                    role: 'user',
                    content,
                },
            ],
            temperature: 0.7,
            max_tokens: 150,
        });
        const botResponse = completion.choices[0]?.message?.content || 'I apologize, but I am unable to respond at the moment.';
        // Analyze sentiment
        const sentiment = await analyzeSentiment(content);
        // Add bot message
        const botMessage = {
            content: botResponse,
            sender: 'bot',
            timestamp: new Date(),
            type: 'text',
        };
        chat.messages.push(botMessage);
        chat.sentiment = sentiment;
        await chat.save();
        res.json({
            status: 'success',
            data: {
                messages: [userMessage, botMessage],
            },
        });
    }
    catch (error) {
        next(error);
    }
};
export const getMessages = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const chat = await Chat.findOne({ userId, isActive: true });
        if (!chat) {
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
    }
    catch (error) {
        next(error);
    }
};
export const getActiveChat = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const chat = await Chat.findOne({ userId, isActive: true });
        if (!chat) {
            throw new AppError('No active chat found', 404);
        }
        res.json({
            status: 'success',
            data: {
                chat,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
export const endChat = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const chat = await Chat.findOne({ userId, isActive: true });
        if (!chat) {
            throw new AppError('No active chat found', 404);
        }
        chat.isActive = false;
        await chat.save();
        res.json({
            status: 'success',
            message: 'Chat ended successfully',
        });
    }
    catch (error) {
        next(error);
    }
};
