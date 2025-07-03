import User from "../database/models/users.js";
import bcrypt from "bcrypt";
class UserProfileController {
  createUser = async (req, res) => {
    try {
      const {
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
        DOP,
        image,
      } = req.body;
      if (!firstName || !email || !password || !confirmPassword) {
        return res.status(400).json({ message: "Enter empty fields" });
      }
      if (password != confirmPassword) {
        return res
          .status(400)
          .json({ message: "Password doesn't match confirmed password" });
      }

      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: "email already existing" });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await User.create({
        firstName,
        lastName,
        email,
        password,
        password: hashedPassword,
        confirmPassword: hashedPassword,
        DOP,
        image,
      });

      const userResponse = newUser.toJSON();
      delete userResponse.password;
          return res.status(201).json({ message: "User created successfully", user: userResponse });

    } catch (error) {
      return res.status(500).json({
        message: `Error creating user ${error}`,
      });
    }
  };
    getUser=async(req,res)=>{
    try {
        const {id}=req.params;
        const user = await User.findByPk(id,{
           attributes:{exclude:["password"]},
        });

        if(!user){
            return res.status(404).json({
                message:"User not found"
            });
        }
        return res.status(200).json({message:"get user successfully",user});

    } catch (error) {
        return res.status(500).json({message:`Internal server error ${error}`});
    }
   }
}

export const userProfileController = new UserProfileController();
