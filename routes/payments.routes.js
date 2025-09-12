import { Router } from "express";
import Stripe from "stripe";
import bodyParser from "body-parser";
import { STRIPE_SK, STRIPE_WEBHOOK_SECRET } from "../configs/serverConfig.js";
import db from "../database/dbIndex.js";
import { AppError } from "../utils/error.class.js";
import { sequelize } from "../database/connection.js";
import { Op } from "sequelize";
import { errorLogger, infoLogger } from "../utils/loggers.js";

const paymentsRouter = Router();

const stripe = new Stripe(STRIPE_SK, {
  apiVersion: "2025-08-14",
});

paymentsRouter.post(
  "/webhook",
  bodyParser.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    // verify Stripe webhook signature
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      errorLogger("❌ Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // idempotency check hehehehehe
    const existingEvent = await db.StripeEvent.findByPk(event.id);
    if (existingEvent) {
      infoLogger(`Event ${event.id} already processed`);
      return res.json({ received: true });
    }
    infoLogger(event.type);
    // validate metadata
    const metadata = event.data.object?.metadata;
    if (!metadata || !metadata.items || metadata.items.length < 1) {
      throw new AppError(
        400,
        "recording payment failed: missing metadata/items",
        false
      );
    }

    const items = JSON.parse(metadata.items);

    // begin transaction
    const t = await sequelize.transaction();

    try {
      // save the StripeEvent as pending
      await db.StripeEvent.create(
        {
          id: event.id,
          type: event.type,
          object_id: event.data.object.id,
          payload: event,
          status: "pending",
        },
        { transaction: t }
      );

      // Handle event types
      switch (event.type) {
        case "payment_intent.succeeded": {
          const pi = event.data.object;

          // Update Payment and Order atomically
          await db.Payment.update(
            { status: "succeeded" },
            {
              where: {
                stripe_payment_intent_id: pi.id,
                status: { [Op.ne]: "succeeded" },
              },
              transaction: t,
            }
          );

          await db.Order.update(
            { status: "paid", amount: event.data.object.amount / 100 },
            {
              where: {
                id: pi.metadata.orderId,
                status: { [Op.ne]: "paid" },
              },
              transaction: t,
            }
          );
          await Promise.all(
            items.map((i) =>
              db.OrderItems.update(
                { paid_price: i.item_price },
                { where: { id: i.item_id }, transaction: t }
              )
            )
          );
          break;
        }

        case "payment_intent.payment_failed": {
          const pi = event.data.object;

          await db.Payment.update(
            { status: "failed" },
            {
              where: {
                stripe_payment_intent_id: pi.id,
                status: { [Op.ne]: "failed" },
              },
              transaction: t,
            }
          );

          await db.Order.update(
            { status: "canceled" },
            {
              where: {
                id: pi.metadata.orderId,
                status: { [Op.ne]: "canceled" },
              },
              transaction: t,
            }
          );
          break;
        }
        default:
          console.log(` Unhandled Stripe event type: ${event.type}`);
      }

      //  Mark StripeEvent as processed
      await db.StripeEvent.update(
        { status: "processed" },
        { where: { id: event.id }, transaction: t }
      );

      //  Commit transaction
      await t.commit();
      res.json({ received: true });
    } catch (error) {
      console.error("❌ Transaction failed:", error);
      await t.rollback();
      res.status(500).send("Webhook handling failed");
    }
  }
);

export default paymentsRouter;
