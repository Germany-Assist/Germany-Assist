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
  const services = await db.Service.findAll({
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
};
export default serviceServices;
