import { AppError } from "../../utils/error.class.js";
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

const postServices = {
  createNewPost,
};
export default postServices;
