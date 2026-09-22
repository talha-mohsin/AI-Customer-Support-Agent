import { Router } from "express";
import { login, loginSchema, register, registerSchema } from "../controllers/authController";
import { validate } from "../middleware/validate";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);

export default router;
