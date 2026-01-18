import timelineMappers from "./timeline.mappers.js";
import timelineRepository from "./timeline.repository.js";

async function getTimelineForClient(userId, timelineId, page) {
  const postsData = await timelineRepository.getTimelineForClient({
    userId,
    timelineId,
    page,
  });
  const sanitizedPosts = await timelineMappers.sanitizeTimeline(postsData);
  if (page > 0) {
    return {
      sanitizedPosts,
      sanitizedPinnedPosts: null,
    };
  }

  const pinnedData = await timelineRepository.getTimelineForClient({
    userId,
    timelineId,
    pinned: true,
  });
  const sanitizedPinnedPosts =
    await timelineMappers.sanitizeTimeline(pinnedData);
  return { sanitizedPosts, sanitizedPinnedPosts };
}

const timelineServices = {
  getTimelineForClient,
};
export default timelineServices;
