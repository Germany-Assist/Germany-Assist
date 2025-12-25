import { Op } from "sequelize";
import { sequelize } from "../../configs/database.js";
import db from "../../database/index.js";
import userRepository from "../user/user.repository.js";

const activateUser = async (hashedToken, t) => {
  const [, [dbToken]] = await db.Token.update(
    { isValid: false },
    {
      where: {
        token: hashedToken,
        isValid: true,
        expiresAt: { [Op.gt]: new Date() },
      },
      returning: true,
      transaction: t,
    }
  );
  return dbToken;
};
const createToken = async (tokenData, t) => {
  return await db.Token.create(tokenData, { transaction: t });
};
const authRepository = { activateUser, createToken };
export default authRepository;
