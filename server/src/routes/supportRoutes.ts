import { Router } from "express";
import { getAllTickets, updateTicket, updateTicketSchema } from "../controllers/ticketController";
import { authMiddleware } from "../middleware/authMiddleware";
import { roleMiddleware } from "../middleware/roleMiddleware";
import { validate } from "../middleware/validate";

const router = Router();

router.use(authMiddleware, roleMiddleware("SUPPORT_AGENT"));
router.get("/tickets", getAllTickets);
router.patch("/tickets/:id", validate(updateTicketSchema), updateTicket);

export default router;
