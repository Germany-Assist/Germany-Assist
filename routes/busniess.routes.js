import express from "express";
import * as businessController from "../controllers/business.controller.js";
const businessRouter = express.Router();

businessRouter.post("/", businessController.createBusiness);
businessRouter.get("/", businessController.getAllBusiness);
businessRouter.get("/:id", businessController.getBusinessById);
businessRouter.put("/:id", businessController.updateBusiness);
businessRouter.delete("/:id", businessController.deleteBusiness);
businessRouter.post("/:id/restore", businessController.restoreBusiness);
businessRouter.patch("/:id/views", businessController.incrementViews);

export default businessRouter;
