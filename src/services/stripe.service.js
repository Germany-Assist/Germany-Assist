import db from "../database/index.js";

export async function getStripeEvent(id) {
  return await db.StripeEvent.findByPk(id);
}

export async function createStripeEvent(event, status, t) {
  return await db.StripeEvent.create(
    {
      id: event.id,
      type: event.type,
      objectId: event.data.object.id,
      payload: event,
      status,
    },
    { transaction: t }
  );
}
export async function updateStripeEvent(id, status, t) {
  return await db.StripeEvent.update(
    { status: status },
    { where: { id }, transaction: t }
  );
}

const stripeServices = {
  updateStripeEvent,
  createStripeEvent,
  getStripeEvent,
};
export default stripeServices;
