import { Router } from "express";
import timelineController from "./timeline.controller.js";
import jwtUtils from "../../middlewares/jwt.middleware.js";
import { idHashedParamValidator } from "../../validators/general.validators.js";
import { validateExpress } from "../../middlewares/expressValidator.js";
import { createTimelineValidator } from "./timeline.validator.js";
const timelineRouter = Router();

timelineRouter.post(
  "/:id",
  jwtUtils.authenticateJwt,
  createTimelineValidator,
  validateExpress,
  timelineController.newTimeline
);
timelineRouter.get(
  "/client/:id",
  jwtUtils.authenticateJwt,
  idHashedParamValidator,
  validateExpress,
  timelineController.getTimelineByIdClient
);
timelineRouter.get(
  "/serviceProvider/:id",
  jwtUtils.authenticateJwt,
  idHashedParamValidator,
  validateExpress,
  timelineController.getTimelineById
);
export default timelineRouter;
