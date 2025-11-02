import { DataTypes, Model } from "sequelize";
import { sequelize } from "../connection.js";

class User extends Model {}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
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
      isUrl: {
        args: {
          require_tld: false,
          require_protocol: true,
          allow_underscores: true,
          allow_trailing_dot: true,
          allow_protocol_relative_urls: false,
          host_whitelist: ["localhost", "127.0.0.1"],
        },
        msg: "Image must be a valid URL",
      },
      validate: {
        isValidExt(value) {
          if (value && !/\.(jpg|jpeg|png|gif|webp)$/i.test(value)) {
            throw new Error(
              "Image URL must end with .jpg, .jpeg, .png, .webp, or .gif"
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
