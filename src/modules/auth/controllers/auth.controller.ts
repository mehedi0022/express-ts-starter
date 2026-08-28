import type { Request, Response } from "express";

import { asyncHandler } from "../../../utils/asyncHandler.js";

import * as authService from "../services/auth.service.js";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.register(req.body);

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: user,
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.login(req.body);

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: user,
  });
});
