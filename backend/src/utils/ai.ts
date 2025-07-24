import OpenAI from 'openai';
import { logger } from './logger';

if (!process.env.OPENAI_API_KEY) {
  logger.error('OPENAI_API_KEY is not set in environment variables');
  process.exit(1);
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Crisis keywords and their severity levels
const crisisKeywords = {
  critical: [
    'suicide',
    'kill myself',
    'end my life',
    'want to die',
    'better off dead',
  ],
  high: [
    'self harm',
    'cutting',
    'hopeless',
    'can\'t take it',
    'give up',
  ],
  medium: [
    'depressed',
    'anxiety',
    'panic',
    'overwhelmed',
    'trapped',
  ],
  low: [
    'stressed',
    'sad',
    'lonely',
    'tired',
    'worried',
  ],
};

// Simple sentiment analysis keywords
const sentimentKeywords = {
  positive: [
    'happy',
    'good',
    'great',
    'wonderful',
    'excellent',
    'amazing',
    'love',
    'thank',
    'better',
    'hopeful',
    'grateful',
    'blessed',
  ],
  negative: [
    'sad',
    'bad',
    'terrible',
    'awful',
    'horrible',
    'hate',
    'angry',
    'upset',
    'worried',
    'stressed',
    'anxious',
    'depressed',
  ],
};

interface CrisisResult {
  severity: 'low' | 'medium' | 'high' | 'critical';
  keywords: string[];
}

export const detectCrisis = async (text: string): Promise<CrisisResult> => {
  const lowercaseText = text.toLowerCase();
  let highestSeverity: CrisisResult['severity'] = 'low';
  const detectedKeywords: string[] = [];

  // Check for keywords in each severity level
  for (const [severity, keywords] of Object.entries(crisisKeywords)) {
    const found = keywords.filter((keyword) => lowercaseText.includes(keyword));
    if (found.length > 0) {
      detectedKeywords.push(...found);
      highestSeverity = severity as CrisisResult['severity'];
      // Break if we find critical keywords
      if (severity === 'critical') break;
    }
  }

  // If we detect critical or high severity, log it
  if (highestSeverity === 'critical' || highestSeverity === 'high') {
    logger.warn('Crisis keywords detected', {
      severity: highestSeverity,
      keywords: detectedKeywords,
      text,
    });
  }

  return {
    severity: highestSeverity,
    keywords: detectedKeywords,
  };
};

// Rule-based sentiment analysis as fallback
const analyzeSimpleSentiment = (text: string): 'positive' | 'neutral' | 'negative' => {
  const lowercaseText = text.toLowerCase();
  let positiveCount = 0;
  let negativeCount = 0;

  // Count positive and negative keywords
  sentimentKeywords.positive.forEach(keyword => {
    if (lowercaseText.includes(keyword)) positiveCount++;
  });

  sentimentKeywords.negative.forEach(keyword => {
    if (lowercaseText.includes(keyword)) negativeCount++;
  });

  // Determine sentiment based on keyword counts
  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
};

export const analyzeSentiment = async (
  text: string
): Promise<'positive' | 'neutral' | 'negative'> => {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content:
            'Analyze the sentiment of the following text and respond with ONLY one word: ' +
            'positive, neutral, or negative.',
        },
        {
          role: 'user',
          content: text,
        },
      ],
      temperature: 0,
      max_tokens: 10,
    });

    const sentiment = completion.choices[0]?.message?.content?.toLowerCase().trim();

    if (
      sentiment === 'positive' ||
      sentiment === 'neutral' ||
      sentiment === 'negative'
    ) {
      return sentiment;
    }

    // If OpenAI response is not valid, use rule-based analysis
    logger.warn('Invalid sentiment from OpenAI, using rule-based analysis');
    return analyzeSimpleSentiment(text);
  } catch (error) {
    logger.error('Error analyzing sentiment with OpenAI, using rule-based analysis:', error);
    return analyzeSimpleSentiment(text);
  }
}; 