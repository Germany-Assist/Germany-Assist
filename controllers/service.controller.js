import serviceServices from "../services/service.services.js";
import hashIdUtil from "../utils/hashId.util.js";
import authUtils from "../utils/authorize.util.js";

export async function createService(req, res, next) {
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
    };
    const service = await serviceServices.createService(serviceData);
    res.status(201).json({
      ...service,
      id: hashIdUtil.hashIdEncode(service.id),
      user_id: hashIdUtil.hashIdEncode(service.UserId),
    });
  } catch (error) {
    next(error);
  }
}

export async function getAllServices(req, res, next) {
  try {
    const services = await serviceServices.getAllServices();
    const servicesWithHashedId = services.map((i) => {
      return { ...i, id: hashIdUtil.hashIdEncode(i.id) };
    });
    res.status(200).json(servicesWithHashedId);
  } catch (error) {
    next(error);
  }
}
export async function getAllServicesAdmin(req, res, next) {
  try {
    await authUtils.checkRoleAndPermission(req.auth, ["admin", "superAdmin"]);
    const services = await serviceServices.getAllServicesAdmin();
    const servicesWithHashedId = services.map((i) => {
      return {
        ...i,
        id: hashIdUtil.hashIdEncode(i.id),
        UserId: hashIdUtil.hashIdEncode(i.user_id),
      };
    });
    res.status(200).json(servicesWithHashedId);
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
      return {
        ...i,
        id: hashIdUtil.hashIdEncode(i.id),
        user_id: hashIdUtil.hashIdEncode(i.user_id),
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
      .json({ ...service, id: hashIdUtil.hashIdEncode(service.id) });
  } catch (error) {
    next(error);
  }
}

export async function getServicesByServiceProviderId(req, res, next) {
  try {
    const services = await serviceServices.getServicesByServiceProviderId(
      req.params.id
    );
    const servicesWithHashedId = services.map((i) => {
      return {
        ...i,
        id: hashIdUtil.hashIdEncode(i.id),
      };
    });
    res.status(200).json(servicesWithHashedId);
  } catch (error) {
    next(error);
  }
}

export async function getServicesByType(req, res, next) {
  try {
    const services = await serviceServices.getServicesByType(req.params.type);
    res.status(200).json(services);
  } catch (error) {
    next(error);
  }
}
///
export async function updateService(req, res, next) {
  try {
    const user = await authUtils.checkRoleAndPermission(
      req.auth,
      ["admin", "root", "superAdmin", "rep"],
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
      ["admin", "root", "superAdmin"],
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
      ["admin", "superAdmin"],
      false
    );
    await serviceServices.restoreService(hashIdDecode(req.body.id));
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
}
