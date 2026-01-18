import timelineServices from "./timeline.service.js";
import authUtil from "../../utils/authorize.util.js";
import { AppError } from "../../utils/error.class.js";
import hashIdUtil from "../../utils/hashId.util.js";

async function getTimelineByIdForClient(req, res, next) {
  try {
    await authUtil.checkRoleAndPermission(req.auth, ["client"]);
    const id = hashIdUtil.hashIdDecode(req.params.id);
    const page = req.query.page || 0;
    const { sanitizedPosts, sanitizedPinnedPosts } =
      await timelineServices.getTimelineForClient(req.auth.id, id, page);
    if (!sanitizedPosts) {
      throw new AppError(
        404,
        "failed to find timeline",
        true,
        "failed to find timeline",
      );
    }
    res.send({
      success: true,
      posts: sanitizedPosts,
      pinnedPosts: sanitizedPinnedPosts,
    });
  } catch (error) {
    next(error);
  }
}

const timelineController = {
  getTimelineByIdForClient,
};
export default timelineController;
