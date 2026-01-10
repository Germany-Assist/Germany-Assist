import { Router } from "express";
import metaController from "./meta.controllers.js";
const metaRouter = Router();

metaRouter.get("/", metaController.initCall);
export default metaRouter;
