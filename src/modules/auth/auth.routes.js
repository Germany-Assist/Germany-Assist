import express from "express";
import authController from "./auth.controller.js";
import { loginValidators } from "./auth.validators.js";
import { validateExpress } from "../../middlewares/expressValidator.js";
import jwtUtils from "../../middlewares/jwt.middleware.js";

const authRouter = express.Router();

authRouter.post("/google", authController.googleAuthController);

authRouter.get("/verifyAccount", authController.verifyAccount);

authRouter.post(
  "/login",
  loginValidators,
  validateExpress,
  authController.login
);
authRouter.get(
  "/login",
  jwtUtils.authenticateJwt,
  authController.loginUserTokenController
);
authRouter.get(
  "/profile",
  jwtUtils.authenticateJwt,
  authController.getUserProfile
);
authRouter.post("/refresh-token", authController.refreshUserToken);
// authRouter.get("/logout", (req, res, next) => {
//   res.clearCookie("refreshToken", userControllers.cookieOptions);
//   res.sendStatus(200);
// });
authRouter.get(
  "/admin/verify/:id",
  jwtUtils.authenticateJwt,
  authController.verifyUserManual
);
export default authRouter;
