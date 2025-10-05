import { afterEach, beforeEach, describe, test } from "node:test";
import assert from "node:assert/strict";
import sinon from "sinon";
import stripeServices from "../../services/stripe.service.js";
import paymentServices from "../../services/payment.service.js";
import orderService from "../../services/order.services.js";
import orderItemServices from "../../services/itemOrder.services.js";
import { sequelize } from "../../database/connection.js";
import "../../utils/bullMQ.util.js";
import { stripeProcessor } from "../../utils/bullMQ.util.js";
describe("testing the worker processor", () => {
  let sandbox, fakeTx;
  const fakeEvent = {
    id: "evt_123",
    type: "payment_intent.succeeded",
    data: {
      object: {
        id: "pi_1",
        amount: 1000,
        metadata: {
          orderId: 1234,
          items: JSON.stringify([
            { id: 1, price: 2 },
            { id: 2, price: 3 },
          ]),
        },
      },
    },
  };
  const fakeJob = {
    data: { event: { ...fakeEvent } },
  };
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    fakeTx = { commit: sandbox.spy(), rollback: sandbox.spy() };
    sandbox.stub(sequelize, "transaction").resolves(fakeTx);
    sandbox
      .stub(stripeServices, "getStripeEvent")
      .resolves({ status: "pending" });
    sandbox.stub(stripeServices, "updateStripeEvent").resolves();
    sandbox.stub(paymentServices, "updatePayment").resolves();
    sandbox.stub(orderService, "updateOrder").resolves();
    sandbox.stub(orderItemServices, "updateManyOrderItems").resolves();
  });
  afterEach(() => {
    sandbox.restore();
  });
  test("should process payment_intent.succeeded and commit transaction", async () => {
    await stripeProcessor(fakeJob);
    assert.ok(fakeTx.commit.called, "transaction should commit");
    assert.equal(
      fakeTx.rollback.called,
      false,
      "transaction should not rollback"
    );
  });
  test("should rollback transaction if update Payment fails", async () => {
    paymentServices.updatePayment.throws(new Error("Update payment failed"));
    try {
      await stripeProcessor(fakeJob);
    } catch (error) {}
    assert.equal(fakeTx.commit.called, false, "transaction should not commit");
    assert.ok(fakeTx.rollback.called, "transaction should rollback");
  });
  test("should rollback transaction if updateOrder fails", async () => {
    orderService.updateOrder.throws(new Error("Update order failed "));
    try {
      await stripeProcessor(fakeJob);
    } catch (error) {}
    assert.equal(fakeTx.commit.called, false, "transaction should not commit");
    assert.ok(fakeTx.rollback.called, "transaction should rollback");
  });
  test("should rollback transaction if Update OrderItems fails", async () => {
    orderItemServices.updateManyOrderItems.throws(
      new Error("Update OrderItems failed")
    );
    try {
      await stripeProcessor(fakeJob);
    } catch (error) {}
    assert.equal(fakeTx.commit.called, false, "transaction should not commit");
    assert.ok(fakeTx.rollback.called, "transaction should rollback");
  });
  test("should rollback transaction if update Stripe Event fails", async () => {
    stripeServices.updateStripeEvent.throws(new Error("Update failed 2"));
    try {
      await stripeProcessor(fakeJob);
    } catch (error) {}
    assert.equal(fakeTx.commit.called, false, "transaction should not commit");
    assert.ok(fakeTx.rollback.called, "transaction should rollback");
  });
  //// ---------------------------- important ---------------------------- ////
  test("should test the flow of all functions", async () => {
    const pi = fakeEvent.data.object;
    const items = JSON.parse(pi.metadata.items);
    await stripeProcessor(fakeJob);
    assert.equal(fakeTx.commit.called, true, "transaction should commit");
    assert.equal(fakeTx.rollback.called, false);
    sinon.assert.calledOnceWithExactly(
      stripeServices.getStripeEvent,
      fakeEvent.id
    );
    sinon.assert.calledOnceWithExactly(
      paymentServices.updatePayment,
      "succeeded",
      pi.id,
      fakeTx
    );
    sinon.assert.calledOnceWithExactly(
      orderService.updateOrder,
      "paid",
      pi.amount,
      pi.metadata.orderId,
      fakeTx
    );
    sinon.assert.calledOnceWithExactly(
      orderItemServices.updateManyOrderItems,
      items,
      fakeTx
    );
  });
});
