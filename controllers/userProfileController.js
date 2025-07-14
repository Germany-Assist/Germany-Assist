import db from "../database/dbIndex.js";
import { hashPassword, hashCompare } from "../utils/bycrypt.util.js";
import { AppError } from "../utils/error.class.js";

export const createUser = async (userData) => {
  const { firstName, lastName, email, DOB, image } = userData;
  const password = hashPassword(userData.password);
  return await db.User.create({
    firstName,
    lastName,
    email,
    DOB,
    image,
    password,
  });
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
  if (!user)
    throw new AppError(401, "User not found", true, "invalid credentials");
  await user.destroy();
  return user;
};

// export const listUsers = async (page = 1, limit = 10) => {
//   const offset = (page - 1) * limit;
//   return await db.User.findAll({
//     attributes: { exclude: ["password"] },
//     limit,
//     offset,
//     order: [["createdAt", "DESC"]],
//   });
// };
