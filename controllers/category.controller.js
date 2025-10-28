import categoryServices from "../services/category.services.js";
import authUtil from "../utils/authorize.util.js";
import hashIdUtil from "../utils/hashId.util.js";

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

export async function updateCategory(req, res, next) {
  try {
    await authUtil.checkRoleAndPermission(
      req.auth,
      ["admin"],
      true,
      "category",
      "create"
    );
    const { id, title, label } = req.body;
    const catId = hashIdUtil.hashIdDecode(id);
    const data = { title, label };
    await categoryServices.updateCategory(catId, data);
    res.sendStatus(201);
  } catch (error) {
    next(error);
  }
}
export async function getAllCategories(req, res, next) {
  try {
    const categories = await categoryServices.getAllCategories();
    const sanitizedCategories = categories.map((i) => {
      return { ...i, id: hashIdUtil.hashIdEncode(i.id) };
    });
    res.send(sanitizedCategories);
  } catch (error) {
    next(error);
  }
}
const categoryController = {
  createCategory,
  updateCategory,
  getAllCategories,
};
export default categoryController;
