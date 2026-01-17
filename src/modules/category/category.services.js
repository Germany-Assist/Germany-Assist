import db from "../../database/index.js";

export const createCategory = async (data) => {
  return await db.Category.create(data);
};
export const updateCategory = async (id, data) => {
  return await db.Category.update(data, { where: { id } });
};

const categoryServices = {
  createCategory,
  updateCategory,
};
export default categoryServices;
