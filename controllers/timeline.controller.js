import { body } from "express-validator";
import { sequelize } from "../database/connection.js";
import timelineServices from "../services/timeline.service.js";
import authUtil from "../utils/authorize.util.js";
import { AppError } from "../utils/error.class.js";
import hashIdUtil from "../utils/hashId.util.js";

function formatComment(comments) {
  return comments.map((i) => {
    return {
      id: hashIdUtil.hashIdEncode(i.id),
      body: i.body,
      parentId: i.parent_id ? hashIdUtil.hashIdEncode(i.parent_id) : null,
    };
  });
}
function formatPost(post) {
  return {
    id: hashIdUtil.hashIdEncode(post.id),
    description: post.description,
    attachments: post.attachments,
    comments: post.Comments ? formatComment(post.Comments) : [],
  };
}
async function newTimeline(req, res, next) {
  const t = await sequelize.transaction();
  try {
    await authUtil.checkRoleAndPermission(req.auth, [
      "service_provider_rep",
      "service_provider_root",
    ]);
    const serviceId = hashIdUtil.hashIdDecode(req.params.id);
    const { label } = req.body;
    const active = await timelineServices.activeTimeline(serviceId);
    if (!active)
      throw new AppError(
        409,
        "failed to find current active timeline",
        true,
        `failed to find current active timeline`
      );
    await active.update({ is_archived: true }, { transaction: t });
    await timelineServices.createTimeline(serviceId, label, t);
    res.send(201);
    await t.commit();
  } catch (error) {
    await t.rollback();
    next(error);
  }
}
async function getTimelineById(req, res, next) {
  try {
    const timelineId = hashIdUtil.hashIdDecode(req.params.id);
    const timeline = await timelineServices.getTimelineFull(
      req.auth.id,
      timelineId
    );

    if (!timeline) {
      throw new AppError(
        404,
        "failed to find timeline",
        true,
        "failed to find timeline"
      );
    }
    res.send({
      id: hashIdUtil.hashIdEncode(timeline.id),
      posts: timeline.Posts?.map(formatPost) || [],
    });
  } catch (error) {
    next(error);
  }
}
const timelineController = {
  newTimeline,
  getTimelineById,
};
export default timelineController;
