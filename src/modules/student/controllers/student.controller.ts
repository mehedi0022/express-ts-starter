import type { Request, Response } from "express";

import { asyncHandler } from "../../../utils/asyncHandler.js";

export const createStudent = asyncHandler(
  async (req: Request, res: Response) => {
    res.status(201).json({
      success: true,
      message: "Student validated successfully",
      data: req.body,
    });
  },
);
