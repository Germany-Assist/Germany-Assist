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

const getTopPinnedPosts = async ({ timelineId, userId }) => {
  return db.Post.findAndCountAll({
    where: { timelineId, isPinned: true },
    order: [["createdAt", "DESC"]],
    limit: 5,
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
      {
        model: db.Order,
        attributes: [],
        required: true,
        where: {
          userId,
          status: {
            [Op.or]: ["active", "pending_completion", "completed"],
          },
        },
      },
    ],
  });
};

const getAllPosts = async ({ timelineId, userId, limit, offset }) => {
  return db.Post.findAndCountAll({
    where: { timelineId },
    limit,
    offset,
    order: [["createdAt", "DESC"]],
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
      {
        model: db.Order,
        attributes: [],
        required: true,
        where: {
          userId,
          status: {
            [Op.or]: ["active", "pending_completion", "completed"],
          },
        },
      },
    ],
  });
};

const postRepository = {
  authorizePostCreation,
  createNewPost,
  getAllPosts,
};
export default postRepository;
