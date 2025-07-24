import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export interface IUser extends mongoose.Document {
  name: string;
  email: string;
  password: string;
  preferences: {
    theme: 'light' | 'dark';
    notifications: boolean;
    language: string;
  };
  emergencyContacts: {
    name: string;
    relationship: string;
    phone: string;
    email: string;
  }[];
  moodLog: {
    date: Date;
    mood: 'very_low' | 'low' | 'neutral' | 'good' | 'very_good';
    notes?: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateAuthToken(): string;
}

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [8, 'Password must be at least 8 characters long'],
      select: false,
    },
    preferences: {
      theme: {
        type: String,
        enum: ['light', 'dark'],
        default: 'light',
      },
      notifications: {
        type: Boolean,
        default: true,
      },
      language: {
        type: String,
        default: 'en',
      },
    },
    emergencyContacts: [
      {
        name: {
          type: String,
          required: true,
        },
        relationship: {
          type: String,
          required: true,
        },
        phone: {
          type: String,
          required: true,
        },
        email: {
          type: String,
          required: true,
          match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
        },
      },
    ],
    moodLog: [
      {
        date: {
          type: Date,
          default: Date.now,
        },
        mood: {
          type: String,
          enum: ['very_low', 'low', 'neutral', 'good', 'very_good'],
          required: true,
        },
        notes: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Generate JWT token
userSchema.methods.generateAuthToken = function (): string {
  return jwt.sign(
    { id: this._id },
    process.env.JWT_SECRET || '35da518f2b05a3c6244d9a20f3470ef6c3c2288cedc620abe74520d41fcfb804',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    }
  );
};

export const User = mongoose.model<IUser>('User', userSchema); 