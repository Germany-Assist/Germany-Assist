import serviceServices from "../services/service.services.js";
import hashIdUtil from "../utils/hashId.util.js";
import authUtils from "../utils/authorize.util.js";
import { sequelize } from "../database/connection.js";
import { AppError } from "../utils/error.class.js";
const sanitizeServices = (services) => {
  const sanitizeData = services.map((i) => {
    let temp = {
      ...i,
      id: hashIdUtil.hashIdEncode(i.id),
      category: i["Category.title"],
      serviceProvider: i["ServiceProvider.name"],
    };
    delete temp["Category.title"];
    delete temp["ServiceProvider.name"];
    return temp;
  });
  return sanitizeData;
};
const sanitizeServiceProfile = (service) => {
  let temp = {
    ...service,
    id: hashIdUtil.hashIdEncode(service.id),
    category: service.Category.title,
    timelines: service.Timelines?.map((x) => {
      return { ...x, id: hashIdUtil.hashIdEncode(x.id) };
    }),
    reviews: service.Reviews.map((i) => {
      return {
        body: i.body,
        rating: i.rating,
        user: {
          name: i.User.first_name + " " + i.User.last_name,
          id: hashIdUtil.hashIdEncode(i.id),
        },
      };
    }),
  };
  delete temp.Timelines;
  delete temp.Reviews;
  delete temp.Category;
  return temp;
};
const formatTimelines = (timelines) => {
  return timelines.map((i) => {
    return {
      id: hashIdUtil.hashIdEncode(i.id),
      label: i.label,
      isArchived: i.is_archived,
    };
  });
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
      type: "oneTime",
      rating: 0,
      total_reviews: 0,
      price: req.body.price,
      image: req.body.image || null,
      published: req.body.publish
        ? req.auth.role == "service_provider_root"
          ? true
          : false
        : false,
      category: req.body.category,
      Timelines: [{ label: req.body.timelineLabel }],
    };
    const service = await serviceServices.createService(
      serviceData,
      transaction
    );
    const timelines = formatTimelines(service.Timelines);
    res.status(201).json({
      message: "successfully created service",
      data: {
        id: hashIdUtil.hashIdEncode(service.id),
        title: service.title,
        userId: hashIdUtil.hashIdEncode(service.UserId),
        categoryId: hashIdUtil.hashIdEncode(service.category_id),
        timelines,
      },
    });
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
}
export async function getAllServices(req, res, next) {
  try {
    const services = await serviceServices.getAllServices(req.query);
    const sanitizedServices = sanitizeServices(services.data);
    res.status(200).json({ ...services, data: sanitizedServices });
  } catch (error) {
    next(error);
  }
}
export async function getServiceProfile(req, res, next) {
  try {
    const service = await serviceServices.getServiceByIdPublic(
      hashIdUtil.hashIdDecode(req.params.id)
    );
    const sanitizedServices = sanitizeServiceProfile(service);
    res.status(200).json(sanitizedServices);
  } catch (error) {
    next(error);
  }
}
export async function getServiceProfileForAdminAndSP(req, res, next) {
  try {
    await authUtils.checkRoleAndPermission(req.auth, [
      "admin",
      "super_admin",
      "service_provider_rep",
      "service_provider_root",
    ]);
    const service = await serviceServices.getServiceProfileForAdminAndSP(
      hashIdUtil.hashIdDecode(req.params.id),
      req.auth.related_id
    );
    const sanitizedServices = sanitizeServiceProfile(service);
    res.status(200).json(sanitizedServices);
  } catch (error) {
    next(error);
  }
}
export async function getAllServicesAdmin(req, res, next) {
  try {
    await authUtils.checkRoleAndPermission(req.auth, ["admin", "super_admin"]);
    const services = await serviceServices.getAllServices(req.query, "admin");
    const sanitizedServices = sanitizeServices(services.data);
    res.status(200).json({ ...services, data: sanitizedServices });
  } catch (error) {
    next(error);
  }
}
export async function getAllServicesSP(req, res, next) {
  try {
    await authUtils.checkRoleAndPermission(req.auth, [
      "service_provider_root",
      "service_provider_rep",
    ]);
    const filters = { ...req.query, serviceProvider: req.auth.related_id };
    const services = await serviceServices.getAllServices(
      filters,
      "serviceProvider"
    );
    const sanitizedServices = sanitizeServices(services.data);
    res.status(200).json({ ...services, data: sanitizedServices });
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
    const allowedFields = ["description", "image"];
    let updateFields = {};
    allowedFields.forEach((i) => {
      if (req.body[i]) updateFields[i] = req.body[i];
    });
    await serviceServices.updateService(
      hashIdUtil.hashIdDecode(req.body.id),
      updateFields
    );
    res.send({ success: true, message: "Service Updated" });
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
    res.send({ success: true, message: "Service Deleted Successfully" });
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
    res.send({ success: true, message: "Service Restored Successfully" });
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
    const { id: serviceId } = req.params;
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
    const { id: serviceId } = req.params;
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
export async function getClientServices(req, res, next) {
  try {
    const services = await serviceServices.getClientServices(req.auth.id);
    const sanitizedServicesWithTimelines = services.map((i) => {
      const ts = i.toJSON();
      const temp = {
        ...ts,
        id: hashIdUtil.hashIdEncode(ts.id),
        timelines: ts.Orders.map((t) => {
          return {
            orderId: hashIdUtil.hashIdEncode(t.id),
            timelineId: hashIdUtil.hashIdEncode(t.Timeline.id),
            timelineLabel: t.Timeline.label,
          };
        }),
      };
      delete temp.Orders;
      return temp;
    });
    res.send(sanitizedServicesWithTimelines);
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
  getServiceProfile,
  getAllServicesAdmin,
  getAllServicesSP,
  getAllServices,
  createService,
  sanitizeServices,
  getServiceProfileForAdminAndSP,
  addToFavorite,
  removeFromFavorite,
  getClientServices,
};
export default serviceController;
