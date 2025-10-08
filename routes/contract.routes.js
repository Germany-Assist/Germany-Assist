import express from "express";
import * as contractController from "../controllers/contract.controller.js";
import jwt from "../middlewares/jwt.middleware.js";

const contractRouter = express.Router();

contractRouter.post(
  "/",
  jwt.authenticateJwt,
  contractController.createContract
);
contractRouter.get("/", contractController.getAllContracts);
contractRouter.get("/:id", contractController.getContractById);
contractRouter.put("/:id", contractController.updateContract);
contractRouter.delete("/:id", contractController.deleteContract);
contractRouter.post("/:id/restore", contractController.restoreContract);

export default contractRouter;
