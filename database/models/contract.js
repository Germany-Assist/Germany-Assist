import { DataTypes, Model } from "sequelize";
import { sequelize } from "../connection.js";

class Contract extends Model {}

Contract.init(
  {
    name: {
      type: DataTypes.CHAR(50),
      allowNull: false,
      validate: {
        notEmpty: { msg: "Name cannot be empty" },
        len: { args: [3, 50], msg: "Name must be between 3 and 50 characters" },
      },
    },
    about: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: { msg: "About cannot be empty" },
        len: {
          args: [10, 5000],
          msg: "About must be between 10 and 5000 characters",
        },
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: { msg: "Description cannot be empty" },
        len: {
          args: [10, 5000],
          msg: "Description must be between 10 and 5000 characters",
        },
      },
    },
    views: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      validate: {
        isInt: { msg: "views must be an integer" },
        min: { args: [0], msg: "views cannot be negative" },
      },
    },
    contract: {
      type: DataTypes.JSON,
      allowNull: false,
      validate: {
        notEmpty: { msg: "Contract content cannot be empty" },
        isValidContract(value) {
          if (
            typeof value !== "object" ||
            Array.isArray(value) ||
            value === null
          ) {
            throw new Error("Contract must be a valid JSON object");
          }
          // Optional: check for required keys
          const requiredKeys = ["startDate", "endDate", "terms"];
          const missingKeys = requiredKeys.filter((key) => !(key in value));
          if (missingKeys.length > 0) {
            throw new Error(
              `Contract is missing required keys: ${missingKeys.join(", ")}`
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

export default Contract;
