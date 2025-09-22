import db from "../database/dbIndex.js";

export async function updateManyOrderItems(items, t) {
  await Promise.all(
    items.map((i) =>
      db.OrderItems.update(
        { paid_price: i.item_price },
        { where: { id: i.item_id }, transaction: t }
      )
    )
  );
}
const orderItemServices = { updateManyOrderItems };

export default orderItemServices;
