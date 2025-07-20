import { Router } from "express";
import { register, login } from "../controllers/authController";
import {
  loginSchemaValidation,
  registerSchemaValidation,
} from "../middlewares/schemaValidation";

const router = Router();

router.post("/register", [registerSchemaValidation], register);
router.post("/login", [loginSchemaValidation], login);

export default router;
