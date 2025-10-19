import test from "node:test";
import assert from "node:assert/strict";
import sinon from "sinon";

import orderController from "../../controllers/order.controller.js";

import { sequelize } from "../../database/connection.js";
import orderService from "../../services/order.services.js";
import serviceServices from "../../services/service.services.js";
import hashIdUtil from "../../utils/hashId.util.js";
import stripeUtils, { createPaymentIntent } from "../../utils/stripe.util.js";
import paymentServices from "../../services/payment.service.js";
import { AppError } from "../../utils/error.class.js";
import authUtil from "../../utils/authorize.util.js";
import inquiryServices from "../../services/inquiry.services.js";

// ---------------- Setup ----------------
let sandbox;
test.beforeEach(() => {
  sandbox = sinon.createSandbox();
});
test.afterEach(() => {
  sandbox.restore();
});

// ---------------- Controllers ----------------
test("checkoutController payment and paymentIntent", async () => {
  // Arrange
  const req = {
    params: { id: 1 },
    body: { items: ["hashed1", "hashed2"] },
    auth: { id: 42 },
  };
  const res = { json: sandbox.spy() };
  const next = sandbox.spy();
  const fakeTransaction = {
    commit: sinon.spy(),
    rollback: sinon.spy(),
  };
  const fakeOrder = {
    id: 1,
    variables: { price: "3000", payment_terms: "all up front" },
    amount: 3000,
    status: "pending client approval",
  };
  const fakePaymentIntent = {
    id: "pi12321",
    client_secret: "pi12321",
  };
  const fakePayment = {
    id: 123,
  };
  sandbox.stub(sequelize, "transaction").resolves(fakeTransaction);
  sandbox.stub(authUtil, "checkRoleAndPermission").resolves();
  sandbox.stub(hashIdUtil, "hashIdDecode").returns(1);
  sandbox.stub(orderService, "getOrderCheckout").resolves(fakeOrder); //should be called with (fakeOrder.id,req.auth.id)
  sandbox.stub(stripeUtils, "createPaymentIntent").resolves(fakePaymentIntent); //should  be called with (fakeOrder.amount,fakeOrder.id)
  sandbox.stub(paymentServices, "createPayment").resolves(fakePayment);
  sandbox.stub(inquiryServices, "updateInquiry").resolves(); //should  be called with ({order_id:orderId},{status:"checked out"},fakeTransaction)
  // Act
  await orderController.checkoutController(req, res, next);
  // Assert
  assert.ok(res.json.calledOnce);
  sinon.assert.calledOnce(paymentServices.createPayment);
  // assert.equal(res.send.calledOnce, true);
  // const responseArg = res.send.firstCall.args[0];
  // assert.deepEqual(responseArg, {
  //   orderId: "encoded-99",
  //   items: [
  //     {
  //       item_id: "encoded-1",
  //       service_id: "encoded-1",
  //     },
  //   ],
  // });
  // assert.equal(fakeTransaction.commit.calledOnce, true);
  // assert.equal(next.called, false);
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
