import db from "../database/dbIndex.js";

export const createContract = async (contractData) => {
  return await db.Contracts.create({
    name: contractData.name,
    about: contractData.about,
    description: contractData.description,
    requests: contractData.requests || 0,
    contract: contractData.contract,
  });
};

export const getAllContracts = async (filters = {}) => {
  return await db.Contracts.findAll({ where: filters });
};

export const getContractById = async (id) => {
  const contract = await db.Contracts.findByPk(id);
  if (!contract) throw new Error("Contract not found");
  return contract;
};

export const updateContract = async (id, updateData) => {
  const contract = await db.Contracts.findByPk(id);
  if (!contract) throw new Error("Contract not found");

  await contract.update(updateData);
  return contract;
};

export const deleteContract = async (id) => {
  const contract = await db.Contracts.findByPk(id);
  if (!contract) throw new Error("Contract not found");

  await contract.destroy();
  return { id, message: "Contract deleted" };
};

export const restoreContract = async (id) => {
  const contract = await db.Contracts.findOne({
    where: { id },
    paranoid: false,
  });

  if (!contract) throw new Error("Contract not found");
  if (!contract.deletedAt) throw new Error("Contract is not deleted");

  await contract.restore();
  return contract;
};
