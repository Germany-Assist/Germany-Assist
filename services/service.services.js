import { Op } from "sequelize";
import db from "../database/dbIndex.js";
import { AppError } from "../utils/error.class.js";
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
  if (!category) throw new AppError(422, "invalid category", true);
  serviceData.category_id = category.id;
  const service = await db.Service.create(
    { ...serviceData },
    {
      include: [{ model: db.Timeline }],
      returning: true,
      transaction,
    }
  );
  return service.get({ plain: true });
}
async function getAllServices(filters, authority) {
  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 10;
  const offset = (page - 1) * limit;
  const where = {};
  if (authority == "admin") {
    if (filters.approved) where.approved = filters.approved;
    if (filters.rejected) where.rejected = filters.rejected;
    if (filters.published) where.published = filters.published;
  } else if (authority == "serviceProvider") {
    where.service_provider_id = filters.serviceProvider;
    if (filters.approved) where.approved = filters.approved;
    if (filters.rejected) where.rejected = filters.rejected;
    if (filters.published) where.published = filters.published;
  } else {
    where.approved = true;
    where.rejected = false;
    where.published = true;
  }
  if (filters.maxRating || filters.minRating) {
    where.rating = {};
    if (filters.minRating) where.rating[Op.gte] = filters.minRating;
    if (filters.maxRating) where.rating[Op.lte] = filters.maxRating;
  }
  if (filters.id) where.id = filters.id;
  if (filters.search) where.title = { [Op.iLike]: `%${filters.search}%` };
  if (filters.minPrice || filters.maxPrice) {
    where.price = {};
    if (filters.minPrice) where.price[Op.gte] = filters.minPrice;
    if (filters.maxPrice) where.price[Op.lte] = filters.maxPrice;
  }
  const includeCategory = {
    model: db.Category,
    attributes: ["title"],
  };
  const includeServiceProvider = {
    model: db.ServiceProvider,
    attributes: ["name"],
  };
  if (filters.category) {
    includeCategory.where = { title: filters.category };
  }
  if (filters.serviceProvider && authority !== "serviceProvider") {
    where.service_provider_id = filters.serviceProvider;
  }
  const sortField = filters.sort || "createdAt";
  const sortOrder = filters.order === "asc" ? "ASC" : "DESC";
  const { rows: services, count } = await db.Service.findAndCountAll({
    raw: true,
    where,
    attributes: publicAttributes,
    include: [includeCategory, includeServiceProvider],
    limit,
    offset,
    order: [[sortField, sortOrder]],
  });
  return {
    page,
    limit,
    total: count,
    totalPages: Math.ceil(count / limit),
    data: services,
  };
}
async function getServiceByIdPublic(id) {
  const service = await db.Service.findOne({
    where: { id, approved: true, rejected: false, published: true },
    raw: false,
    attributes: publicAttributes,
    include: [
      {
        model: db.Category,
        attributes: ["title"],
      },
      {
        model: db.Review,
        attributes: ["body", "rating"],
        include: {
          model: db.User,
          attributes: ["first_name", "last_name", "id"],
        },
      },
      {
        model: db.ServiceProvider,
        attributes: ["id", "name", "email", "phone_number"],
      },
    ],
  });

  if (!service)
    throw new AppError(404, "Service not found", true, "Service not found");
  service.increment("views");
  await service.save();
  return service.toJSON();
}
async function getServiceByIdPrivate(id, SPID) {
  const where = { id };
  if (SPID) where.service_provider_id = SPID;
  const service = await db.Service.findOne({
    where,
    raw: false,
    attributes: publicAttributes,
    include: [
      {
        model: db.Category,
        attributes: ["title"],
      },
      {
        model: db.Review,
        attributes: ["body", "rating"],
        include: {
          model: db.User,
          attributes: ["first_name", "last_name", "id"],
        },
      },
      {
        model: db.User,
        attributes: ["first_name", "last_name", "email"],
      },
      {
        model: db.Timeline,
        attributes: ["id", "is_archived", "label"],
      },
    ],
  });
  if (!service)
    throw new AppError(404, "Service not found", true, "Service not found");
  return service.toJSON();
}
async function getServicesByUserId(userId) {
  return await db.Service.findAll({ where: { user_id: userId } });
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

const serviceServices = {
  createService,
  getAllServices,
  getServiceByIdPublic,
  updateService,
  deleteService,
  restoreService,
  alterServiceStatus,
  alterServiceStatusSP,
  getServiceByIdPrivate,
  updateServiceRating,
  alterFavorite,
};
export default serviceServices;
