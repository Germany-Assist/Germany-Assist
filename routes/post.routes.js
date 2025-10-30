import { Router } from "express";
import postController from "../controllers/post.controller.js";
import jwtUtils from "../middlewares/jwt.middleware.js";
const postRouter = Router();

postRouter.post("/", jwtUtils.authenticateJwt, postController.createNewPost);

export default postRouter;
