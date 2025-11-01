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
// retrieve timeline
// this should only be used by sp
async function retrieveTimeline(timelineId) {
  return await db.Timeline.findOne({
    where: { id: timelineId },
    include: [{ model: db.Post }],
  });
}
async function getTimelineFull(userId, timelineId) {
  return await db.Timeline.findOne({
    where: { id: timelineId },
    attributes: ["id"],
    include: [
      {
        model: db.Post,
        attributes: ["id", "description", "attachments"],
        include: [
          {
            model: db.Comment,
            attributes: ["id", "body"],
            include: [
              { model: db.Comment, as: "replies", attributes: ["id", "body"] },
            ],
          },
        ],
      },
      {
        model: db.Order,
        attributes: [],
        required: true,
        where: {
          user_id: userId,
          status: { [Op.or]: ["paid", "fulfilled"] },
        },
      },
    ],
  });
}
const timelineServices = {
  retrieveTimeline,
  archiveTimeline,
  createTimeline,
  activeTimeline,
  getTimelineFull,
};
export default timelineServices;
