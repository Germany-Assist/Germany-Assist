import db from "../../database/index.js";

async function createNewPost(data, t) {
  return await db.Post.create(data, { transaction: t });
}
const postServices = {
  createNewPost,
};
export default postServices;
