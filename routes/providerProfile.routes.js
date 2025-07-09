import express from "express";
import {
  createProviderProfile,
  getAllProviderProfiles,
  getProviderProfileById,
  getProviderProfileByEmail,
  updateProviderProfile,
  deleteProviderProfile,
  restoreProviderProfile,
  incrementProfileViews,
  updateProfileRating,
} from "../controllers/providerProfile.controller.js";

const providerProfileRouter = express.Router();

providerProfileRouter.post("/", async (req, res, next) => {
  try {
    const profile = await createProviderProfile(req.body);
    res.status(201).json(profile);
  } catch (error) {
    next(error);
  }
});

providerProfileRouter.get("/", async (req, res, next) => {
  try {
    const filters = req.query;
    const profiles = await getAllProviderProfiles(filters);
    res.send(profiles);
  } catch (error) {
    next(error);
  }
});

providerProfileRouter.get("/:id", async (req, res, next) => {
  try {
    const profile = await getProviderProfileById(parseInt(req.params.id));
    res.send(profile);
  } catch (error) {
    next(error);
  }
});

providerProfileRouter.get("/email/:email", async (req, res, next) => {
  try {
    const profiles = await getProviderProfileByEmail(req.params.email);
    res.status(200).json(profiles);
  } catch (error) {
    next(error);
  }
});

providerProfileRouter.put("/:id", async (req, res, next) => {
  try {
    const profile = await updateProviderProfile(
      parseInt(req.params.id),
      req.body
    );
    res.send(profile);
  } catch (error) {
    next(error);
  }
});

providerProfileRouter.delete("/:id", async (req, res, next) => {
  try {
    const result = await deleteProviderProfile(parseInt(req.params.id));
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
});

providerProfileRouter.post("/:id/restore", async (req, res, next) => {
  try {
    const profile = await restoreProviderProfile(parseInt(req.params.id));
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
});

providerProfileRouter.patch("/:id/views", async (req, res, next) => {
  try {
    const profile = await incrementProfileViews(parseInt(req.params.id));
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
});

providerProfileRouter.patch("/:id/rating", async (req, res, next) => {
  try {
    const { rating } = req.body;
    const profile = await updateProfileRating(
      parseInt(req.params.id),
      parseFloat(rating)
    );
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
});

export default providerProfileRouter;
