import { Router } from "express";
import { getConversationById, getMyConversations } from "../controllers/conversationController";
import { authMiddleware } from "../middleware/authMiddleware";
import { roleMiddleware } from "../middleware/roleMiddleware";

const router = Router();

router.use(authMiddleware, roleMiddleware("CUSTOMER"));
router.get("/", getMyConversations);
router.get("/:id", getConversationById);

export default router;
