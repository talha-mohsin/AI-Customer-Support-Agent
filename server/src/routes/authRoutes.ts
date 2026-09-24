import { Router } from "express";
import { login, loginSchema, register, registerSchema } from "../controllers/authController";
import { validate } from "../middleware/validate";
import { authLimiter } from "../middleware/rateLimiters";

const router = Router();

router.use(authLimiter);
router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);

export default router;
