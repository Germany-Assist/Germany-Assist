import { DataTypes, Model } from "sequelize";
import { sequelize } from "../connection.js";
import { v4 as uuidv4 } from "uuid";

class Chat extends Model {}

Chat.init(
  {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: uuidv4,
      unique: true,
      primaryKey: true,
    },
    conversation: {
      type: DataTypes.JSONB,
      defaultValue: sequelize.literal("'[]'::jsonb"),
    },
    participants: {
      type: DataTypes.JSONB,
      defaultValue: sequelize.literal("'{}'::jsonb"),
    },
  },
  {
    sequelize,
    paranoid: true,
  }
);
export default Chat;
