import { db } from "../../../prisma/db.js";
import type { CreateUserInput } from "../user.types.js";

export const findUserByEmail = async (email: string) => {
  return db.orm.public.User.first({
    email,
  });
};

export const findAllUsers = async () => {
  return db.orm.public.User.all();
};

export const createUser = async (data: CreateUserInput) => {
  return db.orm.public.User.create({
    username: data.username,
    full_name: data.full_name,
    email: data.email,
    password: data.password,
  });
};
