import { DataTypes, Model } from "sequelize";
import { sequelize } from "../connection.js";
import { v4 as uuidv4 } from "uuid";
import { AppError } from "../../utils/error.class.js";

class Chat extends Model {}

Chat.init(
  {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: uuidv4,
      unique: true,
      primaryKey: true,
      validate: {
        isUUID: { args: 4, msg: "ID must be a valid UUIDv4" },
      },
    },
    conversation: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: sequelize.literal("'[]'::jsonb"),
      validate: {
        isArray(value) {
          if (!Array.isArray(value)) {
            throw new AppError(422, "Conversation must be an array", false);
          }
        },
      },
    },
    participants: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: sequelize.literal("'{}'::jsonb"),
      validate: {
        isObject(value) {
          if (
            typeof value !== "object" ||
            Array.isArray(value) ||
            value === null
          ) {
            throw new AppError(422, "Participants must be an object", false);
          }
        },
        hasAtLeastTwoParticipants(value) {
          if (Object.keys(value).length < 2) {
            throw new AppError(
              422,
              "There must be at least two participants",
              false
            );
          }
        },
      },
    },
  },
  {
    sequelize,
    paranoid: true,
  }
);

export default Chat;
