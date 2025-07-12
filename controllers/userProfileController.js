import User from "../database/models/users.js";
import bcrypt from "bcrypt";
import db from "../database/dbIndex.js";
import { hashPassword, hashCompare } from "../utils/bycrypt.util.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../middlewares/jwt.middleware.js";
import { NODE_ENV } from "../configs/serverConfig.js";
export const createUser = async (userData) => {
  const { firstName, lastName, email, DOP, image } = userData;
  const password = hashPassword(userData.password);
  return await db.User.create({
    firstName,
    lastName,
    email,
    DOP,
    image,
    password,
  });
};

export const loginUser = async (userData) => {
  const { email, password } = userData;
  const user = await getUserByEmail(email);
  if (!user) throw new Error("user not found");
  const compare = hashCompare(password, user.password);
  if (!compare) throw new Error("wrong password");
  return user;
};

// export const loginUserToken = async ()

// Get user by ID (excludes password)
export const getUserById = async (id) => {
  const user = await db.User.findByPk(id, {
    attributes: { exclude: ["password"] },
  });
  if (!user) throw new Error("no user found");
  return user;
};

const getUserByEmail = async (email) => {
  return await db.User.findOne({ where: { email } });
};

// Update user
export const updateUser = async (id, updates) => {
  const user = await db.User.findByPk(id);
  if (!user) throw new Error("User not found");
  return await user.update(updates);
};

// Soft-delete user (paranoid mode)
export const deleteUser = async (id) => {
  const user = await db.User.findByPk(id);
  if (!user) throw new Error("User not found");
  await user.destroy();
  return { message: "User deleted" };
};

// List all users (paginated, excludes passwords)
export const listUsers = async (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  return await db.User.findAll({
    attributes: { exclude: ["password"] },
    limit,
    offset,
    order: [["createdAt", "DESC"]],
  });
};
