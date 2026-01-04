import serviceServices from "./service.services.js";
import hashIdUtil from "../../utils/hashId.util.js";
import authUtils from "../../utils/authorize.util.js";
import { sequelize } from "../../configs/database.js";
import { AppError } from "../../utils/error.class.js";
import { generateDownloadUrl } from "../../configs/s3Configs.js";
import uploadController from "../assets/assets.controller.js";
const sanitizeServices = async (services) => {
  const sanitized = await Promise.all(
    services.map(async (i) => {
      //TODO this delete was added just to patch and it should be fixed
      delete i["ServiceProviderId"];
      //
      const {
        id,
        "Category.title": categoryTitle,
        "ServiceProvider.name": providerName,
        "profileImages.url": imageUrl,
        categoryId,
        ...rest
      } = i;
      const levelCalc = () => {
        const { approved, published, rejected } = i;
        if (approved && published) {
          return "ready";
        } else if (approved && !published) {
          return "accepted";
        } else if (!approved && !rejected) {
          return "pending";
        } else if (rejected) {
          return "alert";
        }
      };
      const image = imageUrl ? await generateDownloadUrl(imageUrl) : undefined;

      return {
        id: hashIdUtil.hashIdEncode(id),
        category: categoryTitle,
        serviceProvider: providerName,
        image,
        level: levelCalc(),
        ...rest,
      };
    })
  );

  return sanitized;
};

const sanitizeServiceProfile = async (service) => {
  let assets = [];
  if (service.Assets && service.Assets.length > 0)
    assets = await Promise.all(
      service.Assets?.map(async (i) => {
        return { ...i, url: await generateDownloadUrl(i.url) };
      })
    );
  const { id: timelineId, label: timelineLabel } = service.activeTimeline[0];

  let temp = {
    ...service,
    id: hashIdUtil.hashIdEncode(service.id),
    category: service.Category.title,
    activeTimeline: {
      id: hashIdUtil.hashIdEncode(timelineId),
      label: timelineLabel,
    },
    timelines: service.Timelines?.map((x) => {
      return { ...x, id: hashIdUtil.hashIdEncode(x.id) };
    }),
    reviews: service.Reviews.map((i) => {
      return {
        body: i.body,
        rating: i.rating,
        user: {
          name: i.User.firstName + " " + i.User.lastName,
          id: hashIdUtil.hashIdEncode(i.id),
        },
      };
    }),
    assets,
  };
  delete temp.Timelines;
  delete temp.Reviews;
  delete temp.Category;
  delete temp.Assets;
  return temp;
};
const formatTimelines = (timelines) => {
  return timelines.map((i) => {
    return {
      id: hashIdUtil.hashIdEncode(i.id),
      label: i.label,
      isArchived: i.isArchived,
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
      userId: req.auth.id,
      serviceProviderId: req.auth.relatedId,
      title: req.body.title,
      description: req.body.description,
      type: "oneTime",
      rating: 0,
      totalReviews: 0,
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

    const timelines = serviceController.formatTimelines(service.Timelines);
    await transaction.commit();

    const files = req.files || (req.file ? [req.file] : []);
    const params = { id: hashIdUtil.hashIdEncode(service.id) };
    const publicUrls = await uploadController.uploadService(
      "serviceProfileGalleryImage",
      files,
      req.auth,
      params
    );
    res.status(201).json({
      message: "successfully created service",
      data: {
        id: hashIdUtil.hashIdEncode(service.id),
        title: service.title,
        userId: hashIdUtil.hashIdEncode(service.userId),
        categoryId: hashIdUtil.hashIdEncode(service.categoryId),
        timelines,
        publicUrls,
      },
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
}
export async function getAllServices(req, res, next) {
  try {
    const services = await serviceServices.getAllServices(req.query);
    const sanitizedServices = await serviceController.sanitizeServices(
      services.data
    );
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
    const sanitizedServices = await sanitizeServiceProfile(service);
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
      req.auth.relatedId
    );
    const sanitizedServices = await sanitizeServiceProfile(service);
    res.status(200).json(sanitizedServices);
  } catch (error) {
    next(error);
  }
}
export async function getAllServicesAdmin(req, res, next) {
  try {
    await authUtils.checkRoleAndPermission(req.auth, ["admin", "super_admin"]);
    const services = await serviceServices.getAllServices(req.query, "admin");
    const sanitizedServices = await sanitizeServices(services.data);
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
    const filters = { ...req.query, serviceProvider: req.auth.relatedId };
    const services = await serviceServices.getAllServices(
      filters,
      "serviceProvider"
    );
    const sanitizedServices = await sanitizeServices(services.data);
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
      req.auth.relatedId,
      "Service"
    );
    const allowedFields = ["description"];
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
      req.auth.relatedId,
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
//TODO delete this
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
export async function publishService(req, res, next) {
  try {
    const { serviceId } = req.params;
    const user = await authUtils.checkRoleAndPermission(
      req.auth,
      ["service_provider_rep", "service_provider_root"],
      true,
      "service",
      "publish"
    );
    await serviceServices.alterServiceStatusSP(
      hashIdUtil.hashIdDecode(serviceId),
      "publish"
    );
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
}
export async function unpublishService(req, res, next) {
  try {
    const { serviceId } = req.params;
    const user = await authUtils.checkRoleAndPermission(
      req.auth,
      ["service_provider_rep", "service_provider_root"],
      true,
      "service",
      "unpublish"
    );
    await serviceServices.alterServiceStatusSP(
      hashIdUtil.hashIdDecode(serviceId),
      "unpublish"
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
  formatTimelines,
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
  unpublishService,
  publishService,
};
export default serviceController;
