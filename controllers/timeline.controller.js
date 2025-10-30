import { sequelize } from "../database/connection";
import timelineServices from "../services/timeline.service";
import hashIdUtil from "../utils/hashId.util";

async function newTimeline(req, res, next) {
  const t = await sequelize.transaction();
  try {
    const serviceId = hashIdUtil.hashIdDecode(req.param.id);
    const { label } = req.body;
    const active = await timelineServices.activeTimeline(serviceId);
    if (active)
      throw new AppError(
        409,
        "There is an active timeline please archive it first",
        true
      );
    await timelineServices.createTimeline(serviceId, label, t);
    res.send(201);
    await t.commit();
  } catch (error) {
    await t.rollback();
    next(error);
  }
}

const timelineController = {
  newTimeline,
};
export default timelineController;
