import express from "express";
import * as contractController from "../controllers/contract.controller.js";

const contractRouter = express.Router();

contractRouter.post("/", contractController.createContract);
contractRouter.get("/", contractController.getAllContracts);
contractRouter.get("/:id", contractController.getContractById);
contractRouter.put("/:id", contractController.updateContract);
contractRouter.delete("/:id", contractController.deleteContract);
contractRouter.post("/:id/restore", contractController.restoreContract);

export default contractRouter;
