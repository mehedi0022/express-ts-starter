import { db } from "../../../prisma/db.js";
import { toPublicUserDto } from "../user.dto.js";

type CreateUserData = {
  userName: string;
  fullName: string;
  email: string;
  password: string;
};

export const findUserByEmail = async (email: string) => {
  return db.orm.public.User
    .select(
      "id",
      "email",
      "userName",
      "fullName",
      "password",
      "role",
      "createdAt",
      "updatedAt",
    )
    .first({ email });
};

export const findAllUsers = async () => {
  const users = await db.orm.public.User
    .select("id", "email", "userName", "fullName", "role", "createdAt", "updatedAt")
    .all();

  return users.map(toPublicUserDto);
};

export const createUser = async (data: CreateUserData) => {
  const user = await db.orm.public.User
    .select("id", "email", "userName", "fullName", "role", "createdAt", "updatedAt")
    .create({
      userName: data.userName,
      fullName: data.fullName,
      email: data.email,
      password: data.password,
    });

  return toPublicUserDto(user);
};

export const findAuthorizationUserById = (id: number) =>
  db.orm.public.User.select("id", "role").first({ id });

export const findUserById = async (id: number) => {
  const user = await db.orm.public.User
    .select("id", "email", "userName", "fullName", "role", "createdAt", "updatedAt")
    .first({ id });
  return user ? toPublicUserDto(user) : null;
};

export const updateUserById = async (
  id: number,
  data: { userName?: string | null; fullName?: string | null },
) => {
  const user = await db.orm.public.User
    .where({ id })
    .select("id", "email", "userName", "fullName", "role", "createdAt", "updatedAt")
    .update(data);
  return user ? toPublicUserDto(user) : null;
};

export const deleteUserById = async (id: number) => {
  const user = await db.orm.public.User
    .where({ id })
    .select("id", "email", "userName", "fullName", "role", "createdAt", "updatedAt")
    .delete();
  return user ? toPublicUserDto(user) : null;
};
