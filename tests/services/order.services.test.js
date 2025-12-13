import { test, beforeEach, afterEach, describe } from "node:test";
import assert from "node:assert/strict";
import sinon from "sinon";

import orderService from "../../src/modules/order/order.services.js";
import db from "../../src/database/index.js";
import { AppError } from "../../src/utils/error.class.js";

let sandbox;

beforeEach(() => {
  sandbox = sinon.createSandbox();
});

afterEach(() => {
  sandbox.restore();
});

describe("Testing Order Services", () => {
  test("createOrder() should create an order successfully", async () => {
    const fakeData = { id: 1, name: "Test Order" };
    const fakeTransaction = {};

    const stub = sandbox.stub(db.Order, "create").resolves(fakeData);

    const result = await orderService.createOrder(fakeData, fakeTransaction);

    assert.deepEqual(result, fakeData);
    assert.ok(
      stub.calledOnceWithExactly(fakeData, {
        raw: true,
        transaction: fakeTransaction,
      })
    );
  });

  test("getOrder() should return an order when found", async () => {
    const fakeOrder = { id: 1 };
    sandbox.stub(db.Order, "findOne").resolves(fakeOrder);

    const result = await orderService.getOrder({ id: 1 });

    assert.deepEqual(result, fakeOrder);
  });

  test("getOrder() should throw AppError when order not found", async () => {
    sandbox.stub(db.Order, "findOne").resolves(null);

    await assert.rejects(orderService.getOrder({ id: 999 }), (err) => {
      assert.ok(err instanceof AppError);
      assert.equal(err.httpCode, 404);
      return true;
    });
  });

  test("getOrders() should return all orders for a provider", async () => {
    const fakeOrders = [{ id: 1 }, { id: 2 }];
    const stub = sandbox.stub(db.Order, "findAll").resolves(fakeOrders);

    const result = await orderService.getOrders({ serviceProviderId: 10 });

    assert.deepEqual(result, fakeOrders);
    assert.ok(stub.calledOnce);
  });

  test("getOrders() should throw AppError if no orders found", async () => {
    sandbox.stub(db.Order, "findAll").resolves(null);

    await assert.rejects(
      orderService.getOrders({}),
      (err) => err instanceof AppError && err.httpCode === 404
    );
  });

  test("getOrderByIdAndSPID() should return order JSON when found", async () => {
    const fakeOrder = { toJSON: () => ({ id: 1 }) };
    sandbox.stub(db.Order, "findOne").resolves(fakeOrder);

    const result = await orderService.getOrderByIdAndSPID({ id: 1 }, 123);

    assert.deepEqual(result, { id: 1 });
  });

  test("getOrderByIdAndSPID() should throw AppError when not found", async () => {
    sandbox.stub(db.Order, "findOne").resolves(null);

    await assert.rejects(
      orderService.getOrderByIdAndSPID({ id: 999 }, 123),
      (err) => err instanceof AppError && err.httpCode === 404
    );
  });

  test("getServiceForPaymentPrivate() should include timelines and return service", async () => {
    const fakeService = {
      id: 1,
      published: true,
      approved: true,
      rejected: false,
    };
    const stub = sandbox.stub(db.Service, "findOne").resolves(fakeService);

    const result = await orderService.getServiceForPaymentPrivate(1);

    assert.deepEqual(result, fakeService);
    assert.ok(stub.calledOnce);
  });
});
