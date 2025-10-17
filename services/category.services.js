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
  return await db.Category.update(data, { where: id });
};

const categoryServices = { createCategory, updateCategory, updateContract };
export default categoryServices;
