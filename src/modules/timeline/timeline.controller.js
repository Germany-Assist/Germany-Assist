import { generateDownloadUrl } from "../../configs/s3Configs.js";
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
      }),
    );
  }

  return {
    id: hashIdUtil.hashIdEncode(post.id),
    description: post.description,
    assets,
    comments: post.Comments ? formatComment(post.Comments) : [],
  };
}

async function getTimelineByIdForClient(req, res, next) {
  try {
    await authUtil.checkRoleAndPermission(req.auth, ["client"]);
    const timelineId = hashIdUtil.hashIdDecode(req.params.id);
    const timeline = await timelineServices.getTimelineForClient(
      req.auth.id,
      timelineId,
    );
    if (!timeline) {
      throw new AppError(
        404,
        "failed to find timeline",
        true,
        "failed to find timeline",
      );
    }
    console.log(timeline);
    res.send({ success: true });
  } catch (error) {
    next(error);
  }
}

const timelineController = {
  // newTimeline,
  // getTimelineById,
  getTimelineByIdForClient,
  // getAllTimelinesForSP,
};
export default timelineController;
