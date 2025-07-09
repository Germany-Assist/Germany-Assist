import express from "express";
import {
  createBusinessProfile,
  getAllBusinessProfiles,
  getBusinessProfileById,
  updateBusinessProfile,
  deleteBusinessProfile,
  restoreBusinessProfile,
  incrementProfileViews,
} from "../controllers/businessProfile.controller.js";

const businessProfileRouter = express.Router();
businessProfileRouter.post("/", async (req, res, next) => {
  try {
    const profile = await createBusinessProfile(req.body);
    res.status(201).json(profile);
  } catch (error) {
    next(error);
  }
});

businessProfileRouter.get("/", async (req, res, next) => {
  try {
    const filters = req.query;
    const profiles = await getAllBusinessProfiles(filters);
    res.status(200).json(profiles);
  } catch (error) {
    next(error);
  }
});

businessProfileRouter.get("/:id", async (req, res, next) => {
  try {
    const profile = await getBusinessProfileById(parseInt(req.params.id));
    res.status(200).json(profile);
  } catch (error) {
    next(error);
  }
});

businessProfileRouter.put("/:id", async (req, res, next) => {
  try {
    const profile = await updateBusinessProfile(
      parseInt(req.params.id),
      req.body
    );
    res.status(200).json(profile);
  } catch (error) {
    next(error);
  }
});

businessProfileRouter.delete("/:id", async (req, res, next) => {
  try {
    const result = await deleteBusinessProfile(parseInt(req.params.id));
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
});

businessProfileRouter.post("/:id/restore", async (req, res, next) => {
  try {
    const profile = await restoreBusinessProfile(parseInt(req.params.id));
    res.status(200).json(profile);
  } catch (error) {
    next(error);
  }
});

businessProfileRouter.patch("/:id/views", async (req, res, next) => {
  try {
    const profile = await incrementProfileViews(parseInt(req.params.id));
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
});

export default businessProfileRouter;
