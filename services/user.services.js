import { Model, Op } from "sequelize";
import db from "../database/dbIndex.js";
import { hashPassword, hashCompare } from "../utils/bycrypt.util.js";
import { AppError } from "../utils/error.class.js";
import { sequelize } from "../database/connection.js";
// import { checkUserOnline } from "../app.js";
// import { updateLastFetchAll } from "./chat.controller.js";

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

export const listUserFriends = async (socket) => {
  let userId = socket.userId;
  const friendsChat = await db.Chat.findAll({
    where: {
      [Op.or]: [{ participant1: userId }, { participant2: userId }],
    },
    include: [
      {
        model: db.User,
        as: "userToP1",
        where: { id: { [Op.ne]: userId } },
        attributes: ["id", "firstName", "lastName", "email", "image"],
        required: false,
      },
      {
        model: db.User,
        as: "userToP2",
        where: { id: { [Op.ne]: userId } },
        attributes: ["id", "firstName", "lastName", "email", "image"],
        required: false,
      },
    ],
    distinct: true,
  });
  const friendsToNotify = friendsChat.map((i) => {
    return i.userToP1 ? i.userToP1.id : i.userToP2.id;
  });
  socket.emit("friends", friendsChat);
  // const timeStamp = await updateLastFetchAll(userId);

  return { friendsToNotify, timeStamp };
};
