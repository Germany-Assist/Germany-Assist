import { Op } from "sequelize";
import db from "../database/dbIndex.js";

async function createNewComment(data, t) {
  await db.Comment.create(data, t);
}
async function canCommentOnPost(userId, postId) {
  const can = await db.Post.findOne({
    where: { id: postId },
    attributes: ["id"],
    include: [
      {
        model: db.Timeline,
        attributes: [],
        required: true,
        where: { is_archived: { [Op.ne]: true } },
        include: [
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
      },
    ],
  });
  return can;
}

const commentServices = {
  createNewComment,
  canCommentOnPost,
};
export default commentServices;
