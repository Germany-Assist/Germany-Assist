import categoryServices from "./category.services.js";
import authUtil from "../../utils/authorize.util.js";
import hashIdUtil from "../../utils/hashId.util.js";

export async function createCategory(req, res, next) {
  try {
    await authUtil.checkRoleAndPermission(
      req.auth,
      ["admin"],
      true,
      "category",
      "create",
    );
    await categoryServices.createCategory(req.body);
    res
      .status(201)
      .send({ success: true, message: "created category successfully" });
  } catch (error) {
    next(error);
  }
}

export async function updateCategory(req, res, next) {
  try {
    await authUtil.checkRoleAndPermission(
      req.auth,
      ["admin"],
      true,
      "category",
      "create",
    );
    const { id, title, label } = req.body;
    const catId = hashIdUtil.hashIdDecode(id);
    const data = { title, label };
    await categoryServices.updateCategory(catId, data);
    res
      .status(201)
      .send({ success: true, message: "updated category successfully" });
  } catch (error) {
    next(error);
  }
}

const categoryController = {
  createCategory,
  updateCategory,
};
export default categoryController;
