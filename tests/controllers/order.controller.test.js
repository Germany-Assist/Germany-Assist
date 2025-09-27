import test from "node:test";
import assert from "node:assert/strict";
import sinon from "sinon";

import orderController, {
  generateOrderItems,
  extractItems,
  sanitizeOrder,
} from "../../controllers/order.controller.js";

import { sequelize } from "../../database/connection.js";
import orderService from "../../services/order.services.js";
import serviceServices from "../../services/service.services.js";
import hashIdUtil from "../../utils/hashId.util.js";
import stripeUtils, { createPaymentIntent } from "../../utils/stripe.util.js";
import paymentServices from "../../services/payment.service.js";
import { AppError } from "../../utils/error.class.js";

// ---------------- Setup ----------------
let sandbox;
test.beforeEach(() => {
  sandbox = sinon.createSandbox();
});
test.afterEach(() => {
  sandbox.restore();
});

// ---------------- Helper Functions ----------------
test("generateOrderItems should map services correctly", () => {
  const fakeServices = [
    { get: () => ({ id: 1, title: "Service 1" }) },
    { get: () => ({ id: 2, title: "Service 2" }) },
  ];
  const result = generateOrderItems(10, fakeServices);
  assert.deepEqual(result, [
    { order_id: 10, service_id: 1, title: "Service 1" },
    { order_id: 10, service_id: 2, title: "Service 2" },
  ]);
});

test("extractItems should return formatted items", () => {
  const order = {
    OrderItems: [
      { id: 1, Service: { id: 100, price: 50 } },
      { id: 2, Service: { id: 200, price: 75 } },
    ],
  };
  const result = extractItems(order);
  assert.deepEqual(result, [
    { item_id: 1, item_price: 50, service_id: 100 },
    { item_id: 2, item_price: 75, service_id: 200 },
  ]);
});

// ---------------- Controllers ----------------
test("checkoutController should create an order and return sanitized order", async () => {
  // Arrange
  const req = {
    body: { items: ["hashed1", "hashed2"] },
    auth: { id: 42 },
  };
  const res = { send: sinon.spy() };
  const next = sinon.spy();

  const fakeTransaction = {
    commit: sinon.spy(),
    rollback: sinon.spy(),
  };
  sandbox.stub(sequelize, "transaction").resolves(fakeTransaction);
  sandbox
    .stub(hashIdUtil, "hashIdDecode")
    .onFirstCall()
    .returns(1)
    .onSecondCall()
    .returns(2);

  const fakeCartItems = [{ id: 1 }, { id: 2 }];
  sandbox.stub(orderService, "getUserCartByIds").resolves(fakeCartItems);

  const fakeOrder = {
    id: 99,
    OrderItems: [{ id: 1, service_id: 1, Service: { price: 100 } }],
  };
  sandbox.stub(orderService, "createOrder").resolves(fakeOrder);
  sandbox.stub(hashIdUtil, "hashIdEncode").callsFake((x) => `encoded-${x}`);

  // Act
  await orderController.checkoutController(req, res, next);

  // Assert
  assert.equal(res.send.calledOnce, true);
  const responseArg = res.send.firstCall.args[0];
  assert.deepEqual(responseArg, {
    orderId: "encoded-99",
    items: [
      {
        item_id: "encoded-1",
        service_id: "encoded-1",
      },
    ],
  });
  assert.equal(fakeTransaction.commit.calledOnce, true);
  assert.equal(next.called, false);
});

test("checkoutController should handle errors and rollback", async () => {
  const req = { body: { items: ["bad"] }, auth: { id: 42 } };
  const res = { send: sinon.spy() };
  const next = sinon.spy();

  const fakeTransaction = { commit: sinon.spy(), rollback: sinon.spy() };
  sandbox.stub(sequelize, "transaction").resolves(fakeTransaction);
  sandbox.stub(hashIdUtil, "hashIdDecode").throws(new Error("decode error"));

  await orderController.checkoutController(req, res, next);

  assert.equal(fakeTransaction.rollback.calledOnce, true);
  assert.equal(next.calledOnce, true);
});

// ---------------- payController ----------------
test("payController should create payment intent and return response", async () => {
  const req = { body: { id: "hashed99" } };
  const res = { json: sinon.spy() };
  const next = sinon.spy();

  const fakeTransaction = { commit: sinon.spy(), rollback: sinon.spy() };
  sandbox.stub(sequelize, "transaction").resolves(fakeTransaction);
  sandbox.stub(hashIdUtil, "hashIdDecode").returns(99);

  const fakeOrder = {
    id: 99,
    status: "pending",
    OrderItems: [
      { id: 1, Service: { id: 100, price: 50 }, service_id: 100 },
      { id: 2, Service: { id: 200, price: 75 }, service_id: 200 },
    ],
  };
  sandbox.stub(orderService, "getOrderById").resolves(fakeOrder);

  const fakeIntent = { id: "pi_123", client_secret: "secret_123" };
  sandbox.stub(stripeUtils, "createPaymentIntent").resolves(fakeIntent);
  const fakePayment = { id: 1234 };
  sandbox.stub(paymentServices, "createPayment").resolves(fakePayment);
  sandbox.stub(hashIdUtil, "hashIdEncode").callsFake((x) => `encoded-${x}`);

  await orderController.payController(req, res, next);

  assert.equal(res.json.calledOnce, true);
  const response = res.json.firstCall.args[0];
  assert.deepEqual(response, {
    clientSecret: "secret_123",
    order: {
      orderId: "encoded-99",
      totalAmount: 125,
      items: [
        { item_id: "encoded-1", service_id: "encoded-100", price: 50 },
        { item_id: "encoded-2", service_id: "encoded-200", price: 75 },
      ],
    },
    paymentId: "encoded-1234",
  });
  assert.equal(fakeTransaction.commit.calledOnce, true);
  assert.equal(next.called, false);
});

test("payController should throw if order not payable", async () => {
  const req = { body: { id: "hashed99" } };
  const res = { json: sinon.spy() };
  const next = sinon.spy();

  const fakeTransaction = { commit: sinon.spy(), rollback: sinon.spy() };
  sandbox.stub(sequelize, "transaction").resolves(fakeTransaction);
  sandbox.stub(hashIdUtil, "hashIdDecode").returns(99);

  sandbox
    .stub(orderService, "getOrderById")
    .resolves({ id: 99, status: "completed", OrderItems: [] });

  await orderController.payController(req, res, next);

  assert.equal(fakeTransaction.rollback.calledOnce, true);
  assert.equal(next.calledOnce, true);
  assert.equal(res.json.called, false);
});
