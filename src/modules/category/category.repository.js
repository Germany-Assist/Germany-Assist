import db from "../../database/index.js";
export const getAllCategories = async () => {
  return await db.Category.findAll({
    raw: true,
    attributes: ["id", "title", "label"],
  });
};
const categoryRepository = {
  getAllCategories,
};
export default categoryRepository;
