import mongoose from 'mongoose';
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
const chatSchema = new mongoose.Schema({
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
}, {
    timestamps: true,
});
// Update lastActivity on new messages
chatSchema.pre('save', function (next) {
    if (this.isModified('messages')) {
        this.lastActivity = new Date();
    }
    next();
});
export const Chat = mongoose.model('Chat', chatSchema);
