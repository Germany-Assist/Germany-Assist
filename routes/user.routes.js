import { Router } from "express";
import {
  createUserValidators,
  loginValidators,
} from "../validators/userValidators.js";
import { validateExpress } from "../middlewares/expressValidator.js";
import * as userControllers from "../controllers/user.controller.js";
import jwt from "../middlewares/jwt.middleware.js";
import { hashIdDecode } from "../utils/hashId.util.js";
const userRouter = Router();

userRouter.post(
  "/",
  createUserValidators,
  validateExpress,
  userControllers.createUserController("client", true)
);
userRouter.post(
  "/admin",
  jwt.authenticateJwt,
  createUserValidators,
  validateExpress,
  userControllers.createUserController("admin", true)
);
userRouter.post(
  "/rep",
  jwt.authenticateJwt,
  createUserValidators,
  validateExpress,
  userControllers.createUserController("rep", false)
);
userRouter.post(
  "/login",
  loginValidators,
  validateExpress,
  userControllers.loginUserController
);
userRouter.get("/logout", (req, res, next) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  });
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
userRouter.post("/refresh-token", userControllers.refreshUserToken);
userRouter.get("/admin/all", jwt.authenticateJwt, userControllers.getAllUsers);
userRouter.get(
  "/root/rep",
  jwt.authenticateJwt,
  userControllers.getBusinessReps
);
export default userRouter;
