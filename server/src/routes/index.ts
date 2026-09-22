import { Router } from "express";
import authRoutes from "./authRoutes";
import userRoutes from "./userRoutes";
import conversationRoutes from "./conversationRoutes";
import chatRoutes from "./chatRoutes";
import orderRoutes from "./orderRoutes";
import ticketRoutes from "./ticketRoutes";
import supportRoutes from "./supportRoutes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/conversations", conversationRoutes);
router.use("/chat", chatRoutes);
router.use("/orders", orderRoutes);
router.use("/tickets", ticketRoutes);
router.use("/support", supportRoutes);

export default router;
