import db from "../database/dbIndex.js";
import { AppError } from "../utils/error.class.js";
async function createService(serviceData) {
  const service = await db.Service.create(serviceData, {
    raw: true,
    returning: true,
  });
  return service.get({ plain: true });
}
async function getAllServices() {
  return await db.Service.findAll({
    raw: true,
    where: { approved: true, rejected: false, published: true },
    attributes: [
      "id",
      "title",
      "description",
      "BusinessId",
      "views",
      "type",
      "rating",
      "total_reviews",
      "price",
      "ContractId",
      "image",
    ],
  });
}
async function getAllServicesAdmin() {
  return await db.Service.findAll({ raw: true });
}
async function getAllServicesBusiness(businessId) {
  return await db.Service.findAll({
    where: { BusinessId: businessId },
    raw: true,
  });
}
async function getServiceById(id) {
  let service = await db.Service.findOne({
    where: { id, approved: true, rejected: false, published: true },
    raw: false,
    attributes: [
      "id",
      "title",
      "description",
      "BusinessId",
      "views",
      "type",
      "rating",
      "total_reviews",
      "price",
      "ContractId",
      "image",
    ],
  });
  if (!service)
    throw new AppError(404, "Service not found", true, "Service not found");
  service.increment("views");
  await service.save();
  return service.get({ plain: true });
}

async function getServicesByUserId(userId) {
  return await db.Service.findAll({ where: { UserId: userId } });
}

async function getServicesByBusinessId(BusinessId) {
  return await db.Service.findAll({
    where: { BusinessId, published: true, approved: true, rejected: false },
    attributes: [
      "id",
      "title",
      "description",
      "BusinessId",
      "views",
      "type",
      "rating",
      "total_reviews",
      "price",
      "ContractId",
      "image",
    ],
    raw: true,
  });
}

async function getServicesByType(type) {
  return await db.Service.findAll({
    where: { type },
    attributes: [
      "id",
      "title",
      "description",
      "BusinessId",
      "views",
      "type",
      "rating",
      "total_reviews",
      "price",
      "ContractId",
      "image",
    ],
  });
}

async function updateService(id, updateData) {
  const service = await db.Service.findByPk(id);
  if (!service)
    throw new AppError(404, "Service not found", true, "Service not found");
  return service.update(updateData);
}
async function deleteService(id) {
  const service = await db.Service.findOne({
    where: { id },
  });
  if (!service)
    throw new AppError(404, "Service not found", true, "Service not found");
  return await service.destroy();
}
async function restoreService(id) {
  const service = await db.Service.findByPk(id, { paranoid: false });
  if (!service)
    throw new AppError(404, "Service not found", true, "Service not found");
  return await service.restore();
}

const serviceServices = {
  createService,
  getAllServices,
  getAllServicesAdmin,
  getAllServicesBusiness,
  getServiceById,
  getServicesByUserId,
  getServicesByBusinessId,
  getServicesByType,
  updateService,
  deleteService,
  restoreService,
};
export default serviceServices;
