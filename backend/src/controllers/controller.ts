import { Request, Response } from "express";
import pool from "../config/db";
import generateReply from "../services/llm";
import { randomUUID as uuidv4 } from "crypto";

const getMessages = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    if (!sessionId || typeof sessionId !== "string") {
      return res.status(400).json({ error: "Invalid session ID" });
    }
    const { rowCount } = await pool.query(
      "SELECT 1 FROM conversations WHERE id = $1",
      [sessionId]
    );
    if (rowCount === 0) {
      return res.status(404).json({ error: "Session not found" });
    }
    const { rows } = await pool.query(
      `
        SELECT sender, text, created_at
        FROM messages
        WHERE conversation_id = $1
        ORDER BY id ASC
        `,
      [sessionId]
    );
    res.status(200).json({ messages: rows });
  } catch (error) {
    console.error("Error fetching messages: ", error);
    res.status(500).json({ error: "Failed to fetch messages." });
  }
};

const sendMessage = async (req: Request, res: Response) => {
  try {
    const { message, sessionId } = req.body;
    if (typeof message !== "string") {
      return res.status(400).json({
        error: "Invalid message format",
      });
    }
    if (!message || message.trim() === "") {
      return res.status(400).json({ error: "Message cannot be empty" });
    }
    if (message.length > 200) {
      return res.status(400).json({
        error: "Message is too long. Max 200 characters.",
      });
    }
    let convId = sessionId;
    if (convId) {
      const { rowCount } = await pool.query(
        "SELECT 1 FROM conversations WHERE id = $1",
        [convId]
      );
      if (rowCount === 0) {
        convId = null;
      }
    }
    if (!convId) {
      convId = uuidv4();
      await pool.query("INSERT INTO conversations (id) VALUES ($1)", [convId]);
    }
    await pool.query("BEGIN");
    try {
      await pool.query(
        "INSERT INTO messages (conversation_id, sender, text) VALUES ($1, 'user', $2)",
        [convId, message]
      );
      const { rows: history } = await pool.query(
        "SELECT * FROM messages WHERE conversation_id = $1 ORDER BY id ASC LIMIT 10",
        [convId]
      );
      const aiReply = await generateReply(history, message);
      await pool.query(
        "INSERT INTO messages (conversation_id, sender, text) VALUES ($1, 'ai', $2) ",
        [convId, aiReply]
      );
      await pool.query("COMMIT");
      res.json({ message: aiReply, sessionId: convId });
    } catch (error) {
      await pool.query("ROLLBACK");
      throw error;
    }
  } catch (error) {
    console.error("Error in /chat/message:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export { getMessages, sendMessage };
