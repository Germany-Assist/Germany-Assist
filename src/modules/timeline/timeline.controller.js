import { generateDownloadUrl } from "../../configs/s3Configs.js";
import { sequelize } from "../../configs/database.js";
import timelineServices from "./timeline.service.js";
import authUtil from "../../utils/authorize.util.js";
import { AppError } from "../../utils/error.class.js";
import hashIdUtil from "../../utils/hashId.util.js";

function formatComment(comments) {
  return comments.map((i) => {
    return {
      id: hashIdUtil.hashIdEncode(i.id),
      body: i.body,
      parentId: i.parentId ? hashIdUtil.hashIdEncode(i.parentId) : null,
    };
  });
}
async function formatPost(post) {
  let assets = [];
  if (post.Assets && post.Assets.length > 0) {
    assets = await Promise.all(
      post.Assets.map(async (i) => {
        return { ...i, url: await generateDownloadUrl(i.url) };
      })
    );
  }

  return {
    id: hashIdUtil.hashIdEncode(post.id),
    description: post.description,
    attachments: post.attachments,
    assets,
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
    await active.update({ isArchived: true }, { transaction: t });
    await timelineServices.createTimeline(serviceId, label, t);
    res.send(201);
    await t.commit();
  } catch (error) {
    await t.rollback();
    next(error);
  }
}
async function getTimelineByIdClient(req, res, next) {
  try {
    await authUtil.checkRoleAndPermission(req.auth, ["client"]);
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
    let posts = [];
    if (timeline.Posts) {
      posts = await Promise.all(timeline.Posts.map(formatPost));
    }
    res.send({
      id: hashIdUtil.hashIdEncode(timeline.id),
      posts,
    });
  } catch (error) {
    next(error);
  }
}
async function getTimelineById(req, res, next) {
  try {
    await authUtil.checkRoleAndPermission(req.auth, [
      "service_provider_rep",
      "service_provider_root",
    ]);
    const timelineId = hashIdUtil.hashIdDecode(req.params.id);
    const timeline = await timelineServices.getTimelineSP(
      req.auth.related_id,
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
    let posts = [];
    if (timeline.Posts && timeline.Posts.length > 0) {
      posts = await Promise.all(timeline.Posts.map(formatPost));
    }
    res.send({
      id: hashIdUtil.hashIdEncode(timeline.id),
      posts,
    });
  } catch (error) {
    next(error);
  }
}
const timelineController = {
  newTimeline,
  getTimelineById,
  getTimelineByIdClient,
};
export default timelineController;
