import type { Request, Response } from "express";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import * as userService from "../services/user.service.js";

export const getAllUsers = asyncHandler(
  async (_req: Request, res: Response) => {
    const users = await userService.getAllUsers();

    res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: users,
    });
  },
);

export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.getUserById(Number(req.params.id));
  res.status(200).json({ success: true, message: "User fetched successfully", data: user });
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.updateUser(Number(req.params.id), req.body);
  res.status(200).json({ success: true, message: "User updated successfully", data: user });
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  await userService.deleteUser(Number(req.params.id));
  res.status(204).send();
});
