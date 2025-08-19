import { Router } from "express";
import {
  createUserValidators,
  loginValidators,
} from "../validators/userValidators.js";
import { validateExpress } from "../middlewares/expressValidator.js";
import * as userControllers from "../controllers/user.controller.js";
import { authenticateJwt } from "../middlewares/jwt.middleware.js";
import { hashIdDecode } from "../utils/hashId.util.js";
import { authorizeRequest } from "../middlewares/authorize.checkpoint.js";
const userRouter = Router();

userRouter.post(
  "/",
  createUserValidators,
  validateExpress,
  userControllers.createUserController("client", true)
);
userRouter.post(
  "/admin",
  authenticateJwt,
  createUserValidators,
  validateExpress,
  authorizeRequest(["superAdmin", "admin"], true, "user", "create", false),
  userControllers.createUserController("admin", true)
);
userRouter.post(
  "/rep",
  authenticateJwt,
  createUserValidators,
  validateExpress,
  authorizeRequest(["root"], true, "user", "create"),
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
userRouter.post("/refresh-token", userControllers.refreshUserToken);

userRouter.get(
  "/login",
  authenticateJwt,
  userControllers.loginUserTokenController
);

userRouter.get(
  "/admin/all",
  authenticateJwt,
  authorizeRequest(["admin", "superAdmin"], true, "user", "read"),
  userControllers.getAllUsers
);
userRouter.get(
  "/root/rep",
  authenticateJwt,
  authorizeRequest(["root", "rep"], true, "user", "read"),
  userControllers.getAllRepsScope
);

export default userRouter;
