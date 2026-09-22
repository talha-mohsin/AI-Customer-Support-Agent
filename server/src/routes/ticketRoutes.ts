import { Router } from "express";
import { createTicket, createTicketSchema, getMyTickets } from "../controllers/ticketController";
import { authMiddleware } from "../middleware/authMiddleware";
import { roleMiddleware } from "../middleware/roleMiddleware";
import { validate } from "../middleware/validate";

const router = Router();

router.use(authMiddleware, roleMiddleware("CUSTOMER"));
router.get("/", getMyTickets);
router.post("/", validate(createTicketSchema), createTicket);

export default router;
