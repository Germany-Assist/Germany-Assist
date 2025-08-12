import { Op, where } from "sequelize";
import db from "../database/dbIndex.js";
import { AppError } from "../utils/error.class.js";
export async function createService(serviceData) {
  return await db.Service.create(serviceData);
}
export async function getAllServices() {
  return await db.Service.findAll();
}
export async function getServiceById(id) {
  let service = await db.Service.findByPk(id);
  if (!service)
    throw new AppError(404, "Service not found", true, "Service not found");
  return service;
}
export async function getServicesByUserId(userId) {
  return await db.Service.findAll({ where: { UserId: userId } });
}

export async function getServicesByBusinessId(BusinessId) {
  return await db.Service.findAll({ where: { BusinessId } });
}

export async function getServicesByType(type) {
  return await db.Service.findAll({ where: { type } });
}

export async function updateService(id, updateData) {
  const service = await db.Service.findByPk(id);
  if (!service)
    throw new AppError(404, "Service not found", true, "Service not found");
  if (updateData.title) service.title = updateData.title;
  if (updateData.description) service.description = updateData.description;
  if (updateData.type) service.type = updateData.type;
  if (updateData.price) service.price = updateData.price;
  if (updateData.image) service.image = updateData.image;
  return await service.save();
}
export async function deleteService(id, BusinessId) {
  const service = await db.Service.findOne({
    where: { [Op.and]: [{ id }, { BusinessId }] },
  });
  if (!service)
    throw new AppError(404, "Service not found", true, "Service not found");
  if (service.BusinessId == BusinessId) return await service.destroy();
}
export async function restoreService(id) {
  const service = await db.Service.findByPk(id, { paranoid: false });
  if (!service)
    throw new AppError(404, "Service not found", true, "Service not found");
  return await service.restore();
}
export async function incrementServiceViews(id) {
  const service = await db.Service.findByPk(id);
  if (!service)
    throw new AppError(404, "Service not found", true, "Service not found");
  return await service.increment("views");
}
