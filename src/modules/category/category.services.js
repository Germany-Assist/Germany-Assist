import db from "../../database/dbIndex.js";

export const createCategory = async (data) => {
  return await db.Category.create(data);
};
export const updateCategory = async (id, data) => {
  return await db.Category.update(data, { where: { id } });
};
export const getAllCategories = async () => {
  return await db.Category.findAll({
    raw: true,
    attributes: ["id", "title", "label"],
  });
};

const categoryServices = {
  createCategory,
  updateCategory,
  getAllCategories,
};
export default categoryServices;
