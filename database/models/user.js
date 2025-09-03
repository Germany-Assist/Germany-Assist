import { DataTypes, Model } from "sequelize";
import { sequelize } from "../connection.js";

class User extends Model {}

User.init(
  {
    first_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: { msg: "First name is required" },
        len: {
          args: [2, 50],
          msg: "First name must be between 2 and 50 characters",
        },
        is: {
          args: /^[a-zA-Z\s'-]+$/i,
          msg: "First name can only contain letters, spaces, hyphens, and apostrophes",
        },
      },
    },
    last_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: { msg: "Last name is required" },
        len: {
          args: [2, 50],
          msg: "Last name must be between 2 and 50 characters",
        },
        is: {
          args: /^[a-zA-Z\s'-]+$/i,
          msg: "Last name can only contain letters, spaces, hyphens, and apostrophes",
        },
      },
    },
    fullName: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.first_name + " " + this.last_name;
      },
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: { msg: "Email already in use" },
      validate: {
        notEmpty: { msg: "Email is required" },
        isEmail: { msg: "Invalid email format" },
      },
    },
    password: {
      type: DataTypes.STRING(60), // bcrypt hash length
      allowNull: false,
      validate: {
        notEmpty: { msg: "Password is required" },
        len: {
          args: [8, 100],
          msg: "Password must be at least 8 characters long",
        },
        isStrong(value) {
          if (!/[A-Z]/.test(value))
            throw new Error(
              "Password must contain at least one uppercase letter"
            );
          if (!/[a-z]/.test(value))
            throw new Error(
              "Password must contain at least one lowercase letter"
            );
          if (!/[0-9]/.test(value))
            throw new Error("Password must contain at least one number");
          if (!/[^a-zA-Z0-9]/.test(value))
            throw new Error(
              "Password must contain at least one special character"
            );
        },
      },
    },
    dob: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: { msg: "Invalid date format (YYYY-MM-DD)" },
      },
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    is_root: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    image: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        isUrl: { msg: "Image must be a valid URL" },
        isValidExt(value) {
          if (value && !/\.(jpg|jpeg|png|gif)$/i.test(value)) {
            throw new Error(
              "Image URL must end with .jpg, .jpeg, .png, or .gif"
            );
          }
        },
      },
    },
  },
  {
    sequelize,
    paranoid: true,
    modelName: "User",
  }
);

export default User;
