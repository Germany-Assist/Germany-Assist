import express from "express";
import * as providerController from "../controllers/provider.controller.js";
const providerRouter = express.Router();

providerRouter.post("/", providerController.createProvider);
providerRouter.get("/", providerController.getAllProviders);
providerRouter.get("/:id", providerController.getProviderById);
providerRouter.get("/email/:email", providerController.getProviderByEmail);
providerRouter.put("/:id", providerController.updateProvider);
providerRouter.delete("/:id", providerController.deleteProvider);
providerRouter.post("/:id/restore", providerController.restoreProvider);
providerRouter.patch("/:id/views", providerController.incrementViews);
providerRouter.patch("/:id/rating", providerController.updateProviderRating);

export default providerRouter;
