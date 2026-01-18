import { sequelize } from "../../configs/database.js";
import postServices from "./post.service.js";
import authUtil from "../../utils/authorize.util.js";
import { param } from "express-validator";

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

const postController = {
  createNewPost,
};
export default postController;
