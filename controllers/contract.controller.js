import * as contractServices from "../services/contract.services.js";
import authUtil from "../utils/authorize.util.js";
import { AppError } from "../utils/error.class.js";
function fillContract(template, data) {
  let text = JSON.stringify(template);
  for (const [key, value] of Object.entries(data)) {
    const regex = new RegExp(`{{${key}}}`, "g");
    text = text.replace(regex, value);
  }
  return JSON.parse(text);
}

const contractTemplate = {
  title: "Visa Processing Agreement for {{client_name}}",
  body: "This agreement confirms that {{agency_name}} will handle the work visa process for {{client_name}} applying for a {{country}} work permit. The processing time is estimated to be {{processing_days}} business days. The total service fee is {{price}} {{currency}}.",
};

const variables = {
  client_name: "Amr",
  agency_name: "Global Travel Agency",
  country: "Canada",
  processing_days: 10,
  price: 250,
  currency: "USD",
};
export async function createContract(req, res, next) {
  try {
    await authUtil.checkRoleAndPermission(req.auth, ["admin"]);
    await contractServices.createContract(req.body);
    res.sendStatus(201);
  } catch (error) {
    next(error);
  }
}
export async function getAllContracts(req, res, next) {
  try {
    const contracts = await contractServices.getAllContracts(req.query);
    res.status(200).json(contracts);
  } catch (error) {
    if (error instanceof AppError) error.appendTrace(req.requestId);
    next(error);
  }
}
export async function getContractById(req, res, next) {
  try {
    const contract = await contractServices.getContractById(req.params.id);
    res.status(200).json(contract);
  } catch (error) {
    if (error instanceof AppError) error.appendTrace(req.requestId);
    next(error);
  }
}
export async function updateContract(req, res, next) {
  try {
    const contract = await contractServices.updateContract(
      req.params.id,
      req.body
    );
    res.status(200).json(contract);
  } catch (error) {
    if (error instanceof AppError) error.appendTrace(req.requestId);
    next(error);
  }
}
export async function deleteContract(req, res, next) {
  try {
    const result = await contractServices.deleteContract(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    if (error instanceof AppError) error.appendTrace(req.requestId);
    next(error);
  }
}
export async function restoreContract(req, res, next) {
  try {
    const contract = await contractServices.restoreContract(req.params.id);
    res.status(200).json(contract);
  } catch (error) {
    if (error instanceof AppError) error.appendTrace(req.requestId);
    next(error);
  }
}
