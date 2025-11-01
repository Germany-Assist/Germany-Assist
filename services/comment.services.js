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
              status: { [Op.or]: ["paid", "fulfilled"] },
            },
          },
        ],
      },
    ],
  });
  return can;
}
// async function canCommentOnComment(userId, postId) {
//   await db.Post.findOne({
//     where: { id: postId },
//     include: [
//       {
//         model: db.Timeline,
//         required: true,
//         where: { is_archived: { [Op.ne]: true } },
//         include: [
//           { model: db.Order, required: true, where: { user_id: userId } },
//         ],
//       },
//     ],
//   });
// }

// async function canCommentOnPost(userId, postId) {
//   const can = await db.Post.findOne({
//     where: { id: postId },
//     attributes: [],
//     include: [
//       {
//         model: db.Timeline,
//         attributes: [],
//         required: true,
//         where: { is_archived: { [Op.ne]: true } },
//         include: [
//           {
//             model: db.Order,
//             attributes: [],
//             required: true,
//             where: {
//               user_id: userId,
//               status: { [Op.or]: ["paid", "fulfilled"] },
//             },
//           },
//         ],
//       },
//     ],
//   });
//   return can;
// }
const commentServices = {
  createNewComment,
  canCommentOnPost,
};
export default commentServices;
