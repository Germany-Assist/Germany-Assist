import db from "../database/dbIndex.js";

export const updateContract = async (id, contract_template, variables) => {
  return await db.Category.update(
    {
      contract_template,
      variables,
    },
    { where: { id } }
  );
};

export const createCategory = async (data) => {
  return await db.Category.create(data);
};

export const updateCategory = async (id, data) => {
  return await db.Category.update(data, { where: { id } });
};
export const getAllCategories = async (id, data) => {
  return await db.Category.findAll({
    raw: true,
    attributes: ["id", "title", "label", "variables", "contract_template"],
  });
};

const categoryServices = {
  createCategory,
  updateCategory,
  updateContract,
  getAllCategories,
};
export default categoryServices;
