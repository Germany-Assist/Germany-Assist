import { Router } from "express";
import bodyParser from "body-parser";
import paymentController from "../controllers/payment.controller.js";

const paymentsRouter = Router();

paymentsRouter.post(
  "/webhook",
  bodyParser.raw({ type: "application/json" }),
  paymentController.processPaymentWebhook
);

export default paymentsRouter;
