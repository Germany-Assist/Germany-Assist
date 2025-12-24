import { Router } from "express";
import { createUserValidators, loginValidators } from "./userValidators.js";
import { validateExpress } from "../../middlewares/expressValidator.js";
import * as userControllers from "./user.controller.js";
import jwt from "../../middlewares/jwt.middleware.js";
const userRouter = Router();

userRouter.post(
  "/",
  createUserValidators,
  validateExpress,
  userControllers.createClientController
);
userRouter.post(
  "/admin",
  jwt.authenticateJwt,
  createUserValidators,
  validateExpress,
  userControllers.createAdminController
);
userRouter.post(
  "/rep",
  jwt.authenticateJwt,
  createUserValidators,
  validateExpress,
  userControllers.createRepController
);
userRouter.post(
  "/login",
  loginValidators,
  validateExpress,
  userControllers.loginUserController
);
userRouter.get("/logout", (req, res, next) => {
  res.clearCookie("refreshToken", userControllers.cookieOptions);
  res.sendStatus(200);
});
userRouter.get(
  "/admin/verify/:id",
  jwt.authenticateJwt,
  userControllers.verifyUser
);
userRouter.get(
  "/login",
  jwt.authenticateJwt,
  userControllers.loginUserTokenController
);
userRouter.get("/profile", jwt.authenticateJwt, userControllers.getUserProfile);
userRouter.post("/refresh-token", userControllers.refreshUserToken);
userRouter.get("/admin/all", jwt.authenticateJwt, userControllers.getAllUsers);
userRouter.get(
  "/root/rep",
  jwt.authenticateJwt,
  userControllers.getBusinessReps
);
export default userRouter;
