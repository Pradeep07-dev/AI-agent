import { Router } from "express";
import { getMessages, sendMessage } from "../controllers/controller";

const router = Router();

router.get("/:sessionId", getMessages);

router.post("/message", sendMessage);

export default router;
