import type { Request, Response, NextFunction } from "express";

import { env } from "../config/env.js";

type ErrorWithStatus = Error & {
  statusCode?: number;
  isOperational?: boolean;
};

export const globalErrorHandler = (
  err: ErrorWithStatus,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const statusCode = err.statusCode || 500;

  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    message,

    ...(env.NODE_ENV === "development" && {
      stack: err.stack,
    }),
  });
};
