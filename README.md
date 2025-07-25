# AI-Chat-Summarizer

A real-time WhatsApp clone with AI-powered message summarization built with Next.js, Socket.IO, and Supabase.

## Features

- 💬 Real-time messaging with Socket.IO
- 👥 Group and direct chats
- 🔒 Secure authentication with Supabase
- 🤖 AI-powered message summarization
- ✅ Message read receipts
- 👀 Typing indicators
- 🟢 Online/offline status
- 📱 Responsive design

## Setup Instructions

### 1. Environment Variables

Create a `.env.local` file with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Socket.IO Configuration
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
SOCKET_PORT=3001

# OpenAI Configuration (for AI summarization)
OPENAI_API_KEY=your_openai_api_key
```

### 2. Supabase Setup

1. Create a new Supabase project
2. Run the migration file `supabase/migrations/create_chat_schema.sql` in your Supabase SQL editor
3. Create the SQL functions by running the code in `lib/supabase-client.ts`
4. Update your environment variables with your Supabase credentials

### 3. Development

Install dependencies:
```bash
npm install
```

Run both the Next.js app and Socket.IO server:
```bash
npm run dev:all
```

Or run them separately:
```bash
# Terminal 1 - Next.js app
npm run dev

# Terminal 2 - Socket.IO server
npm run dev:socket
```

### 4. Production Deployment

For production, you'll need to:

1. Deploy the Next.js app to Vercel/Netlify
2. Deploy the Socket.IO server to a service like Railway, Heroku, or DigitalOcean
3. Update the `NEXT_PUBLIC_SOCKET_URL` environment variable to point to your deployed Socket.IO server
4. Configure CORS settings in the Socket.IO server for your production domain

## Architecture

- **Frontend**: Next.js with TypeScript and Tailwind CSS
- **Real-time**: Socket.IO for real-time messaging and presence
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **AI**: OpenAI GPT for message summarization
- **Authentication**: Supabase Auth (ready to implement)

## Key Components

- `app/whatsapp/page.tsx` - Main chat interface
- `server/socket-server.js` - Socket.IO server for real-time features
- `lib/supabase-client.ts` - Supabase client and helper functions
- `components/chat/` - Reusable chat components
- `hooks/useSocket.ts` - Socket.IO React hook

## Database Schema

The application uses the following main tables:

- `users` - User profiles and online status
- `chats` - Chat rooms (direct and group)
- `chat_participants` - User-chat relationships
- `messages` - Chat messages
- `message_reads` - Read receipts

All tables have Row Level Security enabled for data protection.