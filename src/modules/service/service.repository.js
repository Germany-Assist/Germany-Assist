import db from "../../database/index.js";
import { AppError } from "../../utils/error.class.js";

async function createService(serviceData, transaction) {
  const include = [];
  if (serviceData.type === "timeline") {
    include.push({ model: db.Timeline, as: "timelines" });
  } else if (serviceData.type === "oneTime") {
    include.push({ model: db.Variant, as: "variants" });
  }
  const service = await db.Service.create(
    { ...serviceData },
    {
      include,
      returning: true,
      transaction,
    },
  );
  return service.get({ plain: true });
}
const serviceRepository = { createService };
export default serviceRepository;
