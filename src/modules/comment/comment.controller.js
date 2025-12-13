import { sequelize } from "../../configs/database.js";
import commentServices from "./comment.services.js";
import { AppError } from "../../utils/error.class.js";
import hashIdUtil from "../../utils/hashId.util.js";

async function createNewComment(req, res, next) {
  const t = await sequelize.transaction();
  try {
    const { body } = req.body;
    const post_id = hashIdUtil.hashIdDecode(req.body.postId);
    const comment_id = hashIdUtil.hashIdDecode(req.body.commentId);
    let able = await commentServices.canCommentOnPost(req.auth.id, post_id);
    if (!able)
      throw new AppError(403, "permission denied", true, "permission denied");
    const data = {
      user_id: req.auth.id,
      parent_id: comment_id ?? null,
      post_id,
      body,
    };
    await commentServices.createNewComment(data, t);
    res
      .status(201)
      .send({ success: true, message: "Successfully Created Comment" });
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
