import { Router } from "express";
import {
  createUserValidators,
  loginValidators,
} from "../validators/userValidators.js";
import { validateExpress } from "../middlewares/expressValidator.js";
import * as userControllers from "../controllers/userProfileController.js";
import { authenticateJwt } from "../middlewares/jwt.middleware.js";
export const userRouter = Router();

// register and i will give you new access token and refresh token in a cookie
userRouter.post(
  "/",
  createUserValidators,
  validateExpress,
  userControllers.createUserController
);
// give me user name and password and i will give you new access token and refresh token in a cookie
userRouter.post(
  "/login",
  loginValidators,
  validateExpress,
  userControllers.loginUserController
);
// // i will delete your cookie
userRouter.get("/logout", (req, res, next) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  });
  res.sendStatus(200);
});
//send me you refresh token cookie and shall give u new access token
userRouter.post("/refresh-token", userControllers.refreshUserToken);

//send me your token and i will send you your profile back
userRouter.get(
  "/login",
  authenticateJwt,
  userControllers.loginUserTokenController
);

// this needs to be discused further snice we need polices to know what should be alowed to be updated
// userRouter.patch("/:id", async (req, res, next) => {
//   updateUser;
// });
