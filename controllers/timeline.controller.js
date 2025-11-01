import { sequelize } from "../database/connection.js";
import timelineServices from "../services/timeline.service.js";
import authUtil from "../utils/authorize.util.js";
import { AppError } from "../utils/error.class.js";
import hashIdUtil from "../utils/hashId.util.js";

async function newTimeline(req, res, next) {
  const t = await sequelize.transaction();
  try {
    await authUtil.checkRoleAndPermission(req.auth, [
      "service_provider_rep",
      "service_provider_root",
    ]);
    const serviceId = hashIdUtil.hashIdDecode(req.params.id);
    const { label } = req.body;
    const active = await timelineServices.activeTimeline(serviceId);
    if (!active)
      throw new AppError(
        409,
        "failed to find current active timeline",
        true,
        `failed to find current active timeline`
      );
    await active.update({ is_archived: true }, { transaction: t });
    await timelineServices.createTimeline(serviceId, label, t);
    res.send(201);
    await t.commit();
  } catch (error) {
    await t.rollback();
    next(error);
  }
}
async function getTimelineById(req, res, next) {
  try {
    const timelineId = hashIdUtil.hashIdDecode(req.params.id);
    const timeline = await timelineServices.getTimelineFull(
      req.auth.id,
      timelineId
    );
    res.send(timeline);
  } catch (error) {
    next(error);
  }
}
const timelineController = {
  newTimeline,
  getTimelineById,
};
export default timelineController;
