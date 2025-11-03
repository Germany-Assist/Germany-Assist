import { Op } from "sequelize";
import db from "../database/dbIndex.js";
// create new timeline
async function createTimeline(serviceId, label = "newTimeline", t) {
  return await db.Timeline.create(
    { service_id: serviceId, label: label },
    { transaction: t }
  );
}
async function activeTimeline(serviceId, t) {
  return await db.Timeline.findOne({
    where: { service_id: serviceId, is_archived: false },
    include: [{ model: db.Service }],
    transaction: t,
  });
}
// archive time line
async function archiveTimeline(timelineId, t) {
  return await db.Timeline.update(
    { is_archived: true },
    { where: { id: timelineId }, transaction: t }
  );
}

async function getTimelineFull(userId, timelineId) {
  const timeline = await db.Timeline.findOne({
    where: { id: timelineId },
    attributes: ["id"],
    include: [
      {
        model: db.Post,
        attributes: ["id", "description", "attachments"],
        include: [
          {
            model: db.Comment,
            attributes: ["id", "body", "parent_id"],
          },
        ],
      },
      {
        model: db.Order,
        attributes: [],
        required: true,
        where: {
          user_id: userId,
          status: { [Op.or]: ["paid", "fulfilled", "completed"] },
        },
      },
    ],
  });
  return timeline.toJSON();
}
const timelineServices = {
  archiveTimeline,
  createTimeline,
  activeTimeline,
  getTimelineFull,
};
export default timelineServices;
