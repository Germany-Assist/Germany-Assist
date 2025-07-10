import express from "express";
import {
  createContract,
  getAllContracts,
  getContractById,
  updateContract,
  deleteContract,
  restoreContract,
} from "../controllers/contract.controller.js";

const contractRouter = express.Router();

// Create a new contract
contractRouter.post("/", async (req, res, next) => {
  try {
    const contract = await createContract(req.body);
    res.status(201).json(contract);
  } catch (error) {
    next(error);
  }
});

// Get all contracts
contractRouter.get("/", async (req, res, next) => {
  try {
    const contracts = await getAllContracts(req.query);
    res.status(200).json(contracts);
  } catch (error) {
    next(error);
  }
});

// Get contract by ID
contractRouter.get("/:id", async (req, res, next) => {
  try {
    const contract = await getContractById(req.params.id);
    res.status(200).json(contract);
  } catch (error) {
    next(error);
  }
});

// Update contract
contractRouter.put("/:id", async (req, res, next) => {
  try {
    const contract = await updateContract(req.params.id, req.body);
    res.status(200).json(contract);
  } catch (error) {
    next(error);
  }
});

// Delete contract
contractRouter.delete("/:id", async (req, res, next) => {
  try {
    const result = await deleteContract(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

// Restore contract
contractRouter.post("/:id/restore", async (req, res, next) => {
  try {
    const contract = await restoreContract(req.params.id);
    res.status(200).json(contract);
  } catch (error) {
    next(error);
  }
});

export default contractRouter;
