import { sequelize } from "../../configs/database.js";
import postServices from "./post.service.js";
import timelineServices from "../timeline/timeline.service.js";
import authUtil from "../../utils/authorize.util.js";
import { AppError } from "../../utils/error.class.js";
import hashIdUtil from "../../utils/hashId.util.js";

async function createNewPost(req, res, next) {
  const t = await sequelize.transaction();
  try {
    const { serviceId, description, attachments } = req.body;
    await authUtil.checkRoleAndPermission(
      req.auth,
      ["service_provider_rep", "service_provider_root"],
      true,
      "post",
      "create"
    );

    const timeline = await timelineServices.activeTimeline(
      hashIdUtil.hashIdDecode(serviceId)
    );
    if (!timeline)
      throw new AppError(
        404,
        "failed to find timeline",
        true,
        "failed to find timeline"
      );
    //this is just a short way to make sure of the owner instead of using the checkOwnership function due to speed and and complicated nesting
    if (req.auth.relatedId !== timeline.Service.owner)
      throw new AppError(403, "invalid ownership", true, "invalid ownership");
    const post = await postServices.createNewPost(
      {
        description,
        attachments,
        timelineId: timeline.id,
        userId: req.auth.id,
      },
      t
    );
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
