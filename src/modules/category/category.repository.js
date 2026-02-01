import db from "../../database/index.js";

export const getAllCategories = async () => {
  return await db.Category.findAll({
    attributes: ["id", "title", "label"],
    include: [{ model: db.Subcategory, attributes: ["title", "label", "id"] }],
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
