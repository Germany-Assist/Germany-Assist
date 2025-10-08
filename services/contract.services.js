import db from "../database/dbIndex.js";
import { AppError } from "../utils/error.class.js";

export const createContract = async (contractData) => {
  return await db.Contract.create({
    title: contractData.title,
    contract_template: contractData.contractTemplate,
    variables: contractData.variables,
    fixed_variables: contractData.fixedVariables,
    category_id: contractData.categoryId,
  });
};

export const getAllContracts = async (filters = {}) => {
  return await db.Contract.findAll({ where: filters });
};

export const getContractById = async (id) => {
  const contract = await db.Contract.findByPk(id);
  if (!contract)
    throw new AppError(404, "Contract not found", true, "Contract not found");
  return contract;
};

export const updateContract = async (id, updateData) => {
  const contract = await db.Contract.findByPk(id);
  if (!contract)
    throw new AppError(404, "Contract not found", true, "Contract not found");

  await contract.update(updateData);
  return contract;
};

export const deleteContract = async (id) => {
  const contract = await db.Contract.findByPk(id);
  if (!contract)
    throw new AppError(404, "Contract not found", true, "Contract not found");

  await contract.destroy();
  return { id, message: "Contract deleted" };
};

export const restoreContract = async (id) => {
  const contract = await db.Contract.findOne({
    where: { id },
    paranoid: false,
  });

  if (!contract.deletedAt)
    throw new AppError(404, "Contract not found", true, "Contract not found");
  if (!contract.deletedAt)
    throw new AppError(
      400,
      "Contract is not deleted",
      true,
      "Contract is not deleted"
    );

  await contract.restore();
  return contract;
};
