import { Router } from "express";
import postController from "../controllers/post.controller.js";
import jwtUtils from "../middlewares/jwt.middleware.js";
import commentRouter from "./comment.routes.js";
const postRouter = Router();
postRouter.use("/comment", commentRouter);
postRouter.post("/", jwtUtils.authenticateJwt, postController.createNewPost);

export default postRouter;
