import { Router } from "express";
import postController from "./post.controller.js";
import jwtUtils from "../../middlewares/jwt.middleware.js";
import commentRouter from "../comment/comment.routes.js";
import { createPostValidator } from "./post.validator.js";
import { validateExpress } from "../../middlewares/expressValidator.js";
const postRouter = Router();

postRouter.use("/comment", commentRouter);

postRouter.post(
  "/createNewPost",
  jwtUtils.authenticateJwt,
  createPostValidator,
  validateExpress,
  postController.createNewPost,
);

export default postRouter;
