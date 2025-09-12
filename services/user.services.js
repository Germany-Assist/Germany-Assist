import db from "../database/dbIndex.js";
import bcryptUtil from "../utils/bcrypt.util.js";
import { AppError } from "../utils/error.class.js";

export const createUser = async (userData, t) => {
  return await db.User.create(userData, {
    transaction: t,
    include: { model: db.UserRole },
  });
};

export const createUserRole = async (
  user_id,
  role,
  related_type,
  related_id,
  t
) => {
  return await db.UserRole.create(
    { user_id, related_id: related_id ?? null, related_type, role },
    { transaction: t, raw: true }
  );
};

export const loginUser = async (userData) => {
  const { email, password } = userData;
  const user = await getUserByEmail(email);
  if (!user)
    throw new AppError(401, "User not found", true, "invalid credentials");
  const compare = bcryptUtil.hashCompare(password, user.password);
  if (!compare)
    throw new AppError(401, "wrong password", true, "invalid credentials");
  return user;
};

export const getUserById = async (id) => {
  const user = await db.User.findByPk(id, {
    attributes: { exclude: ["password"] },
    include: { model: db.UserRole },
    nest: false,
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
  return await db.User.findOne({
    where: { email },
    include: { model: db.UserRole },
    nest: false,
  });
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
  return await user.update({ is_verified: status });
};

export const getAllUsers = async () => {
  const users = await db.User.findAll({
    attributes: { exclude: ["password"] },
    include: { model: db.UserRole },
  });
  return users;
};
export const getBusinessReps = async (related_id) => {
  const reps = await db.User.findAll({
    attributes: { exclude: ["password"] },
    include: { model: db.UserRole, where: { related_id } },
  });
  return reps;
};
export const getUserProfile = async (id) => {
  const reps = await db.User.findByPk(id, {
    attributes: { exclude: ["password"] },
    include: [
      { model: db.UserRole },
      {
        model: db.Service,
        as: "services",
        through: {
          attributes: ["id", "type"],
        },
        attributes: ["id"],
      },
    ],
  });
  return reps;
};

//
export default {
  getUserProfile,
  createUser,
  createUserRole,
  loginUser,
  getUserById,
  alterUserVerification,
  deleteUser,
  updateUser,
  userExists,
  getAllUsers,
  getBusinessReps,
};
