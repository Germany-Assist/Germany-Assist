import { sequelize } from "../database/connection.js";

export async function updateManyOrderItems(items, t) {
  if (!items || items.length === 0) return;

  const values = items.map((i) => `(${i.item_id}, ${i.item_price})`).join(", ");

  const query = `
    UPDATE "order_items" AS o
    SET paid_price = v.paid_price
    FROM (VALUES ${values}) AS v(id, paid_price)
    WHERE o.id = v.id
  `;

  await sequelize.query(query, { transaction: t });
}
const orderItemServices = { updateManyOrderItems };

export default orderItemServices;
