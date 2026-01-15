import db from "../../database/index.js";

export const getAllCategories = async () => {
  return await db.Category.findAll({
    raw: true,
    attributes: ["id", "title", "label"],
  });
};
export const createCategory = async (data) => {
  return await db.Category.create(data);
};
export const updateCategory = async (id, data) => {
  return await db.Category.update(data, { where: { id } });
};

const categoryRepository = {
  getAllCategories,
  createCategory,
  updateCategory,
};
export default categoryRepository;
