import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Box,
  Flex,
  Input,
  IconButton,
  VStack,
  Text,
  useColorModeValue,
  Spinner,
  useToast,
} from '@chakra-ui/react';
import { FaPaperPlane } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { sendMessage } from '../store/slices/chatSlice';
import Message from '../components/chat/Message';

function Chat() {
  // State hooks
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Redux hooks
  const dispatch = useDispatch();
  const { messages, isTyping } = useSelector((state: RootState) => state.chat);
  const { token } = useSelector((state: RootState) => state.auth);

  // UI hooks
  const toast = useToast();
  const bgColor = useColorModeValue('gray.50', 'gray.700');
  const boxBgColor = useColorModeValue('white', 'gray.800');
  const typingBgColor = useColorModeValue('gray.100', 'gray.600');

  // Callbacks
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;

    try {
      setIsSending(true);

      const userMessage = {
        id: Date.now().toString(),
        content: input.trim(),
        sender: 'user' as const,
        timestamp: new Date().toISOString(),
      };

      setInput('');
      await dispatch(sendMessage(userMessage.content));
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  }, [input, isSending, dispatch, toast]);

  // Effects
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Check authentication
  useEffect(() => {
    if (!token) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to use the chat.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [token, toast]);

  return (
    <Flex direction="column" h="calc(100vh - 200px)">
      <Box
        flex="1"
        overflowY="auto"
        p={4}
        bg={bgColor}
        borderRadius="lg"
        mb={4}
      >
        <VStack spacing={4} align="stretch">
          {messages.map((message) => (
            <Message key={message.id} message={message} />
          ))}
          {isTyping && (
            <Flex justify="flex-start">
              <Box
                bg={typingBgColor}
                p={4}
                borderRadius="lg"
                maxW="80%"
              >
                <Spinner size="sm" mr={2} />
                <Text as="span">Typing...</Text>
              </Box>
            </Flex>
          )}
          <div ref={messagesEndRef} />
        </VStack>
      </Box>

      <Box
        as="form"
        onSubmit={handleSubmit}
        bg={boxBgColor}
        p={4}
        borderRadius="lg"
        boxShadow="sm"
      >
        <Flex>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            mr={2}
            isDisabled={!token || isSending}
          />
          <IconButton
            colorScheme="brand"
            aria-label="Send message"
            icon={<FaPaperPlane />}
            type="submit"
            isLoading={isSending}
            isDisabled={!input.trim() || !token || isSending}
          />
        </Flex>
      </Box>
    </Flex>
  );
}

export default Chat; 