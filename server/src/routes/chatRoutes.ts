import { Router } from "express";
import { chatSchema, sendChatMessage } from "../controllers/chatController";
import { authMiddleware } from "../middleware/authMiddleware";
import { roleMiddleware } from "../middleware/roleMiddleware";
import { validate } from "../middleware/validate";

const router = Router();

router.post("/", authMiddleware, roleMiddleware("CUSTOMER"), validate(chatSchema), sendChatMessage);

export default router;
