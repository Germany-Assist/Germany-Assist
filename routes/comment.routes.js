import { Router } from "express";
import commentController from "../controllers/comment.controller.js";
import jwtUtils from "../middlewares/jwt.middleware.js";
import { validateExpress } from "../middlewares/expressValidator.js";
import { commentValidator } from "../validators/comment.validator.js";

const commentRouter = Router();

commentRouter.post(
  "/",
  jwtUtils.authenticateJwt,
  commentValidator,
  validateExpress,
  commentController.createNewComment
);

export default commentRouter;
