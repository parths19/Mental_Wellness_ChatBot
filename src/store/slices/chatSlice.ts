import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../utils/axios';

interface Message {
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
}

interface ChatState {
  messages: Message[];
  isTyping: boolean;
  error: string | null;
  currentExercise: {
    type: string | null;
    progress: number;
    isActive: boolean;
  };
}

const initialState: ChatState = {
  messages: [],
  isTyping: false,
  error: null,
  currentExercise: {
    type: null,
    progress: 0,
    isActive: false,
  },
};

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async (content: string) => {
    const response = await api.post('/api/chat/message', { content });
    return response.data;
  }
);

export const startExercise = createAsyncThunk(
  'chat/startExercise',
  async (exerciseType: string) => {
    const response = await api.post('/api/exercises/start', { exerciseType });
    return response.data;
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload);
    },
    setTyping: (state, action: PayloadAction<boolean>) => {
      state.isTyping = action.payload;
    },
    updateExerciseProgress: (state, action: PayloadAction<number>) => {
      state.currentExercise.progress = action.payload;
    },
    clearChat: (state) => {
      state.messages = [];
      state.error = null;
      state.currentExercise = {
        type: null,
        progress: 0,
        isActive: false,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendMessage.pending, (state) => {
        state.isTyping = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.isTyping = false;
        if (action.payload.data && action.payload.data.messages) {
          state.messages.push(...action.payload.data.messages);
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.isTyping = false;
        state.error = action.error.message || 'Failed to send message';
      })
      .addCase(startExercise.fulfilled, (state, action) => {
        state.currentExercise = {
          type: action.payload.type,
          progress: 0,
          isActive: true,
        };
      });
  },
});

export const {
  addMessage,
  setTyping,
  updateExerciseProgress,
  clearChat,
} = chatSlice.actions;
export default chatSlice.reducer; 