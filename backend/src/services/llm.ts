import OpenAI from "openai";
import dotenv from "dotenv";
import pool from "../config/db";
dotenv.config();

type ChatCompletionMessageParam = {
  role: "system" | "user" | "assistant";
  content: string;
};

const client = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

const generateReply = async (
  history: { sender: string; text: string }[],
  userMessage: string
): Promise<string> => {
  try {
    const { rows: knowledge } = await pool.query(
      "SELECT content FROM knowledge_base"
    );

    const knowledgeText = knowledge.map((k) => k.content).join("\n");

    const SYSTEM_PROMPT = `
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

Store Knowledge:
${knowledgeText}

`;

    const historyMessages: ChatCompletionMessageParam[] = history.map(
      (msg): ChatCompletionMessageParam => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.text,
      })
    );

    const messages: ChatCompletionMessageParam[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...historyMessages,
      { role: "user", content: userMessage },
    ];

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.2,
      max_tokens: 300,
    });

    return (
      response.choices[0]?.message?.content?.trim() ||
      "Sorry, I couldn't generate a response."
    );
  } catch (error: any) {
    console.error("LLM error: ", error);

    if (error.code === "rate_limit_exceeded") {
      return "I'm getting too many requests right now. Please try again in a moment.";
    }

    if (error.code === "invalid_api_key") {
      return "Service configuration issue. Please contact support.";
    }

    if (error.name === "TimeoutError") {
      return "The response took too long. Please try again.";
    }

    return "Sorry, I'm having trouble right now. Please try again later.";
  }
};

export default generateReply;
