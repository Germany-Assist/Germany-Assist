import * as contractServices from "../services/contract.services.js";
import { AppError } from "../utils/error.class.js";

export async function createContract(req, res, next) {
  try {
    const contract = await contractServices.createContract(req.body);
    res.status(201).json(contract);
  } catch (error) {
    if (error instanceof AppError) error.appendTrace(req.requestId);
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
