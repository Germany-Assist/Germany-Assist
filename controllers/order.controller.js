import { sequelize } from "../database/connection.js";
import orderService from "../services/order.services.js";
import hashIdUtil from "../utils/hashId.util.js";
import stripeUtils from "../utils/stripe.util.js";
import paymentServices from "../services/payment.service.js";
import { AppError } from "../utils/error.class.js";
import authUtil from "../utils/authorize.util.js";
import inquiryServices from "../services/inquiry.services.js";

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
// export function sanitizeOrder(order, cost = false) {
//   return {
//     orderId: hashIdUtil.hashIdEncode(order.id),
//     ...(cost && {
//       totalAmount: calculateOrderPrice(order.OrderItems),
//     }),
//     items: order.OrderItems.map((i) => {
//       return {
//         item_id: hashIdUtil.hashIdEncode(i.id),
//         service_id: hashIdUtil.hashIdEncode(i.service_id),
//         ...(cost && {
//           price: i.Service.price,
//         }),
//       };
//     }),
//   };
// }
//-------------------------end helpers--------------------//

export async function checkoutController(req, res, next) {
  const t = await sequelize.transaction();
  try {
    await authUtil.checkRoleAndPermission(req.auth, ["client"], false);
    const { id } = req.params;
    const orderId = hashIdUtil.hashIdDecode(id);
    const userId = req.auth.id;
    const order = await orderService.getOrderCheckout(orderId, userId);
    if (order.status !== "pending client approval")
      throw new AppError(
        400,
        "Order is not payable",
        true,
        "Order is not payable"
      );
    const metadata = {
      orderId: orderId,
    };
    const paymentIntent = await stripeUtils.createPaymentIntent(
      order.amount,
      metadata
    );
    const payment = await paymentServices.createPayment(
      paymentIntent.id,
      Math.round(order.amount * 100),
      order.id,
      t
    );
    res.json({
      clientSecret: paymentIntent.client_secret,
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
      variables: data,
    };
    const order = await orderService.createOrder(orderData, t);
    const inquiryUpdate = {
      order_id: order.id,
      status: "pending client approval",
    };
    await inquiryServices.updateInquiry(inquiryId, inquiryUpdate, t);
    res.sendStatus(201);
    await t.commit();
  } catch (err) {
    await t.rollback();
    next(err);
  }
}

const orderController = {
  checkoutController,
  generateOffer,
  createOrder,
};

export default orderController;
//  get orderById
//  get my orders
//  get orders for admins
//  get orders by id for admins
