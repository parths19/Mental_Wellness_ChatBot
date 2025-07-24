import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
const userSchema = new mongoose.Schema({
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
}, {
    timestamps: true,
});
// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password'))
        return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});
// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};
// Generate JWT token
userSchema.methods.generateAuthToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET || 'your-jwt-secret-key', {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });
};
export const User = mongoose.model('User', userSchema);
