import { test, beforeEach, afterEach, describe } from "node:test";
import assert from "node:assert/strict";
import sinon from "sinon";
import orderController from "../../controllers/order.controller.js";
import authUtil from "../../utils/authorize.util.js";
import hashIdUtil from "../../utils/hashId.util.js";
import orderService from "../../services/order.services.js";
import userServices from "../../services/user.services.js";
import stripeUtils from "../../utils/stripe.util.js";
import { AppError } from "../../utils/error.class.js";
import { v4 as uuidv4 } from "uuid";

// ✅ Mock req, res, next
function mockReqRes(
  auth = { id: 1, related_id: 10, role: "client" },
  body = {},
  params = {},
  query = {}
) {
  return {
    req: { auth, body, params, query },
    res: { send: sinon.stub() },
    next: sinon.stub(),
  };
}

let sandbox;

beforeEach(() => {
  sandbox = sinon.createSandbox();
});

afterEach(() => {
  sandbox.restore();
});

describe("testing order controllers", () => {
  test("checkoutController → should send correct user and service info", async () => {
    const { req, res, next } = mockReqRes({}, {}, { id: "abc" });
    sandbox.stub(authUtil, "checkRoleAndPermission").resolves();
    sandbox.stub(hashIdUtil, "hashIdDecode").returns(1);
    sandbox.stub(userServices, "getUserById").resolves({ first_name: "John" });
    sandbox
      .stub(orderService, "getServiceForPaymentPrivate")
      .resolves({ title: "Gold Plan", price: 15 });

    await orderController.checkoutController(req, res, next);

    assert.ok(res.send.calledOnce);
    assert.match(res.send.firstCall.args[0], /John/);
    assert.match(res.send.firstCall.args[0], /Gold Plan/);
  });

  test("checkoutController → should call next on missing user/service", async () => {
    const { req, res, next } = mockReqRes({}, {}, { id: "abc" });
    sandbox.stub(authUtil, "checkRoleAndPermission").resolves();
    sandbox.stub(hashIdUtil, "hashIdDecode").returns(1);
    sandbox.stub(userServices, "getUserById").resolves(null);
    sandbox.stub(orderService, "getServiceForPaymentPrivate").resolves({});

    await orderController.checkoutController(req, res, next);

    assert.ok(next.calledOnce);
    assert.ok(next.firstCall.args[0] instanceof AppError);
  });

  //
  // 💳 payOrder
  //
  test("payOrder → should create free order when price = 0", async () => {
    const { req, res, next } = mockReqRes({}, {}, { id: "xyz" });
    sandbox.stub(authUtil, "checkRoleAndPermission").resolves();
    sandbox.stub(hashIdUtil, "hashIdDecode").returns(1);
    sandbox.stub(orderService, "getServiceForPaymentPrivate").resolves({
      price: 0,
      "Timelines.id": 9,
    });
    const createStub = sandbox.stub(orderService, "createOrder").resolves();
    await orderController.payOrder(req, res, next);
    assert.ok(createStub.calledOnce);
    assert.ok(res.send.calledWithMatch({ success: true }));
    assert.strictEqual(next.called, false);
  });

  test("payOrder → should create payment intent for paid service", async () => {
    const { req, res, next } = mockReqRes({}, {}, { id: "xyz" });
    sandbox.stub(authUtil, "checkRoleAndPermission").resolves();
    sandbox.stub(hashIdUtil, "hashIdDecode").returns(1);
    sandbox.stub(orderService, "getServiceForPaymentPrivate").resolves({
      price: 50,
      "Timelines.id": 10,
    });
    const stripeStub = sandbox
      .stub(stripeUtils, "createPaymentIntent")
      .resolves({ client_secret: "secret-123" });

    await orderController.payOrder(req, res, next);

    assert.ok(stripeStub.calledOnce);
    assert.ok(
      res.send.calledOnceWithMatch({
        success: true,
        message: { clientSecret: "secret-123" },
      })
    );
  });

  //
  // 🧾 getOrderAdmin
  //
  test("getOrderAdmin → should send encoded order", async () => {
    const { req, res, next } = mockReqRes({ role: "admin" }, {}, { id: "123" });
    const order = { id: 1, user_id: 2, timeline_id: 3, service_id: 4 };

    sandbox.stub(authUtil, "checkRoleAndPermission").resolves();
    sandbox.stub(hashIdUtil, "hashIdDecode").returns(10);
    sandbox.stub(orderService, "getOrder").resolves(order);
    sandbox.stub(hashIdUtil, "hashIdEncode").returns("encoded");

    await orderController.getOrderAdmin(req, res, next);

    assert.ok(res.send.calledOnce);
    assert.deepEqual(res.send.firstCall.args[0], {
      ...order,
      id: "encoded",
      user_id: "encoded",
      timeline_id: "encoded",
      service_id: "encoded",
    });
  });

  //
  // 🧾 getOrderSP
  //
  test("getOrderSP → should fetch and send encoded order for service provider", async () => {
    const { req, res, next } = mockReqRes(
      { role: "service_provider_root", related_id: 9 },
      {},
      { id: "456" }
    );
    const order = { id: 1, user_id: 2, timeline_id: 3, user_iservice_id: 4 };

    sandbox.stub(authUtil, "checkRoleAndPermission").resolves();
    sandbox.stub(hashIdUtil, "hashIdDecode").returns(10);
    sandbox.stub(orderService, "getOrderByIdAndSPID").resolves(order);
    sandbox.stub(hashIdUtil, "hashIdEncode").returns("encoded");

    await orderController.getOrderSP(req, res, next);

    assert.ok(res.send.calledOnce);
    assert.deepEqual(res.send.firstCall.args[0], {
      ...order,
      id: "encoded",
      user_id: "encoded",
      timeline_id: "encoded",
      service_id: "encoded",
    });
  });

  //
  // 👤 getOrderCL
  //
  test("getOrderCL → should fetch and send encoded order for client", async () => {
    const { req, res, next } = mockReqRes(
      { id: 7, role: "client" },
      {},
      { id: "789" }
    );
    const order = { id: 1, user_id: 7, timeline_id: 3, user_iservice_id: 4 };

    sandbox.stub(authUtil, "checkRoleAndPermission").resolves();
    sandbox.stub(hashIdUtil, "hashIdDecode").returns(10);
    sandbox.stub(orderService, "getOrder").resolves(order);
    sandbox.stub(hashIdUtil, "hashIdEncode").returns("encoded");

    await orderController.getOrderCL(req, res, next);

    assert.ok(res.send.calledOnce);
    assert.deepEqual(res.send.firstCall.args[0], {
      ...order,
      id: "encoded",
      user_id: "encoded",
      timeline_id: "encoded",
      service_id: "encoded",
    });
  });

  //
  // 📋 getOrdersAdmin
  //
  test("getOrdersAdmin → should encode and send all admin orders", async () => {
    const { req, res, next } = mockReqRes({ role: "admin" });
    const orders = [{ id: 1, user_id: 2, timeline_id: 3, user_iservice_id: 4 }];

    sandbox.stub(authUtil, "checkRoleAndPermission").resolves();
    sandbox.stub(orderService, "getOrders").resolves(orders);
    sandbox.stub(hashIdUtil, "hashIdEncode").returns("encoded");

    await orderController.getOrdersAdmin(req, res, next);

    assert.ok(res.send.calledOnce);
    assert.ok(res.send.firstCall.args[0][0].id === "encoded");
  });

  //
  // 🧾 getOrdersSP
  //
  test("getOrdersSP → should encode and send SP orders", async () => {
    const { req, res, next } = mockReqRes(
      { role: "service_provider_rep", related_id: 22 },
      {},
      {},
      { filter: "test" }
    );
    const orders = [{ id: 1, user_id: 2, timeline_id: 3, user_iservice_id: 4 }];

    sandbox.stub(authUtil, "checkRoleAndPermission").resolves();
    sandbox.stub(orderService, "getOrders").resolves(orders);
    sandbox.stub(hashIdUtil, "hashIdEncode").returns("encoded");

    await orderController.getOrdersSP(req, res, next);

    assert.ok(res.send.calledOnce);
    assert.ok(res.send.firstCall.args[0][0].id === "encoded");
  });

  //
  // 👥 getOrdersCL
  //
  test("getOrdersCL → should encode and send client orders", async () => {
    const { req, res, next } = mockReqRes({ id: 5, role: "client" });
    const orders = [{ id: 1, user_id: 5, timeline_id: 3, user_iservice_id: 4 }];

    sandbox.stub(authUtil, "checkRoleAndPermission").resolves();
    sandbox.stub(orderService, "getOrders").resolves(orders);
    sandbox.stub(hashIdUtil, "hashIdEncode").returns("encoded");

    await orderController.getOrdersCL(req, res, next);

    assert.ok(res.send.calledOnce);
    assert.ok(res.send.firstCall.args[0][0].id === "encoded");
  });
});
