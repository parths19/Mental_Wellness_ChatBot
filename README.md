# Mental Wellness ChatBot

A supportive mental health chatbot built with React, Node.js, and OpenAI's GPT-3.5 Turbo. This application provides a safe space for users to discuss their mental health concerns and receive empathetic responses.

## Features

- 🤖 AI-powered empathetic responses using GPT-3.5 Turbo
- 🔒 Secure user authentication
- 💬 Real-time chat functionality
- 🚨 Crisis detection and support resources
- 📊 Sentiment analysis of conversations
- 🌓 Dark/Light mode support
- 📱 Responsive design

## Tech Stack

### Frontend
- React
- TypeScript
- Redux Toolkit
- Chakra UI
- Socket.IO Client

### Backend
- Node.js
- Express
- TypeScript
- MongoDB
- Socket.IO
- OpenAI API
- JWT Authentication

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

You'll also need:
- OpenAI API key
- MongoDB connection string

## Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd mental-wellness-chatbot
\`\`\`

2. Install dependencies for both frontend and backend:
\`\`\`bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
\`\`\`

3. Create environment files:

Create a \`.env\` file in the backend directory with the following variables:
\`\`\`
PORT=5001
MONGODB_URI=mongodb://localhost:27017/mental-wellness
CLIENT_URL=http://localhost:5174
OPENAI_API_KEY=your-openai-api-key
JWT_SECRET=your-jwt-secret
\`\`\`

## Running the Application

1. Start the backend server:
\`\`\`bash
cd backend
npm run dev
\`\`\`

2. In a new terminal, start the frontend development server:
\`\`\`bash
# From the project root
npm run dev
\`\`\`

The application will be available at:
- Frontend: http://localhost:5174
- Backend API: http://localhost:5001

## Features in Detail

### Chat Functionality
- Real-time messaging using Socket.IO
- AI-powered responses using GPT-3.5 Turbo
- Sentiment analysis of user messages
- Crisis detection and support resources

### Authentication
- Secure user registration and login
- JWT-based authentication
- Protected routes

### User Interface
- Clean, intuitive design
- Dark/Light mode toggle
- Responsive layout for all devices
- Real-time typing indicators

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 