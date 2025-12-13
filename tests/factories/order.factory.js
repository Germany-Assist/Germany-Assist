import { v4 as uuid } from "uuid";
import db from "../../src/database/index.js";
import { errorLogger } from "../../src/utils/loggers.js";

export async function orderFactory(overrides = {}) {
  try {
    if (!overrides.userId || !overrides.timelineId || !overrides.serviceId)
      throw new Error(
        "post factory failed missing user id or timeline id or serviceId"
      );
    const data = {
      amount: 12345,
      status: "paid",
      stripePaymentIntentId: uuid(),
      currency: "usd",
      ...overrides,
    };
    return await db.Order.create(data);
  } catch (error) {
    errorLogger(error.message);
  }
}
