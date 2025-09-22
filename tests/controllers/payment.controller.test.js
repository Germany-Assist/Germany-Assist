// test/payment.controller.test.js
import test from "node:test";
import assert from "node:assert/strict";
import sinon from "sinon";

import paymentController from "../../controllers/payment.controller.js";
import { processPaymentWebhook } from "../../controllers/payment.controller.js";

import { sequelize } from "../../database/connection.js";
import stripeUtils from "../../utils/stripe.util.js";
import stripeServices, {
  createStripeEvent,
  getStripeEvent,
} from "../../services/stripe.service.js";
import paymentServices from "../../services/payment.service.js";
import orderService from "../../services/order.services.js";
import orderItemServices from "../../services/itemOrder.services.js";
import { AppError } from "../../utils/error.class.js";
import { infoLogger } from "../../utils/loggers.js";

let sandbox;
test.beforeEach(() => {
  sandbox = sinon.createSandbox();
});
test.afterEach(() => {
  sandbox.restore();
});

// ------------------- Tests -------------------

test("should return 400 if webhook verification fails", async () => {
  const req = { body: {}, headers: { "stripe-signature": "sig" } };
  const res = { status: sinon.stub().returnsThis(), send: sinon.spy() };
  const next = sinon.spy();

  sandbox.stub(stripeUtils, "verifyStripeWebhook").returns(null);

  await processPaymentWebhook(req, res, next);

  assert.equal(res.status.calledWith(400), true);
  assert.equal(res.send.calledWith("Webhook failed to verify"), true);
  assert.equal(next.called, false);
});

test("should ignore already processed event", async () => {
  const req = { body: {}, headers: { "stripe-signature": "sig" } };
  const res = { json: sinon.spy() };
  const next = sinon.spy();

  const fakeEvent = {
    id: "evt_1",
    type: "payment_intent.succeeded",
    data: { object: {} },
  };
  sandbox.stub(stripeUtils, "verifyStripeWebhook").returns(fakeEvent);
  sandbox.stub(stripeServices, "getStripeEvent").resolves({ id: "evt_1" });

  await processPaymentWebhook(req, res, next);

  assert.equal(res.json.calledWith({ received: true }), true);
  assert.equal(next.called, false);
});

test("should throw AppError if metadata/items missing", async () => {
  const req = { body: {}, headers: { "stripe-signature": "sig" } };
  const res = {};
  const next = sinon.spy();

  const fakeEvent = {
    id: "evt_2",
    type: "payment_intent.succeeded",
    data: { object: {} },
  };
  sandbox.stub(stripeUtils, "verifyStripeWebhook").returns(fakeEvent);
  sandbox.stub(stripeServices, "getStripeEvent").resolves(null);

  try {
    await processPaymentWebhook(req, res, next);
    assert.fail("Expected AppError to be thrown");
  } catch (err) {
    assert.ok(err instanceof AppError);
    assert.equal(err.message.includes("missing metadata/items"), true);
  }
});

test("should process payment_intent.succeeded correctly", async () => {
  const req = { body: {}, headers: { "stripe-signature": "sig" } };
  const res = { json: sinon.spy() };
  const next = sinon.spy();

  const fakeEvent = {
    id: "evt_3",
    type: "payment_intent.succeeded",
    data: {
      object: {
        id: "pi_123",
        amount: 5000,
        metadata: { orderId: 42, items: JSON.stringify([{ id: 1 }]) },
      },
    },
  };

  const fakeTx = { commit: sinon.spy(), rollback: sinon.spy() };

  sandbox.stub(stripeUtils, "verifyStripeWebhook").returns(fakeEvent);
  sandbox.stub(stripeServices, "getStripeEvent").resolves(null);
  sandbox.stub(sequelize, "transaction").resolves(fakeTx);

  sandbox.stub(stripeServices, "createStripeEvent").resolves();
  sandbox.stub(paymentServices, "updatePayment").resolves();
  sandbox.stub(orderService, "updateOrder").resolves();
  sandbox.stub(orderItemServices, "updateManyOrderItems").resolves();
  sandbox.stub(stripeServices, "updateStripeEvent").resolves();

  await processPaymentWebhook(req, res, next, fakeTx.commit);

  assert.equal(
    paymentServices.updatePayment.calledWith("succeeded", "pi_123"),
    true
  );
  assert.equal(orderService.updateOrder.calledWith("paid", 5000, 42), true);
  assert.equal(orderItemServices.updateManyOrderItems.calledOnce, true);
  assert.equal(fakeTx.commit.calledOnce, true);
  assert.equal(res.json.calledWith({ received: true }), true);
});

test("should process payment_intent.payment_failed correctly", async () => {
  const req = { body: {}, headers: { "stripe-signature": "sig" } };
  const res = { json: sinon.spy() };
  const next = sinon.spy();

  const fakeEvent = {
    id: "evt_4",
    type: "payment_intent.payment_failed",
    data: {
      object: {
        id: "pi_456",
        amount: 3000,
        metadata: { orderId: 43, items: JSON.stringify([{ id: 2 }]) },
      },
    },
  };

  const fakeTx = { commit: sinon.spy(), rollback: sinon.spy() };

  sandbox.stub(stripeUtils, "verifyStripeWebhook").returns(fakeEvent);
  sandbox.stub(stripeServices, "getStripeEvent").resolves(null);
  sandbox.stub(sequelize, "transaction").resolves(fakeTx);

  sandbox.stub(stripeServices, "createStripeEvent").resolves();
  sandbox.stub(paymentServices, "updatePayment").resolves();
  sandbox.stub(orderService, "updateOrder").resolves();
  sandbox.stub(stripeServices, "updateStripeEvent").resolves();

  await processPaymentWebhook(req, res, next);

  assert.equal(
    paymentServices.updatePayment.calledWith("failed", "pi_456"),
    true
  );
  assert.equal(orderService.updateOrder.calledWith("canceled", 3000, 43), true);
  assert.equal(fakeTx.commit.calledOnce, true);
  assert.equal(res.json.calledWith({ received: true }), true);
});

test("should log unhandled event types", async () => {
  const req = { body: {}, headers: { "stripe-signature": "sig" } };
  const res = { json: sinon.spy() };
  const next = sinon.spy();

  const fakeEvent = {
    id: "evt_5",
    type: "random.event",
    data: { object: { metadata: { items: JSON.stringify([{ id: 3 }]) } } },
  };

  const fakeTx = { commit: sinon.spy(), rollback: sinon.spy() };

  sandbox.stub(stripeUtils, "verifyStripeWebhook").returns(fakeEvent);
  sandbox.stub(stripeServices, "getStripeEvent").resolves(null);
  sandbox.stub(sequelize, "transaction").resolves(fakeTx);

  sandbox.stub(stripeServices, "createStripeEvent").resolves();
  sandbox.stub(stripeServices, "updateStripeEvent").resolves();

  await processPaymentWebhook(req, res, next);

  assert.equal(res.json.calledWith({ received: true }), true);
  assert.equal(fakeTx.commit.calledOnce, true);
});

test("should rollback and call next on error", async () => {
  const req = { body: {}, headers: { "stripe-signature": "sig" } };
  const res = {};
  const next = sinon.spy();

  const fakeEvent = {
    id: "evt_6",
    type: "payment_intent.succeeded",
    data: {
      object: {
        id: "pi_err",
        amount: 1000,
        metadata: { orderId: 55, items: JSON.stringify([{ id: 1 }]) },
      },
    },
  };

  const fakeTx = { commit: sinon.spy(), rollback: sinon.spy() };

  sandbox.stub(stripeUtils, "verifyStripeWebhook").returns(fakeEvent);
  sandbox.stub(stripeServices, "getStripeEvent").resolves(null);
  sandbox.stub(sequelize, "transaction").resolves(fakeTx);

  sandbox
    .stub(stripeServices, "createStripeEvent")
    .rejects(new Error("DB error"));

  await processPaymentWebhook(req, res, next);

  assert.equal(fakeTx.rollback.calledOnce, true);
  assert.equal(next.calledOnce, true);
});
