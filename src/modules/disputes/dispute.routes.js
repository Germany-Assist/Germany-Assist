import express from "express";
import disputeController from "./dispute.controllers.js";
import jwtUtils from "../../middlewares/jwt.middleware.js";

const router = express.Router();

// open dispute should be for `users`
router.post("/", jwtUtils.authenticateJwt, disputeController.openDispute);
// this for all parties depending on the role and id
router.get(
  "/",
  jwtUtils.authenticateJwt,
  disputeController.listDisputesProvider,
);

router.get("/:id", disputeController.getDispute);
router.patch("/:id/review", disputeController.markInReview);
router.patch("/:id/resolve", disputeController.resolveDispute);

export default router;
