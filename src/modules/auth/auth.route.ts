import { Router } from "express";

import { validate } from "../../middlewares/validate.middleware.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { protectCookieAuthFromCsrf } from "../../middlewares/csrf.middleware.js";
import {
  loginRateLimit,
  refreshRateLimit,
  registerRateLimit,
} from "../../middlewares/rateLimit.middleware.js";

import {
  login,
  logout,
  logoutAll,
  refreshToken,
  register,
} from "./controllers/auth.controller.js";

import { loginSchema, registerSchema } from "./validations/auth.validation.js";

const router = Router();

router.use(protectCookieAuthFromCsrf);

router.post("/register", registerRateLimit, validate(registerSchema), register);

router.post("/login", loginRateLimit, validate(loginSchema), login);

router.post("/refresh", refreshRateLimit, refreshToken);

router.post("/logout", logout);

router.post("/logout-all", authenticate, logoutAll);

export default router;
