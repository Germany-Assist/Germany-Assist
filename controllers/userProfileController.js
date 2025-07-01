import User from "../database/models/users.js";
import bcrypt from "bcrypt";

export const createUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      confirmedPassword,
      DOP,
      image,
    } = req.body;
    if (!firstName || !email || !password || !confirmedPassword) {
      return res.status(400).json({ message: "Enter empty fields" });
    }
    if (password != confirmedPassword) {
      return res
        .status(400)
        .json({ message: "Password doesn't match confirmed password" });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "email already existing" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = User.create({
      firstName,
      lastName,
      email,
      password,
      password: hashedPassword,
      confirmedPassword: hashedPassword,
      DOP,
      image,
    });

    const {
      password: _,
      confirmedPassword: __,
      ...userResponse
    } = User.toJSON();
    return res.status(201).json({
      message: "Successfully created new user",
      user: userResponse,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error creating user ${error}`,
    });
  }
};
