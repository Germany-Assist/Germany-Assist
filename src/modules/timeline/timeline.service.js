import { Op } from "sequelize";
import db from "../../database/index.js";
import { AppError } from "../../utils/error.class.js";
// create new timeline
async function createTimeline(serviceId, label = "newTimeline", t) {
  return await db.Timeline.create(
    { serviceId: serviceId, label: label },
    { transaction: t }
  );
}
async function activeTimeline(serviceId, t) {
  return await db.Timeline.findOne({
    where: { serviceId: serviceId, isArchived: false },
    include: [{ model: db.Service }],
    transaction: t,
  });
}
// archive time line
async function archiveTimeline(timelineId, t) {
  return await db.Timeline.update(
    { isArchived: true },
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
            model: db.Asset,
            attributes: ["url", "thumb", "key", "mediaType", "name"],
          },
          {
            model: db.Comment,
            attributes: ["id", "body", "parentId"],
          },
        ],
      },
      {
        model: db.Order,
        attributes: [],
        required: true,
        where: {
          userId: userId,
          status: { [Op.or]: ["paid", "fulfilled", "completed"] },
        },
      },
    ],
  });
  if (!timeline)
    throw new AppError(
      404,
      "failed to find the timeline in your orders",
      true,
      "failed to find the timeline in your orders"
    );
  return timeline.toJSON();
}

async function getTimelineSP(serviceProviderId, timelineId) {
  const timeline = await db.Timeline.findOne({
    where: { id: timelineId },
    attributes: ["id"],
    include: [
      {
        model: db.Post,
        attributes: ["id", "description", "attachments"],
        include: [
          {
            model: db.Asset,
            attributes: ["url", "thumb", "key", "mediaType", "name"],
          },
          {
            model: db.Comment,
            attributes: ["id", "body", "parentId"],
          },
        ],
      },
      {
        model: db.Service,
        attributes: [],
        required: true,
        where: {
          serviceProviderId: serviceProviderId,
        },
      },
    ],
  });
  if (!timeline)
    throw new AppError(
      404,
      "failed to find the timeline in your orders",
      true,
      "failed to find the timeline in your orders"
    );
  return timeline.toJSON();
}

const timelineServices = {
  archiveTimeline,
  createTimeline,
  activeTimeline,
  getTimelineFull,
  getTimelineSP,
};
export default timelineServices;
