import express from "express";
import authController from "../controllers/auth.controller.js";

const authRouter = express.Router();

authRouter.post("/google", authController.googleAuthController);

export default authRouter;
