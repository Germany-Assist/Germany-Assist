import { sequelize } from "../database/connection.js";
import orderService from "../services/order.services.js";
import hashIdUtil from "../utils/hashId.util.js";
import stripeUtils from "../utils/stripe.util.js";
import paymentServices from "../services/payment.service.js";
import { AppError } from "../utils/error.class.js";
import authUtil from "../utils/authorize.util.js";

//-------------------------just helpers--------------------//
function render(template, data) {
  return template.replace(/{{([^{}]+)}}/g, (_, key) => {
    const value = data?.[key];
    return value ?? `{{${key}}}`;
  });
}

function initContract(inquiry) {
  const user = inquiry.User;
  const service = inquiry.Service;
  const serviceProvider = service.ServiceProvider;
  const template = service.Category.contract_template;
  const data = {
    client_first_name: user.first_name,
    client_last_name: user.last_name,
    client_phone_number: user.phone_number,
    client_email: user.email,
    service_provider_name: serviceProvider.name,
    service_provider_email: serviceProvider.email,
    service_provider_id: serviceProvider.id,
    service_provider_number: serviceProvider.phone_number,
    service_title: service.title,
    service_id: hashIdUtil.hashIdEncode(service.id),
    agreement_date: new Date(Date.now()),
  };
  return render(template, data);
}
export function generateOrderItems(orderId, services) {
  const orderItemsArray = services.map((i) => {
    i = i.get({ plain: true });
    return {
      order_id: orderId,
      service_id: i.id,
      title: i.title,
    };
  });
  return orderItemsArray;
}
function calculateOrderPrice(orderItems) {
  const total_price = orderItems.reduce(
    (total, item) => total + item.Service.price,
    0
  );
  return total_price;
}
export function extractItems(order) {
  const items = order.OrderItems.map((item) => {
    return {
      item_id: item.id,
      item_price: item.Service.price,
      service_id: item.Service.id,
    };
  });
  return items;
}
export function sanitizeOrder(order, cost = false) {
  return {
    orderId: hashIdUtil.hashIdEncode(order.id),
    ...(cost && {
      totalAmount: calculateOrderPrice(order.OrderItems),
    }),
    items: order.OrderItems.map((i) => {
      return {
        item_id: hashIdUtil.hashIdEncode(i.id),
        service_id: hashIdUtil.hashIdEncode(i.service_id),
        ...(cost && {
          price: i.Service.price,
        }),
      };
    }),
  };
}
//-------------------------end helpers--------------------//

export async function checkoutController(req, res, next) {
  const t = await sequelize.transaction();
  try {
    const { items } = req.body;
    const cartIds = items.map((i) => hashIdUtil.hashIdDecode(i));
    const userId = req.auth.id;
    const cartItems = await orderService.getUserCartByIds(userId, cartIds);
    const servicesIds = cartItems.map((i) => {
      return { service_id: i.id };
    });
    const order = await orderService.createOrder(userId, servicesIds, t);
    const sanitizedOrder = sanitizeOrder(order);
    // await serviceServices.removeItemsFromCart(userId, cartIds);
    await t.commit();
    res.send(sanitizedOrder);
  } catch (err) {
    await t.rollback();
    next(err);
  }
}

export async function payController(req, res, next) {
  const t = await sequelize.transaction();
  try {
    const { id } = req.body;
    const orderId = hashIdUtil.hashIdDecode(id);
    const order = await orderService.getOrderById(orderId);
    if (order.status !== "pending")
      throw new AppError(400, "Order is not payable");
    const totalAmount = calculateOrderPrice(order.OrderItems);
    const items = extractItems(order);
    const paymentIntent = await stripeUtils.createPaymentIntent(
      order,
      items,
      totalAmount
    );
    const payment = await paymentServices.createPayment(
      paymentIntent.id,
      Math.round(totalAmount),
      order.id,
      t
    );
    res.json({
      clientSecret: paymentIntent.client_secret,
      order: sanitizeOrder(order, true),
      paymentId: hashIdUtil.hashIdEncode(payment.id),
    });
    await t.commit();
  } catch (err) {
    await t.rollback();
    next(err);
  }
}

export async function generateOffer(req, res, next) {
  try {
    const { id } = req.params;
    const inquiryId = hashIdUtil.hashIdDecode(id);
    await authUtil.checkRoleAndPermission(
      req.auth,
      ["service_provider_rep", "service_provider_root"],
      true,
      "offer",
      "create"
    );
    await authUtil.checkOwnership(id, req.auth.related_id, "inquiry");
    const offer = await orderService.generateOffer(
      req.auth.related_id,
      inquiryId
    );
    const main = await offer.get({ plain: true });
    const variables = main.Service.Category.variables;
    const contract = initContract(main);
    res.send({ contract, variables });
  } catch (err) {
    next(err);
  }
}
export async function createOrder(req, res, next) {
  const t = await sequelize.transaction();

  try {
    const customerData = req.body;
    const inquiryId = hashIdUtil.hashIdDecode(customerData.id); //inquiry id
    // i should permissions to contracts
    await authUtil.checkRoleAndPermission(req.auth, [
      "service_provider_rep",
      "service_provider_root",
      true,
      "order",
      "create",
    ]);
    await authUtil.checkOwnership(
      customerData.id,
      req.auth.related_id,
      "inquiry"
    );
    const offer = await orderService.generateOffer(
      req.auth.related_id,
      inquiryId
    );
    const main = await offer.get({ plain: true });
    const variables = main.Service.Category.variables;
    const preContract = initContract(main);
    const data = {};
    variables.forEach((i) => {
      if (customerData[i]) {
        data[i] = customerData[i];
      }
    });
    const contract = render(preContract, data);
    const orderData = {
      contract,
      amount: data.price,
      status: "pending client approval",
      user_id: main.User.id,
      service_provider_id: main.Service.ServiceProvider.id,
      inquiry_id: inquiryId,
      variables: data,
    };
    const order = await orderService.createOrder(orderData, t);
    res.sendStatus(201);
    await t.commit();
  } catch (err) {
    await t.rollback();
    next(err);
  }
}

const orderController = {
  checkoutController,
  payController,
  generateOffer,
  createOrder,
};

export default orderController;
//  get orderById
//  get my orders
//  get orders for admins
//  get orders by id for admins
