import { AppError } from "../../../errors/AppError.js";
import { hashPassword } from "../../../utils/password.util.js";
import type { CreateUserInput } from "../user.types.js";
import * as userRepository from "../repositories/user.repository.js";

export const createUser = async (data: CreateUserInput) => {
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

export const getAllUsers = async () => {
  return userRepository.findAllUsers();
};
