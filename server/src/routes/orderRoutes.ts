import { Router } from "express";
import { getMyOrders, getOrderByNumber } from "../controllers/orderController";
import { authMiddleware } from "../middleware/authMiddleware";
import { roleMiddleware } from "../middleware/roleMiddleware";

const router = Router();

router.use(authMiddleware, roleMiddleware("CUSTOMER"));
router.get("/", getMyOrders);
router.get("/:orderNumber", getOrderByNumber);

export default router;
