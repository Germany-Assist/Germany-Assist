import { raw } from "express";
import db from "../database/dbIndex.js";
import { AppError } from "../utils/error.class.js";
import Category from "../database/models/category.js";
const publicAttributes = [
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
];
async function createService(serviceData, transaction) {
  let categoryRecords = [];
  const service = await db.Service.create(serviceData, {
    returning: true,
    transaction,
  });
  if (serviceData.categories && serviceData.categories.length) {
    categoryRecords = await db.Category.findAll({
      where: { title: serviceData.categories || [] },
      transaction,
    });
    await service.addCategories(categoryRecords, { transaction });
  }
  return {
    ...service.get({ plain: true }),
    categories: categoryRecords.map((i) => i.title),
  };
}
async function getAllServices() {
  return await db.Service.findAll({
    raw: false,
    where: { approved: true, rejected: false, published: true },
    attributes: publicAttributes,
    include: [
      {
        model: db.Category,
        as: "categories",
        attributes: ["title"],
        through: { attributes: [] },
      },
    ],
  });
}
async function getAllServicesAdmin() {
  return await db.Service.findAll({
    raw: false,
    include: [
      {
        model: db.Category,
        as: "categories",
        attributes: ["title"],
        through: { attributes: [] },
      },
    ],
  });
}
async function getAllServicesServiceProvider(id) {
  return await db.Service.findAll({
    where: {
      service_provider_id: id,
    },
    include: [
      {
        model: db.Category,
        as: "categories",
        attributes: ["title"],
        through: { attributes: [] },
      },
    ],
  });
}
async function getServiceById(id) {
  let service = await db.Service.findOne({
    where: { id, approved: true, rejected: false, published: true },
    raw: false,
    attributes: publicAttributes,
    include: [
      {
        model: db.Category,
        as: "categories",
        attributes: ["title"],
        through: { attributes: [] },
      },
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
    include: [
      {
        model: db.Category,
        as: "categories",
        attributes: ["title"],
        through: { attributes: [] },
      },
    ],
    attributes: publicAttributes,
  });
}

async function getServicesByType(type) {
  return await db.Service.findAll({
    attributes: publicAttributes,
    include: {
      model: db.Category,
      where: { title: type },
      as: "categories",
      attributes: ["title"],
      through: { attributes: [] },
    },
    attributes: publicAttributes,
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
