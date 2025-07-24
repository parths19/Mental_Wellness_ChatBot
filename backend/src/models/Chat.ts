import mongoose from 'mongoose';

export interface IMessage {
  _id?: mongoose.Types.ObjectId;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type: 'text' | 'exercise' | 'resource' | 'crisis';
  read?: boolean;
  metadata?: {
    exerciseType?: string;
    resourceUrl?: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
  };
}

export interface IChat extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  messages: IMessage[];
  lastActivity: Date;
  isActive: boolean;
  summary?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  sender: {
    type: String,
    enum: ['user', 'bot'],
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  type: {
    type: String,
    enum: ['text', 'exercise', 'resource', 'crisis'],
    default: 'text',
  },
  read: {
    type: Boolean,
    default: false,
  },
  metadata: {
    exerciseType: String,
    resourceUrl: String,
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
    },
  },
});

const chatSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    messages: [messageSchema],
    lastActivity: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    summary: String,
    sentiment: {
      type: String,
      enum: ['positive', 'neutral', 'negative'],
    },
  },
  {
    timestamps: true,
  }
);

// Update lastActivity on new messages
chatSchema.pre('save', function (next) {
  if (this.isModified('messages')) {
    this.lastActivity = new Date();
  }
  next();
});

export const Chat = mongoose.model<IChat>('Chat', chatSchema); 