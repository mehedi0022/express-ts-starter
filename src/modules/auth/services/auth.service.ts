import { AppError } from "../../../errors/AppError.js";

import { hashPassword, verifyPassword } from "../../../utils/password.util.js";

import * as userRepository from "../../user/repositories/user.repository.js";

import type { LoginInput, RegisterInput } from "../auth.types.js";

export const register = async (data: RegisterInput) => {
  const existingUser = await userRepository.findUserByEmail(data.email);

  if (existingUser) {
    throw new AppError("User already exists with this email", 409);
  }

  const hashedPassword = await hashPassword(data.password);

  const user = await userRepository.createUser({
    ...data,
    password: hashedPassword,
  });

  const { password: _password, ...safeUser } = user;

  return safeUser;
};

export const login = async (data: LoginInput) => {
  const user = await userRepository.findUserByEmail(data.email);

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const isPasswordValid = await verifyPassword(user.password, data.password);

  if (!isPasswordValid) {
    throw new AppError("Invalid email or password", 401);
  }

  const { password: _password, ...safeUser } = user;

  return safeUser;
};
