import categoryServices from "../services/category.services.js";
import authUtil from "../utils/authorize.util.js";
import { AppError } from "../utils/error.class.js";
import hashIdUtil from "../utils/hashId.util.js";

//--------helper-----------//

export function fillContract(template, data) {
  return template.replace(/{{([^{}]+)}}/g, (_, key) => {
    const value = data?.[key];
    return value ?? `{{${key}}}`;
  });
}
export function initContract(inquiry) {
  const user = inquiry.User;
  const service = inquiry.Service;
  const serviceProvider = service.ServiceProvider;
  const template = service.Category.contract_template;
  //fixed variables
  const data = {
    client_first_name: user.first_name,
    client_last_name: user.last_name,
    client_phone_number: user.phone_number,
    client_email: user.email,
    service_provider_name: serviceProvider.name,
    service_provider_email: serviceProvider.email,
    service_provider_id: serviceProvider.id,
    service_provider_number: serviceProvider.phone_number,
    service_title: service.title,
    service_id: hashIdUtil.hashIdEncode(service.id),
    agreement_date: new Date(Date.now()),
  };
  return fillContract(template, data);
}
//--------end helper-------//

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
export async function updateContract(req, res, next) {
  try {
    await authUtil.checkRoleAndPermission(
      req.auth,
      ["admin"],
      true,
      "contract",
      "update"
    );
    const { id, contract_template, variables } = req.body;
    const catId = hashIdUtil.hashIdDecode(id);
    await categoryServices.updateContract(catId, contract_template, variables);
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
    const { id, title, label, contract_template, variables } = req.body;
    const catId = hashIdUtil.hashIdDecode(id);
    const data = { title, label, contract_template, variables };
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
  fillContract,
  createCategory,
  updateContract,
  updateCategory,
  getAllCategories,
  fillContract,
  initContract,
};
export default categoryController;
