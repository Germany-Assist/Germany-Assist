import hashIdUtil from "../../utils/hashId.util.js";
import postRepository from "./post.repository.js";

async function createNewPost({ body, auth, transaction }) {
  const { description, isPinned } = body;
  const timelineId = hashIdUtil.hashIdDecode(body.timelineId);
  const timeline = await postRepository.authorizePostCreation(
    timelineId,
    auth.relatedId,
  );
  const newPostData = {
    timelineId,
    description,
    isPinned,
  };
  return await postRepository.createNewPost(newPostData, transaction);
}
async function getAllPosts({ timelineId, userId, filters = {} }) {
  const page = Number(filters.page) || 1;
  const limit = Number(filters.limit) || 10;
  const offset = (page - 1) * limit;
  const { count, rows } = await postRepository.getAllPosts({
    timelineId,
    userId,
    limit,
    offset,
  });
  return {
    posts: rows,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    },
  };
}
const postServices = {
  createNewPost,
  getAllPosts,
};
export default postServices;
