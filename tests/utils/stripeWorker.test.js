import test, { describe } from "node:test";
import assert from "node:assert/strict";
import sinon from "sinon";
import stripeServices from "../../services/stripe.service.js";
import orderService from "../../services/order.services.js";
import { infoLogger, errorLogger } from "../../utils/loggers.js";
import { sequelize } from "../../database/connection.js";
import stripeProcessor from "../../jobs/processors/stripe.processor.js";

describe("testing stripe processor", () => {
  test("should skip processing if stripeEvent.status is 'processed'", async (t) => {
    const job = { data: { event: { id: "evt_1" } } };

    sinon
      .stub(stripeServices, "getStripeEvent")
      .resolves({ status: "processed" });

    const tMock = { commit: sinon.stub(), rollback: sinon.stub() };
    sinon.stub(sequelize, "transaction").resolves(tMock);

    await stripeProcessor(job);

    assert.ok(stripeServices.getStripeEvent.calledOnceWith("evt_1"));
    assert.ok(tMock.commit.notCalled);

    sinon.restore();
  });

  test("should handle payment_intent.created event", async (t) => {
    const fakeEvent = {
      id: "evt_2",
      type: "payment_intent.created",
      data: { object: {} },
    };
    const job = { data: { event: fakeEvent } };

    sinon.stub(stripeServices, "getStripeEvent").resolves(null);
    const createStub = sinon
      .stub(stripeServices, "createStripeEvent")
      .resolves();
    const updateStub = sinon
      .stub(stripeServices, "updateStripeEvent")
      .resolves();
    const infoStub = sinon.stub(console, "log"); // fallback if infoLogger uses console
    sinon.stub(infoLogger, "call").value(infoStub);

    const tMock = { commit: sinon.stub(), rollback: sinon.stub() };
    sinon.stub(sequelize, "transaction").resolves(tMock);

    await stripeProcessor(job);

    assert.ok(createStub.calledOnce);
    assert.ok(updateStub.calledOnceWith("evt_2", "processed", tMock));
    assert.ok(tMock.commit.calledOnce);

    sinon.restore();
  });

  test("should create order for payment_intent.succeeded", async (t) => {
    const metadata = { userId: 1, serviceId: 2, timelineId: 3 };
    const event = {
      id: "evt_3",
      type: "payment_intent.succeeded",
      data: { object: { id: "pi_1", amount: 1000, metadata } },
    };
    const job = { data: { event } };

    sinon.stub(stripeServices, "getStripeEvent").resolves(null);
    sinon.stub(stripeServices, "updateStripeEvent").resolves();
    const orderStub = sinon.stub(orderService, "createOrder").resolves();
    sinon.stub(infoLogger, "call").value(() => {});
    const tMock = { commit: sinon.stub(), rollback: sinon.stub() };
    sinon.stub(sequelize, "transaction").resolves(tMock);

    await stripeProcessor(job);

    assert.ok(orderStub.calledOnce);
    assert.ok(tMock.commit.calledOnce);
    assert.ok(
      stripeServices.updateStripeEvent.calledOnceWith(
        "evt_3",
        "processed",
        tMock
      )
    );

    sinon.restore();
  });

  test("should log and continue for payment_intent.payment_failed", async (t) => {
    const event = {
      id: "evt_4",
      type: "payment_intent.payment_failed",
      data: { object: {} },
    };
    const job = { data: { event } };

    sinon.stub(stripeServices, "getStripeEvent").resolves(null);
    sinon.stub(stripeServices, "updateStripeEvent").resolves();
    const infoStub = sinon.stub(infoLogger, "call").value(() => {});
    const tMock = { commit: sinon.stub(), rollback: sinon.stub() };
    sinon.stub(sequelize, "transaction").resolves(tMock);

    await stripeProcessor(job);

    assert.ok(infoStub);
    assert.ok(tMock.commit.calledOnce);
    assert.ok(stripeServices.updateStripeEvent.calledOnce);

    sinon.restore();
  });

  test("should log unhandled event types", async (t) => {
    const event = { id: "evt_5", type: "random.event", data: { object: {} } };
    const job = { data: { event } };

    sinon.stub(stripeServices, "getStripeEvent").resolves(null);
    sinon.stub(stripeServices, "updateStripeEvent").resolves();
    const infoStub = sinon.stub(infoLogger, "call").value(() => {});
    const tMock = { commit: sinon.stub(), rollback: sinon.stub() };
    sinon.stub(sequelize, "transaction").resolves(tMock);

    await stripeProcessor(job);

    assert.ok(tMock.commit.calledOnce);
    assert.ok(
      stripeServices.updateStripeEvent.calledOnceWith(
        "evt_5",
        "processed",
        tMock
      )
    );

    sinon.restore();
  });

  test("should rollback and rethrow on error", async (t) => {
    const event = {
      id: "evt_6",
      type: "payment_intent.succeeded",
      data: {
        object: { metadata: { userId: 1, serviceId: 2, timelineId: 3 } },
      },
    };
    const job = { data: { event } };
    sinon.stub(orderService, "createOrder").resolves(true);
    sinon.stub(stripeServices, "getStripeEvent").resolves(null);
    sinon
      .stub(stripeServices, "updateStripeEvent")
      .rejects(new Error("DB failed"));
    sinon.stub(errorLogger, "call").value(() => {});
    const tMock = { commit: sinon.stub(), rollback: sinon.stub() };
    sinon.stub(sequelize, "transaction").resolves(tMock);

    await assert.rejects(() => stripeProcessor(job), /DB failed/);
    assert.ok(tMock.rollback.calledOnce);

    sinon.restore();
  });
});
