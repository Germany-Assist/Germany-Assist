import serviceServices from "../services/service.services.js";
import hashIdUtil from "../utils/hashId.util.js";
import authUtils from "../utils/authorize.util.js";
import { sequelize } from "../database/connection.js";

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
      publish: req.body.publish
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
    const sanitizedServices = services.map((service) => {
      let PlainService = service.get({ plain: true });
      return {
        ...PlainService,
        id: hashIdUtil.hashIdEncode(PlainService.id),
        categories: PlainService.categories.map((i) => i.title),
      };
    });
    res.status(200).json(sanitizedServices);
  } catch (error) {
    next(error);
  }
}
export async function getAllServicesAdmin(req, res, next) {
  try {
    await authUtils.checkRoleAndPermission(req.auth, ["admin", "super_admin"]);
    const services = await serviceServices.getAllServicesAdmin();
    const sanitizedServices = services.map((service) => {
      let PlainService = service.get({ plain: true });
      return {
        ...PlainService,
        id: hashIdUtil.hashIdEncode(PlainService.id),
        user_id: hashIdUtil.hashIdEncode(PlainService.user_id),
        categories: PlainService.categories.map((i) => i.title),
      };
    });
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
    const servicesWithHashedId = services.map((i) => {
      const service = i.get({ plain: true });
      return {
        ...service,
        id: hashIdUtil.hashIdEncode(service.id),
        user_id: hashIdUtil.hashIdEncode(service.user_id),
        categories: service.categories.map((i) => i.title),
      };
    });
    res.status(200).json(servicesWithHashedId);
  } catch (error) {
    next(error);
  }
}
export async function getServiceByCreatorId(req, res, next) {
  try {
    const service = await serviceServices.getServiceById(
      hashIdUtil.hashIdDecode(req.params.id)
    );
    res
      .status(200)

      .json({
        ...service,
        id: hashIdUtil.hashIdEncode(service.id),
        categories: service.categories.map((i) => i.title),
      });
  } catch (error) {
    next(error);
  }
}

export async function getServicesByServiceProviderId(req, res, next) {
  try {
    const services = await serviceServices.getServicesByServiceProviderId(
      req.params.id
    );
    const sanitizedServices = services.map((service) => {
      let PlainService = service.get({ plain: true });
      return {
        ...PlainService,
        id: hashIdUtil.hashIdEncode(PlainService.id),
        categories: PlainService.categories.map((i) => i.title),
      };
    });
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
    const sanitizedServices = services.map((service) => {
      let PlainService = service.get({ plain: true });
      return {
        ...PlainService,
        id: hashIdUtil.hashIdEncode(PlainService.id),
        categories: PlainService.categories.map((i) => i.title),
      };
    });
    res.status(200).json(sanitizedServices);
  } catch (error) {
    next(error);
  }
}
///
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
      hashIdUtil.hashIdDecode(req.body.id),
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
      hashIdUtil.hashIdDecode(req.body.id),
      req.auth.related_id,
      "Service"
    );
    await serviceServices.deleteService(hashIdUtil.hashIdDecode(req.body.id));
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
    await serviceServices.restoreService(hashIdDecode(req.body.id));
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
}
