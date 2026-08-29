import type { Request, Response } from "express";
import { AppError } from "../../../errors/AppError.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { refreshTokenCookieOptions } from "../../../utils/cookie.util.js";

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
  const result = await authService.login(req.body);

  res.cookie("refreshToken", result.refreshToken, refreshTokenCookieOptions);

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      user: result.user,
      accessToken: result.accessToken,
    },
  });
});

export const refreshToken = asyncHandler(
  async (req: Request, res: Response) => {
    const oldRefreshToken = req.cookies.refreshToken;

    if (!oldRefreshToken) {
      throw new AppError("Refresh token not found", 401);
    }

    const result = await authService.refreshAccessToken(oldRefreshToken);

    res.cookie("refreshToken", result.refreshToken, refreshTokenCookieOptions);

    res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      data: {
        accessToken: result.accessToken,
      },
    });
  },
);
