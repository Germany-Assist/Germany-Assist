import categoryServices from "../services/category.services.js";
import authUtil from "../utils/authorize.util.js";
import { AppError } from "../utils/error.class.js";

//--------helper-----------//
export function fillContract(template, data) {
  let text = JSON.stringify(template);
  for (const [key, value] of Object.entries(data)) {
    const regex = new RegExp(`{{${key}}}`, "g");
    text = text.replace(regex, value);
  }
  return JSON.parse(text);
}
//--------end helper-------//

export async function createCategory(req, res, next) {
  try {
    await authUtil.checkRoleAndPermission(
      req.auth,
      ["admin"],
      true,
      "category",
      "create"
    );
    await categoryServices.createCategory(req.body);
    res.sendStatus(201);
  } catch (error) {
    next(error);
  }
}
export async function updateContract(req, res, next) {
  try {
    await authUtil.checkRoleAndPermission(
      req.auth,
      ["admin"],
      true,
      "category",
      "create"
    );
    await categoryServices.updateContract(req.body);
    res.sendStatus(201);
  } catch (error) {
    next(error);
  }
}
export async function updateCategory(params) {
  try {
    await authUtil.checkRoleAndPermission(
      req.auth,
      ["admin"],
      true,
      "category",
      "create"
    );
    await categoryServices.updateCategory(req.body);
    res.sendStatus(201);
  } catch (error) {
    next(error);
  }
}

// export async function getAllContracts(req, res, next) {
//   try {
//     const contracts = await contractServices.getAllContracts(req.query);
//     res.status(200).json(contracts);
//   } catch (error) {
//     if (error instanceof AppError) error.appendTrace(req.requestId);
//     next(error);
//   }
// }
// export async function getContractById(req, res, next) {
//   try {
//     const contract = await contractServices.getContractById(req.params.id);
//     res.status(200).json(contract);
//   } catch (error) {
//     if (error instanceof AppError) error.appendTrace(req.requestId);
//     next(error);
//   }
// }
// export async function updateContract(req, res, next) {
//   try {
//     const contract = await contractServices.updateContract(
//       req.params.id,
//       req.body
//     );
//     res.status(200).json(contract);
//   } catch (error) {
//     if (error instanceof AppError) error.appendTrace(req.requestId);
//     next(error);
//   }
// }
// export async function deleteContract(req, res, next) {
//   try {
//     const result = await contractServices.deleteContract(req.params.id);
//     res.status(200).json(result);
//   } catch (error) {
//     if (error instanceof AppError) error.appendTrace(req.requestId);
//     next(error);
//   }
// }
// export async function restoreContract(req, res, next) {
//   try {
//     const contract = await contractServices.restoreContract(req.params.id);
//     res.status(200).json(contract);
//   } catch (error) {
//     if (error instanceof AppError) error.appendTrace(req.requestId);
//     next(error);
//   }
// }
const categoryController = {
  fillContract,
  createCategory,
  updateContract,
  updateCategory,
};
export default categoryController;
