import OpenAI from 'openai';
import { logger } from './logger';
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
export const detectCrisis = async (text) => {
    const lowercaseText = text.toLowerCase();
    let highestSeverity = 'low';
    const detectedKeywords = [];
    // Check for keywords in each severity level
    for (const [severity, keywords] of Object.entries(crisisKeywords)) {
        const found = keywords.filter((keyword) => lowercaseText.includes(keyword));
        if (found.length > 0) {
            detectedKeywords.push(...found);
            highestSeverity = severity;
            // Break if we find critical keywords
            if (severity === 'critical')
                break;
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
export const analyzeSentiment = async (text) => {
    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                {
                    role: 'system',
                    content: 'Analyze the sentiment of the following text and respond with ONLY one word: ' +
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
        if (sentiment === 'positive' ||
            sentiment === 'neutral' ||
            sentiment === 'negative') {
            return sentiment;
        }
        return 'neutral';
    }
    catch (error) {
        logger.error('Error analyzing sentiment:', error);
        return 'neutral';
    }
};
