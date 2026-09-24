import { Router } from "express";
import { chatSchema, sendChatMessage } from "../controllers/chatController";
import { authMiddleware } from "../middleware/authMiddleware";
import { roleMiddleware } from "../middleware/roleMiddleware";
import { validate } from "../middleware/validate";
import { chatLimiter } from "../middleware/rateLimiters";

const router = Router();

router.post(
  "/",
  authMiddleware,
  roleMiddleware("CUSTOMER"),
  chatLimiter,
  validate(chatSchema),
  sendChatMessage
);

export default router;
