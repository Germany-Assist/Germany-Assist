import { Op } from "sequelize";
import db from "../../database/index.js";
import { AppError } from "../../utils/error.class.js";

async function getTimelineForClient({
  userId,
  timelineId,
  pinned = false,
  page = 0,
}) {
  const where = {};
  if (pinned) where.isPinned = true;
  const timeline = await db.Timeline.findOne({
    attributes: ["id"],
    where: { id: timelineId },
    include: [
      {
        model: db.Post,
        attributes: ["id", "description"],
        where,
        limit: pinned ? 3 : 10,
        offset: pinned ? 0 : page * 10,
        include: [
          {
            model: db.Asset,
            attributes: ["url", "thumb", "key", "mediaType", "name"],
          },
          {
            model: db.Comment,
            attributes: ["id", "body", "parentId"],
            limit: 3,
          },
        ],
        order: [["createdAt", "DESC"]],
      },
      {
        model: db.Order,
        attributes: [],
        as: "orders",
        required: true,
        where: {
          userId: userId,
          status: { [Op.or]: ["active", "pending_completion", "completed"] },
        },
      },
    ],
  });
  if (!timeline)
    throw new AppError(
      404,
      "failed to find the timeline in your orders",
      true,
      "failed to find the timeline in your orders",
    );
  return timeline.toJSON();
}

const timelineRepository = { getTimelineForClient };
export default timelineRepository;
