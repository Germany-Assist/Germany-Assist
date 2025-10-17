import { where } from "sequelize";
import db from "../database/dbIndex.js";
import { AppError } from "../utils/error.class.js";
import { sequelize } from "../database/connection.js";
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
  "image",
];
async function createService(serviceData, transaction) {
  const category = await db.Category.findOne({
    where: { title: serviceData.category },
  });
  serviceData = { ...serviceData, category_id: category.id };
  const service = await db.Service.create(
    { ...serviceData },
    {
      returning: true,
      transaction,
    }
  );
  return service.get({ plain: true });
}
async function getAllServices() {
  return await db.Service.findAll({
    raw: false,
    where: { approved: true, rejected: false, published: true },
    attributes: publicAttributes,
    include: [
      {
        model: db.Category,
        attributes: ["title"],
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
        attributes: ["title"],
        through: { attributes: [] },
      },
    ],
  });
}
async function getAllServicesServiceProvider(id) {
  const services = await db.Service.findAll({
    where: {
      service_provider_id: id,
    },
    include: [
      {
        model: db.Category,
        attributes: ["title"],
      },
      {
        model: db.User,
        attributes: ["first_name", "last_name", "fullName", "email"],
      },
    ],
  });
  return services;
}

async function getServiceById(id) {
  //i should fetch profile
  const service = await db.Service.findOne({
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
      {
        model: db.Review,
        attributes: ["body", "rating"],
        include: {
          model: db.User,
          attributes: ["first_name", "last_name", "id"],
        },
      },
    ],
  });
  if (!service)
    throw new AppError(404, "Service not found", true, "Service not found");
  service.increment("views");
  await service.save();
  return service;
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
  if (!service.deletedAt)
    throw new AppError(
      400,
      "Service isn't deleted",
      true,
      "Service isn't deleted"
    );
  return await service.restore();
}
async function alterServiceStatus(id, status) {
  const service = await db.Service.findByPk(id);
  if (!service) throw new AppError(400, "failed to find service", false);
  if (status === "approve") {
    service.rejected = false;
    service.approved = true;
  } else if (status === "reject") {
    service.rejected = true;
    service.approved = false;
  } else {
    throw new AppError(400, "failed to process request", false);
  }
  return await service.save();
}
async function alterServiceStatusSP(id, status) {
  const service = await db.Service.findByPk(id);
  if (!service) throw new AppError(400, "failed to find service", false);
  if (status === "publish") {
    service.published = true;
  } else if (status === "unpublish") {
    service.published = false;
  } else {
    throw new AppError(400, "failed to process request", false);
  }
  return await service.save();
}

export const updateServiceRating = async (
  {
    serviceId,
    newRating = 0,
    isUpdate = false,
    oldRating = null,
    isDelete = false,
  } = {},
  t
) => {
  if (typeof newRating !== "number" || newRating < 0 || newRating > 5) {
    throw new AppError(400, "Invalid rating value", true);
  }
  const service = await db.Service.findByPk(serviceId);
  if (!service) {
    throw new AppError(404, "service not found", true, "service not found");
  }
  let { total_reviews: totalReviews = 0, rating: currentRating = 0 } = service;

  if (isDelete) {
    if (totalReviews <= 1) {
      totalReviews = 0;
      currentRating = 0;
    } else {
      totalReviews -= 1;
      currentRating =
        (currentRating * (totalReviews + 1) - newRating) / totalReviews;
    }
  } else if (isUpdate && oldRating !== null) {
    currentRating =
      (currentRating * totalReviews - oldRating + newRating) / totalReviews;
  } else {
    totalReviews += 1;
    currentRating =
      (currentRating * (totalReviews - 1) + newRating) / totalReviews;
  }

  return await service.update(
    {
      rating: currentRating,
      total_reviews: totalReviews,
    },
    { transaction: t }
  );
};
export async function alterFavorite(serviceId, userId, status) {
  if (status === "add") {
    await db.Favorite.create({
      service_id: serviceId,
      user_id: userId,
    });
  } else if (status === "remove") {
    await db.Favorite.destroy({
      where: { service_id: serviceId, user_id: userId },
    });
  } else {
    throw new AppError(500, "invalid status", false);
  }
}
export async function alterCart(serviceId, userId, status) {
  if (status === "add") {
    await db.UserService.create({
      service_id: serviceId,
      user_id: userId,
      type: "cart",
    });
  } else if (status === "remove") {
    await db.UserService.destroy({
      where: { service_id: serviceId, user_id: userId, type: "cart" },
    });
  } else {
    throw new AppError(500, "invalid status", false);
  }
}

export async function removeItemsFromCart(userId, cartIds, t) {
  await db.UserService.destroy({
    where: { id: cartIds, user_id: userId, type: "cart" },
    transaction: t,
  });
}
export async function createInquiry(userId, serviceId, message, t) {
  const service = await db.Service.findOne({
    where: { id: serviceId },
    raw: true,
    attributes: ["service_provider_id"],
    transaction: t,
  });
  await db.Inquiry.create(
    {
      user_id: userId,
      service_id: serviceId,
      message,
      service_provider_id: service.service_provider_id,
    },
    { transaction: t }
  );
}
export function getInquires(id) {
  return db.Inquiry.findAll({
    attributes: ["id", "message", "status", "user_id"],
    include: {
      model: db.Service,
      attributes: ["title", "price"],
      required: true,
      include: {
        model: db.ServiceProvider,
        required: true,
        where: { id },
        attributes: [],
      },
    },

    raw: true,
  });
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
  alterServiceStatus,
  alterServiceStatusSP,
  updateServiceRating,
  alterFavorite,
  alterCart,
  removeItemsFromCart,
  createInquiry,
  getInquires,
};
export default serviceServices;
