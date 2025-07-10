import { Router } from "express";
import { userProfileController } from "../controllers/userProfileController.js";
export const userRouter = Router();

/**
 * user Processing
 */
userRouter.post("/new-user", userProfileController.createUser);
userRouter.get("/:id", userProfileController.getUser);
