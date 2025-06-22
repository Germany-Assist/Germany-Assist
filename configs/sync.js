import { sequelize } from "../database/connection.js";
import User from "../database/models/users.js";
import Review from "../database/models/review.js"; 


Review.belongsTo(User,{foreignKey:"user_id",onDelete:"CASCADE"});
User.hasMany(Review,{foreignKey:"user_id"});

async function migrate(){
    try {
        await sequelize.authenticate();
        console.log("Database establish correctly ");

        await sequelize.sync({alter:true});
        console.log("All models are migrated successfully");
        
    } catch (error) {
        console.error("Migration is failed",error);
    }
    finally{
        sequelize.close();
    }
}
migrate();
