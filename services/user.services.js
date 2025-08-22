import { Model, Op } from "sequelize";
import db from "../database/dbIndex.js";
import { hashPassword, hashCompare } from "../utils/bcrypt.util.js";
import { AppError } from "../utils/error.class.js";
import { sequelize } from "../database/connection.js";

export const createUser = async (userData, t) => {
  return await db.User.create(userData, { transaction: t, raw: true });
};

export const loginUser = async (userData) => {
  const { email, password } = userData;
  const user = await getUserByEmail(email);
  if (!user)
    throw new AppError(401, "User not found", true, "invalid credentials");
  const compare = hashCompare(password, user.password);
  if (!compare)
    throw new AppError(401, "wrong password", true, "invalid credentials");
  return user;
};

export const getUserById = async (id) => {
  const user = await db.User.findByPk(id, {
    attributes: { exclude: ["password"] },
  });
  if (!user)
    throw new AppError(401, "User not found", true, "invalid credentials");
  return user;
};
export const userExists = async (id) => {
  try {
    let x = await getUserById(id);
    return true;
  } catch (error) {
    return false;
  }
};
const getUserByEmail = async (email) => {
  return await db.User.findOne({ where: { email } });
};

export const updateUser = async (id, updates) => {
  const user = await db.User.findByPk(id);
  if (!user)
    throw new AppError(401, "User not found", true, "invalid credentials");
  return await user.update(updates);
};

export const deleteUser = async (id) => {
  const user = await db.User.findByPk(id);
  if (!user) throw new AppError(401, "User not found", true, "User not found");
  await user.destroy();
  return user;
};
export const alterUserVerification = async (id, status) => {
  const user = await db.User.findByPk(id);
  if (!user)
    throw new AppError(401, "User not found", true, "invalid credentials");
  return await user.update({ isVerified: status });
};

export const getAllUsers = async () => {
  const users = await db.User.findAll({
    attributes: { exclude: ["password"] },
    raw: true,
  });
  return users;
};
export const getBusinessReps = async (BusinessId) => {
  const reps = await db.User.findAll({
    where: { BusinessId },
    attributes: { exclude: ["password"] },
    raw: true,
  });
  return reps;
};
export default {
  createUser,
  loginUser,
  getUserById,
  alterUserVerification,
  deleteUser,
  updateUser,
  userExists,
  getAllUsers,
  getBusinessReps,
};
