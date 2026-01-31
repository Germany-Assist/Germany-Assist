import { sequelize } from "../../configs/database.js";
import authUtil from "../../utils/authorize.util.js";
import { AppError } from "../../utils/error.class.js";
import hashIdUtil from "../../utils/hashId.util.js";
import verificationRequestService from "./verificationRequest.services.js";

async function createProvider(req, res, next) {
  const t = await sequelize.transaction();
  try {
    const hasPermission = await authUtil.checkRoleAndPermission(req.auth, [
      "service_provider_root",
      "service_provider_rep",
    ]);
    if (!req.files || Object.values(req.files).length < 1)
      throw new AppError(
        422,
        "missing verification files",
        false,
        "missing verification files",
      );
    const results = await verificationRequestService.createProvider({
      auth: req.auth,
      files: req.files,
      type: req.body.type,
      providerId: req.auth.relatedId,
      relatedId: req.body?.relatedId,
      t,
    });

    await t.commit();
    res.status(201).json({ message: "Create request - not implemented" });
  } catch (error) {
    await t.rollback();
    next(error);
  }
}

async function updateProvider(req, res, next) {
  const t = await sequelize.transaction();
  try {
    const hasPermission = await authUtil.checkRoleAndPermission(req.auth, [
      "service_provider_root",
      "service_provider_rep",
    ]);
    if (!req.files || Object.values(req.files).length < 1)
      throw new AppError(
        422,
        "missing verification files",
        false,
        "missing verification files",
      );
    const results = await verificationRequestService.updateProvider({
      auth: req.auth,
      files: req.files,
      providerId: req.auth.relatedId,
      t,
    });
    await t.commit();
    res.status(200).json({ success: true });
  } catch (error) {
    await t.rollback();
    next(error);
  }
}

async function getAllProvider(req, res, next) {
  try {
    const hasPermission = await authUtil.checkRoleAndPermission(req.auth, [
      "service_provider_root",
      "service_provider_rep",
    ]);
    const results = await verificationRequestService.getAllProvider(
      req.auth.relatedId,
    );
    res.status(200).json({ success: true, data: results });
  } catch (error) {
    next(error);
  }
}

// ================== Admin ==================

async function getAllAdmin(req, res, next) {
  try {
    const hasPermission = await authUtil.checkRoleAndPermission(req.auth, [
      "admin",
      "super_admin",
    ]);
    const { data, meta } = await verificationRequestService.getAllAdmin(
      req.query,
    );
    res.status(200).json({ message: "success", data, meta });
  } catch (error) {
    next(error);
  }
}

async function updateAdmin(req, res, next) {
  try {
    const hasPermission = await authUtil.checkRoleAndPermission(req.auth, [
      "service_provider_root",
      "service_provider_rep",
    ]);
    const requestId = hashIdUtil.hashIdDecode(req.params.id);
    await verificationRequestService.updateAdmin(requestId, req.body);
    res
      .status(200)
      .json({ success: true, message: "Successfully updated the request" });
  } catch (error) {
    next(error);
  }
}

const verificationRequestController = {
  getAllAdmin,
  updateAdmin,
  createProvider,
  getAllProvider,
  updateProvider,
};

export default verificationRequestController;
