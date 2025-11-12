import { Router } from "express";
import timelineController from "../controllers/timeline.controller.js";
import jwtUtils from "../middlewares/jwt.middleware.js";
import { idHashedParamValidator } from "../validators/general.validators.js";
import { validateExpress } from "../middlewares/expressValidator.js";
import { createTimelineValidator } from "../validators/timeline.validator.js";
const timelineRouter = Router();

timelineRouter.post(
  "/:id",
  jwtUtils.authenticateJwt,
  createTimelineValidator,
  validateExpress,
  timelineController.newTimeline
);
timelineRouter.get(
  "/:id",
  jwtUtils.authenticateJwt,
  idHashedParamValidator,
  validateExpress,
  timelineController.getTimelineById
);
export default timelineRouter;
