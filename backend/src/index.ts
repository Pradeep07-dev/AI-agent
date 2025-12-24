import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
dotenv.config();
import initDB from "./db/initDB";
import cors from "cors";
import router from "./routes/route";
import rateLimit from "express-rate-limit";

const app = express();

app.use(express.json());
const port = Number(process.env.PORT) || 3000;

const allowedOrigins = process.env.FRONTEND_URL;

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

const chatLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 20,
  message: {
    error: "Too many messages. Please slow down.",
  },
});

app.use("/chat", chatLimiter, router);

async function startServer() {
  await initDB();

  const server = app.listen(port, () => {
    console.log(`Server is running at ${port}`);
  });

  server.on("error", (error) => {
    console.error("Server error: ", error);
  });
}

app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  console.error(error.stack);

  res
    .status(500)
    .json({ error: "Something went wrong. Please try again later." });
});

startServer().catch((error) => {
  console.error("Server start error: ", error);
  process.exit(1);
});
