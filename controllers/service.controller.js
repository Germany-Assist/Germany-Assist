import serviceServices from "../services/service.services.js";
import hashIdUtil from "../utils/hashId.util.js";
import authUtils from "../utils/authorize.util.js";
import { sequelize } from "../database/connection.js";
import { AppError } from "../utils/error.class.js";
import db from "../database/dbIndex.js";
import UserService from "../database/models/user_service.js";
const sanitizeOutput = (services) => {
  let sanitizedReviews = undefined;
  const sanitizeData = services.map((i) => {
    if (i.Reviews && i.Reviews.length > 0) {
      sanitizedReviews = i.Reviews.map((i) => {
        return {
          body: i.body,
          rating: i.rating,
          userName: i.User.fullName,
          user_id: hashIdUtil.hashIdEncode(i.User.id),
        };
      });
    }

    const service = i.get({ plain: true });
    let temp = {
      ...service,
      id: hashIdUtil.hashIdEncode(service.id),
      categories: service.categories.map((i) => i.title),
      creator: service.User
        ? {
            name: service.User.fullName,
            email: service.User.email,
            user_id: hashIdUtil.hashIdEncode(service.user_id),
          }
        : undefined,
      Reviews: sanitizedReviews,
    };
    delete temp.User;
    delete temp.user_id;
    return temp;
  });
  return sanitizeData;
};
export async function createService(req, res, next) {
  const transaction = await sequelize.transaction();
  try {
    await authUtils.checkRoleAndPermission(
      req.auth,
      ["service_provider_root", "service_provider_rep"],
      true,
      "service",
      "create"
    );
    const serviceData = {
      user_id: req.auth.id,
      service_provider_id: req.auth.related_id,
      title: req.body.title,
      description: req.body.description,
      type: req.body.type,
      rating: 0,
      total_reviews: 0,
      price: req.body.price,
      image: req.body.image || null,
      published: req.body.publish
        ? req.auth.role == "service_provider_root"
          ? true
          : false
        : false,
      categories: req.body.categories,
    };
    const service = await serviceServices.createService(
      serviceData,
      transaction
    );
    res.status(201).json({
      ...service,
      id: hashIdUtil.hashIdEncode(service.id),
      user_id: hashIdUtil.hashIdEncode(service.UserId),
    });
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
}
export async function getAllServices(req, res, next) {
  try {
    const services = await serviceServices.getAllServices();
    const sanitizedServices = sanitizeOutput(services);
    res.status(200).json(sanitizedServices);
  } catch (error) {
    next(error);
  }
}
export async function getAllServicesAdmin(req, res, next) {
  try {
    await authUtils.checkRoleAndPermission(req.auth, ["admin", "super_admin"]);
    const services = await serviceServices.getAllServicesAdmin();
    const sanitizedServices = sanitizeOutput(services);
    res.status(200).json(sanitizedServices);
  } catch (error) {
    next(error);
  }
}
export async function getAllServicesServiceProvider(req, res, next) {
  try {
    await authUtils.checkRoleAndPermission(req.auth, [
      "service_provider_root",
      "service_provider_rep",
    ]);
    const services = await serviceServices.getAllServicesServiceProvider(
      req.auth.related_id
    );
    const sanitizedServices = sanitizeOutput(services);
    res.status(200).json(sanitizedServices);
  } catch (error) {
    next(error);
  }
}
export async function getServiceId(req, res, next) {
  try {
    const service = await serviceServices.getServiceById(
      hashIdUtil.hashIdDecode(req.params.id)
    );
    const sanitizedServices = sanitizeOutput([service]);
    res.status(200).json(sanitizedServices);
  } catch (error) {
    next(error);
  }
}
export async function getServicesByServiceProviderId(req, res, next) {
  try {
    const services = await serviceServices.getServicesByServiceProviderId(
      req.params.id
    );
    const sanitizedServices = sanitizeOutput(services);
    res.status(200).json(sanitizedServices);
  } catch (error) {
    next(error);
  }
}
export async function getByCategories(req, res, next) {
  try {
    const services = await serviceServices.getServicesByType(
      req.body.categories
    );
    const sanitizedServices = sanitizeOutput(services);
    res.status(200).json(sanitizedServices);
  } catch (error) {
    next(error);
  }
}
export async function updateService(req, res, next) {
  try {
    const user = await authUtils.checkRoleAndPermission(
      req.auth,
      ["admin", "service_provider_root", "service_provider_rep", "super_admin"],
      true,
      "service",
      "update"
    );
    const owner = await authUtils.checkOwnership(
      req.body.id,
      req.auth.related_id,
      "Service"
    );
    const allowedFields = ["title", "description", "type", "price", "image"];
    let updateFields = {};
    allowedFields.forEach((i) => {
      if (req.body[i]) updateFields[i] = req.body[i];
    });
    await serviceServices.updateService(
      hashIdUtil.hashIdDecode(req.body.id),
      updateFields
    );
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
}
export async function deleteService(req, res, next) {
  try {
    const user = await authUtils.checkRoleAndPermission(
      req.auth,
      ["admin", "service_provider_root", "super_admin"],
      true,
      "service",
      "delete"
    );
    const owner = await authUtils.checkOwnership(
      req.params.id,
      req.auth.related_id,
      "Service"
    );
    await serviceServices.deleteService(hashIdUtil.hashIdDecode(req.params.id));
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
}
export async function restoreService(req, res, next) {
  try {
    const user = await authUtils.checkRoleAndPermission(
      req.auth,
      ["admin", "super_admin"],
      false
    );
    await serviceServices.restoreService(
      hashIdUtil.hashIdDecode(req.params.id)
    );
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
}
export async function alterServiceStatus(req, res, next) {
  try {
    const user = await authUtils.checkRoleAndPermission(
      req.auth,
      ["admin", "super_admin"],
      false
    );
    const { status, id } = req.body;
    await serviceServices.alterServiceStatus(
      hashIdUtil.hashIdDecode(id),
      status
    );
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
}
export async function alterServiceStatusSP(req, res, next) {
  try {
    const { status, id } = req.body;
    if (!["publish", "unpublish"].includes(status)) {
      throw new AppError(422, "invalid status", true, "invalid status");
    }
    const user = await authUtils.checkRoleAndPermission(
      req.auth,
      ["service_provider_rep", "service_provider_root"],
      true,
      "service",
      status
    );
    await serviceServices.alterServiceStatusSP(
      hashIdUtil.hashIdDecode(id),
      status
    );
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
}
export async function addToFavorite(req, res, next) {
  try {
    const { id: serviceId } = req.body;
    const user = await authUtils.checkRoleAndPermission(
      req.auth,
      ["client"],
      false
    );
    await serviceServices.alterFavorite(
      hashIdUtil.hashIdDecode(serviceId),
      req.auth.id,
      "add"
    );
    res.sendStatus(201);
  } catch (error) {
    next(error);
  }
}
export async function removeFromFavorite(req, res, next) {
  try {
    const { id: serviceId } = req.body;
    const user = await authUtils.checkRoleAndPermission(
      req.auth,
      ["client"],
      false
    );
    await serviceServices.alterFavorite(
      hashIdUtil.hashIdDecode(serviceId),
      req.auth.id,
      "remove"
    );
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
}
export async function addToCart(req, res, next) {
  try {
    const { id: serviceId } = req.body;
    const user = await authUtils.checkRoleAndPermission(
      req.auth,
      ["client"],
      false
    );
    await serviceServices.alterCart(
      hashIdUtil.hashIdDecode(serviceId),
      req.auth.id,
      "add"
    );
    res.sendStatus(201);
  } catch (error) {
    next(error);
  }
}
export async function removeFromCart(req, res, next) {
  try {
    const { id: serviceId } = req.body;
    const user = await authUtils.checkRoleAndPermission(
      req.auth,
      ["client"],
      false
    );
    await serviceServices.alterCart(
      hashIdUtil.hashIdDecode(serviceId),
      req.auth.id,
      "remove"
    );
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
}
export async function inquireService(req, res, next) {
  try {
    const { id, message } = req.body;
    const serviceId = hashIdUtil.hashIdDecode(id);
    await serviceServices.createInquiry(req.auth.id, serviceId, message);
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
}
export async function getInquiredServices(req, res, next) {
  try {
    const user = await authUtils.checkRoleAndPermission(
      req.auth,
      ["service_provider_rep", "service_provider_root"],
      false
    );
    const inquires = await serviceServices.getInquires(req.auth.related_id);
    const sanitizedInquires = inquires.map((i) => {
      return { ...i, user_id: hashIdUtil.hashIdEncode(i.user_id) };
    });
    res.send(sanitizedInquires);
  } catch (error) {
    next(error);
  }
}
const serviceController = {
  alterServiceStatusSP,
  alterServiceStatus,
  restoreService,
  deleteService,
  updateService,
  getByCategories,
  getServicesByServiceProviderId,
  getServiceId,
  getAllServicesServiceProvider,
  getAllServicesAdmin,
  getAllServices,
  createService,
  sanitizeOutput,
  addToFavorite,
  removeFromFavorite,
  addToCart,
  removeFromCart,
  inquireService,
  getInquiredServices,
};
export default serviceController;
