import { Box, Flex, Text, useColorModeValue } from '@chakra-ui/react';
import { format } from 'date-fns';

interface MessageProps {
  message: {
    id: string;
    content: string;
    sender: 'user' | 'bot';
    timestamp: string;
    type?: 'text' | 'exercise' | 'resource' | 'crisis';
    metadata?: {
      exerciseType?: string;
      resourceUrl?: string;
      severity?: 'low' | 'medium' | 'high' | 'critical';
    };
  };
}

function Message({ message }: MessageProps) {
  const isUser = message.sender === 'user';
  const bgColor = useColorModeValue(
    isUser ? 'brand.500' : 'gray.100',
    isUser ? 'brand.600' : 'gray.700'
  );
  const textColor = useColorModeValue(
    isUser ? 'white' : 'gray.800',
    isUser ? 'white' : 'gray.100'
  );

  return (
    <Flex justify={isUser ? 'flex-end' : 'flex-start'}>
      <Box
        maxW="80%"
        bg={bgColor}
        color={textColor}
        p={4}
        borderRadius="lg"
        position="relative"
      >
        <Text>{message.content}</Text>
        <Text
          fontSize="xs"
          color={isUser ? 'whiteAlpha.700' : 'gray.500'}
          mt={1}
        >
          {format(new Date(message.timestamp), 'h:mm a')}
        </Text>
      </Box>
    </Flex>
  );
}

export default Message; 