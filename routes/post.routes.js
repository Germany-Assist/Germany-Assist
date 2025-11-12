import { Router } from "express";
import postController from "../controllers/post.controller.js";
import jwtUtils from "../middlewares/jwt.middleware.js";
import commentRouter from "./comment.routes.js";
import { createPostValidator } from "../validators/post.validator.js";
import { validateExpress } from "../middlewares/expressValidator.js";
const postRouter = Router();
postRouter.use("/comment", commentRouter);
postRouter.post(
  "/",
  jwtUtils.authenticateJwt,
  createPostValidator,
  validateExpress,
  postController.createNewPost
);

export default postRouter;
