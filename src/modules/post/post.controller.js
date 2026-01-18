import { sequelize } from "../../configs/database.js";
import postServices from "./post.service.js";
import authUtil from "../../utils/authorize.util.js";

async function createNewPost(req, res, next) {
  const t = await sequelize.transaction();
  try {
    await authUtil.checkRoleAndPermission(
      req.auth,
      ["service_provider_rep", "service_provider_root"],
      true,
      "post",
      "create",
    );
    const post = await postServices.createNewPost({
      body: req.body,
      auth: req.auth,
      transaction: t,
    });
    await t.commit();
    res
      .status(201)
      .send({ success: true, message: "Created Post Successfully" });
  } catch (error) {
    await t.rollback();
    next(error);
  }
}
async function getAllPostsForTimeline(req, res, next) {
  try {
    await authUtil.checkRoleAndPermission(req.auth, ["client"], true);
    const { timelineId } = req.params;
    const { page, limit } = req.query;
    const data = await postServices.getAllPosts({
      timelineId,
      userId: req.auth.id,
      filters: { page, limit },
    });
    res.status(200).send({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}
const postController = {
  createNewPost,
  getAllPostsForTimeline,
};
export default postController;
