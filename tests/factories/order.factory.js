import { v4 as uuid } from "uuid";
import db from "../../src/database/dbIndex.js";
import { errorLogger } from "../../src/utils/loggers.js";

export async function orderFactory(overrides = {}) {
  try {
    if (!overrides.user_id || !overrides.timeline_id || !overrides.service_id)
      throw new Error(
        "post factory failed missing user id or timeline id or service_id"
      );
    const data = {
      amount: 12345,
      status: "paid",
      stripe_payment_intent_id: uuid(),
      currency: "usd",
      ...overrides,
    };
    return await db.Order.create(data);
  } catch (error) {
    errorLogger(error.message);
  }
}
