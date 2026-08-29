import { Router } from "express";

import { validate } from "../../middlewares/validate.middleware.js";

import {
  login,
  refreshToken,
  register,
} from "./controllers/auth.controller.js";

import { loginSchema, registerSchema } from "./validations/auth.validation.js";

const router = Router();

router.post("/register", validate(registerSchema), register);

router.post("/login", validate(loginSchema), login);

router.post("/refresh", refreshToken);

export default router;
