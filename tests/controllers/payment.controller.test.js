import test, { afterEach, beforeEach } from "node:test";
import assert from "node:assert/strict";
import sinon from "sinon";
import paymentController from "../../controllers/payment.controller.js";
import stripeUtils from "../../utils/stripe.util.js";
import stripeServices from "../../services/stripe.service.js";
import { AppError } from "../../utils/error.class.js";

let sandbox;
beforeEach(() => {
  sandbox = sinon.createSandbox();
});
afterEach(() => {
  sandbox.restore();
});

// ------------------- Tests -------------------

test("should return 400 if webhook verification fails", async () => {
  const req = { body: {}, headers: { "stripe-signature": "sig" } };
  const res = { status: sinon.stub().returnsThis(), send: sinon.stub() };
  const next = sinon.stub();
  sandbox.stub(stripeUtils, "verifyStripeWebhook").returns(null);
  await paymentController.processPaymentWebhook(req, res, next);
  assert.equal(res.status.calledWith(400), true);
  assert.equal(res.send.calledWith("Webhook failed to verify"), true);
  assert.equal(next.called, false);
});

test("should reject event for missing metadata", async () => {
  const req = { body: {}, headers: { "stripe-signature": "sig" } };
  const res = { json: sinon.spy() };
  const next = sinon.spy();
  const fakeEvent = {
    id: "evt_1",
    type: "payment_intent.succeeded",
    data: { object: {} },
  };
  sandbox.stub(stripeUtils, "verifyStripeWebhook").returns(fakeEvent);
  await paymentController.processPaymentWebhook(req, res, next);
  assert.equal(res.json.called, false);
  assert.ok(next.args[0][0] instanceof AppError);
  assert.equal(
    next.args[0][0].message.includes("missing metadata/items"),
    true
  );
});

test("should pass all correct", async () => {
  const req = { body: {}, headers: { "stripe-signature": "sig" } };
  const res = { json: sinon.spy() };
  const next = sinon.spy();
  const fakeEvent = {
    id: "evt_1",
    type: "payment_intent.succeeded",
    data: { object: { metadata: { items: [{ id: 1, price: 2 }] } } },
  };
  sandbox.stub(stripeUtils, "verifyStripeWebhook").returns(fakeEvent);
  sandbox.stub(stripeServices, "createStripeEvent").resolves();
  await paymentController.processPaymentWebhook(req, res, next);
  sinon.assert.calledWith(res.json, { received: true });
});
test("should pass all correct even if database error wont block the stripe", async () => {
  const req = { body: {}, headers: { "stripe-signature": "sig" } };
  const res = { json: sinon.spy() };
  const next = sinon.spy();
  const fakeEvent = {
    id: "evt_1",
    type: "payment_intent.succeeded",
    data: { object: { metadata: { items: [{ id: 1, price: 2 }] } } },
  };
  sandbox.stub(stripeUtils, "verifyStripeWebhook").returns(fakeEvent);
  sandbox.stub(stripeServices, "createStripeEvent").rejects();
  await paymentController.processPaymentWebhook(req, res, next);
  sinon.assert.calledWith(res.json, { received: true });
  assert.ok(next.calledOnce);
});
