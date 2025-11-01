import { sequelize } from "../database/connection.js";
import commentServices from "../services/comment.services.js";
import hashIdUtil from "../utils/hashId.util.js";

async function createNewComment(req, res, next) {
  const t = await sequelize.transaction();

  try {
    // i need the post id
    // that should match postId => timelineId
    // that should match userId => orderId => timelineId => isActive
    // comment body/comment // postId,user-auth
    // const dummy = {
    //   body: "Dadw",
    //   relatedId: "123",
    //   relatedType: "post",
    // };
    const { relatedType, body } = req.body;
    const postId = hashIdUtil.hashIdDecode(req.body.relatedId);
    const able = await commentServices.canCommentOnPost(req.auth.id, postId);
    console.log(able);

    const data = {
      user_id: req.auth.id,
    };
    // await commentServices.createNewComment(data, t);
    res.send(201);
    await t.commit();
  } catch (error) {
    await t.rollback();
    next(error);
  }
}
const commentController = {
  createNewComment,
};
export default commentController;
