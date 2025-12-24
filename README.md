# 🎧 AI Live Chat Agent

A minimal yet robust **AI-powered live chat widget** for customer support — built with **Node.js / TypeScript**, **React / Typescript**, and **PostgreSQL**, integrated with **OpenAI**'s LLM.  
This project implements a persistent chat backend, intelligent AI replies with guardrails, and a friendly frontend UI.

---

## 🌟 Features

- 🗨️ Modern live chat interface (scrollable, auto-scroll)
- 👤 Clear distinction between user and AI messages
- ↵ Enter to send + disabled send during request
- 🔁 Chat sessions persisted with `sessionId`
- 🧠 LLM integration with prompt guardrails and domain knowledge
- 💾 Message history stored in PostgreSQL
- ⚠️ Input validation + robust error handling
- 🛡️ Rate limiting and cost control
- 📦 Environment-based configuration using `.env`

---

## 🧠 Tech Stack

| Layer        | Technology                       |
| ------------ | -------------------------------- |
| Frontend     | React + TypeScript + TailwindCSS |
| Backend      | Node.js + TypeScript + Express   |
| Database     | PostgreSQL                       |
| LLM Provider | OpenAI (`gpt-4o-mini`)           |
| Cache        | Optional Redis (not used)        |
| Deployment   | Vercel / Render / Railway        |

---

## 📦 Getting Started (Local Setup)

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Pradeep07-dev/AI-agent.git
cd ai-agent

```

### 2️⃣ Install Dependencies Repository

#### Backend

```bash
cd backend
npm install
```

#### Frontend

```bash
cd frontend
npm install
```

### 3️⃣ Environment Variables

Create a .env file inside the backend folder:

```bash
# Server
PORT=3000

# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name

# OpenAI
OPENAI_KEY=sk-your-openai-key

# CORS
FRONTEND_ORIGIN=http://localhost:5173
```

### 4️⃣ Database Setup

- Make sure PostgreSQL is running.

- On backend startup, the app automatically:

- Creates required tables

- Seeds the knowledge base

- Tables created:

  - conversations

  - messages

  - knowledge_base

  - No manual migrations required.

### 5️⃣ Run the Backend

```bash
cd backend
npm run dev
```

#### For production:

```bash
npm run build
npm start
```

### 6️⃣ Run the Frontend

```bash
cd frontend
npm run dev
```

---

## 🏗 Architecture Overview

Frontend (React + Typescript)
↓ HTTP
Backend (Express + TypeScript)
↓
PostgreSQL (Conversations & Messages)
↓
OpenAI API (LLM)

### Responsibilities

#### Frontend

- Chat UI

- Stores sessionId

- Displays message history

- Handles loading & errors

#### Backend

- Input validation

- Session management

- Message persistence

- LLM orchestration

- Rate limiting & error handling

- Database

- Stores conversations

- Stores messages

- Stores FAQ / domain knowledge

---

## 🤖 LLM Integration & Prompting

#### Provider

OpenAI – gpt-4o-mini

#### Prompt Strategy

- The AI is instructed to act as a customer support agent and strictly use only provided knowledge.

Example system prompt:

```bash
Your are a helpful customer support agent for a small e-commerce store.

    Rules:
- You may respond to greetings (e.g., "hi", "hello") with a short polite greeting.
- For all other questions, use ONLY the provided store knowledge.
- Answer clearly and concisely.
- Use ONLY the provided context.
- You are not allowed to guess, assume, or generalize.
- Do NOT hallucinate or invent policies.
- If the answer is not present in the knowledge, respond with:
  "I'm not sure about that. Please contact support."

You MUST NOT answer questions outside the store knowledge.
```

#### Cost Controls

- Max tokens capped (≈300)

- Conversation history limited

- Rate limiting enabled

---

## 📚 Domain Knowledge (Seeded)

#### The AI is seeded with fictional store FAQs:

- Shipping policy

- Return & refund policy

- Support hours

These are stored in the database and injected into the prompt.

## 📡 API Endpoints

#### POST /chat/message

#### Request

```bash
{
  "message": "Do you ship to USA?",
  "sessionId": "optional-session-id"
}
```

#### Response

```bash
{
  "message": "Yes, we ship to the USA. Delivery takes 5–7 business days.",
  "sessionId": "generated-or-existing-session-id"
}
```

#### GET /chat/:sessionId

Fetch full message history for a conversation.

---

## 🗃 Data Model

#### Conversations

```bash
id (UUID)
created_at (timestamp)
```

#### Messages

```bash
id
conversation_id
sender ('user' | 'ai')
text
created_at
```

---

## 🧠 Trade-offs & Assumptions

- No authentication

- Limited history to reduce LLM cost

- Redis omitted for simplicity

- Single LLM model

- No third-party integrations (Shopify, WhatsApp, etc.)

---

## 🚧 If I Had More Time…

- Redis-based caching & rate limiting

- WebSocket real-time chat

- Pagination for long conversations

- Analytics dashboard

- Multi-channel support (WhatsApp, Instagram)
