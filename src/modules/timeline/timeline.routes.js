import { Router } from "express";
import timelineController from "./timeline.controller.js";
import jwtUtils from "../../middlewares/jwt.middleware.js";
import { idHashedParamValidator } from "../../validators/general.validators.js";
import { validateExpress } from "../../middlewares/expressValidator.js";
import { createTimelineValidator } from "./timeline.validator.js";
const timelineRouter = Router();
// provider should create or delete or suspendTimeline

// timelineRouter.post(
//   "/provider/:id",
//   jwtUtils.authenticateJwt,
//   createTimelineValidator,
//   validateExpress,
//   timelineController.newTimeline
// );
// FLAG where i stopped i should return the timeline with a posts etc
timelineRouter.get(
  "/client/readTimeline/:timelineId",
  jwtUtils.authenticateJwt,
  idHashedParamValidator,
  validateExpress,
  timelineController.getTimelineByIdForClient,
);

export default timelineRouter;
