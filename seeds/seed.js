import { sequelize } from "../database/connection.js";
import User from "../database/models/users.js";
import Review from "../database/models/review.js";
import { v4 as uuidv4 } from "uuid"; 

async function seed() {
  try {
    await sequelize.authenticate();
    console.log("DB connected...");

    /**
     * Insert new user to DB
     */
    const user = await User.create  ({
       
      firstName: "Muna",
      secondName: "Zeer",
      email: `munaelzeer${Date.now()}@gmail.com`,
      password: "1234",
    });

    /**
     * Insert new column to Review Table
     */
    await  Review.create({
      userId: user.id,
      rating: 4.5,
      comment: "I like this product So I need to request more quantity later",
      target_id: uuidv4(),
      target_type_id: "product",
    });
    console.log("Tables seeding successfully");
  } catch (error) {
    console.error("Tables failed seeding ", error);
  }finally {
    await sequelize.close();
  }
}

seed();
