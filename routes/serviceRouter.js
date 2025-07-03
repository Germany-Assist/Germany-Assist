import { Router } from "express";
import { getUserWithServices } from "../controllers/userServiceController.js";
export const serviceRouter = Router();

serviceRouter.get("/:userId",getUserWithServices);