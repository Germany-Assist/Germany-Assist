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
