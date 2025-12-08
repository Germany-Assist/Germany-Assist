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

    googleId: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },

    first_name: {
      type: DataTypes.STRING(50),
      allowNull: true, // <-- changed
      validate: {
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
      allowNull: true, // <-- changed
      validate: {
        len: {
          args: [2, 50],
          msg: "Last name must be between 2 and 50 characters",
        },
      },
    },

    fullName: {
      type: DataTypes.VIRTUAL,
      get() {
        if (this.first_name && this.last_name)
          return this.first_name + " " + this.last_name;

        return this.first_name || this.last_name || null;
      },
    },

    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: { msg: "Email already in use" },
      validate: {
        isEmail: { msg: "Invalid email format" },
      },
    },

    password: {
      type: DataTypes.STRING(60),
      allowNull: true, // <-- changed for Google users
      validate: {
        isStrong(value) {
          if (!value) return; // allow null for google users
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
    },

    is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    is_root: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    paranoid: true,
    modelName: "User",
  }
);

export default User;
