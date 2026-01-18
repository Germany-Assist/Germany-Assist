import { Op } from "sequelize";
import db from "../../database/index.js";
import { AppError } from "../../utils/error.class.js";

async function createNewPost(data, t) {
  return await db.Post.create(data, { transaction: t });
}

const authorizePostCreation = async (timelineId, serviceProviderId) => {
  const timeline = await db.Timeline.findOne({
    where: { id: timelineId },
    include: [
      {
        model: db.Service,
        required: true,
        where: { serviceProviderId: serviceProviderId },
        attributes: [],
      },
    ],
  });
  if (!timeline) {
    throw new AppError(403, "You do not own this service");
  }
  return timeline;
};
const authorizeClientTimelineFetching = async (userId, timelineId) => {
  return db.Timeline.findOne({
    where: { id: timelineId },
    raw: true,
    include: [
      {
        model: db.Order,
        attributes: [],
        as: "orders",
        required: true,
        where: {
          userId,
          status: { [Op.or]: ["active", "pending_completion", "completed"] },
        },
      },
    ],
  });
};

const postRepository = {
  authorizePostCreation,
  authorizeClientTimelineFetching,
  createNewPost,
};
export default postRepository;
