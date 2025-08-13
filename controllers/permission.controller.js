import * as permissionServices from "../services/permission.services.js";
export async function assignPermission(req, res, next) {
  try {
    console.log("success");
    // const { userId, permissionId } = req.body;
    // permissionServices.adjustPermission(userId, permissionId, "assign");
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
}

export async function revokePermission(req, res, next) {
  try {
    const { userId, permissionId } = req.body;
    permissionServices.adjustPermission(userId, permissionId, "revoke");
  } catch (error) {
    next(error);
  }
}
