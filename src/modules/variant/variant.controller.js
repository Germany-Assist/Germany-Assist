import variantServices from "./variant.service.js";
import authUtil from "../../utils/authorize.util.js";
import hashIdUtil from "../../utils/hashId.util.js";

async function archiveVariant(req, res, next) {
  try {
    await authUtil.checkRoleAndPermission(req.auth, ["service_provider_root"]);
    const id = hashIdUtil.hashIdDecode(req.params.id);
    await variantServices.archiveVariant(req.auth.relatedId, id);
    res.send({
      success: true,
    });
  } catch (error) {
    next(error);
  }
}
async function createNewVariant(req, res, next) {
  try {
    await authUtil.checkRoleAndPermission(req.auth, ["service_provider_root"]);
    await variantServices.createNewVariant(req.auth.relatedId, req.body);
    res.status(201).send({
      success: true,
    });
  } catch (error) {
    next(error);
  }
}
const variantController = {
  archiveVariant,
  createNewVariant,
};
export default variantController;
