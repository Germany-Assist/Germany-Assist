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
      "service_provider_id",
      "views",
      "type",
      "rating",
      "total_reviews",
      "price",
      "contract_id",
      "image",
    ],
  });
}
async function getAllServicesAdmin() {
  return await db.Service.findAll({ raw: true });
}
async function getAllServicesServiceProvider(id) {
  return await db.Service.findAll({
    where: { service_provider_id: id },
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
      "service_provider_id",
      "views",
      "type",
      "rating",
      "total_reviews",
      "price",
      "contract_id",
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
  return await db.Service.findAll({ where: { user_id: userId } });
}

async function getServicesByServiceProviderId(id) {
  return await db.Service.findAll({
    where: {
      service_provider_id: id,
      published: true,
      approved: true,
      rejected: false,
    },
    attributes: [
      "id",
      "title",
      "description",
      "service_provider_id",
      "views",
      "type",
      "rating",
      "total_reviews",
      "price",
      "contract_id",
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
      "service_provider_id",
      "views",
      "type",
      "rating",
      "total_reviews",
      "price",
      "contract_id",
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
  getAllServicesServiceProvider,
  getServiceById,
  getServicesByUserId,
  getServicesByServiceProviderId,
  getServicesByType,
  updateService,
  deleteService,
  restoreService,
};
export default serviceServices;
