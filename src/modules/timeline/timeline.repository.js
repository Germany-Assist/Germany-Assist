import db from "../../database/index.js";

const getAllTimelines = async (timelineFilters, serviceFilters) => {
  return await db.Timeline.findAll({ where: timelineFilters, raw: true });
};

const timelineRepository = { getAllTimelines };
export default timelineRepository;
