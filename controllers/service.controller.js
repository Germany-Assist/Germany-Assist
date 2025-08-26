import serviceServices from "../services/service.services.js";
import { AppError } from "../utils/error.class.js";
import hashIdUtil from "../utils/hashId.util.js";
import authUtils from "../utils/authorize.requests.util.js";

export async function createService(req, res, next) {
  try {
    await authUtils.checkRoleAndPermission(
      req.auth.id,
      req.auth.BusinessId,
      ["*"],
      true,
      "service",
      "create"
    );
    const serviceData = {
      UserId: req.auth.id,
      BusinessId: req.auth.BusinessId,
      title: req.body.title,
      description: req.body.description,
      type: req.body.type,
      rating: 0,
      total_reviews: 0,
      price: req.body.price,
      ContractId: req.body.contractId || null,
      image: req.body.image || null,
      publish: req.body.publish
        ? req.auth.role == "root_business"
          ? true
          : false
        : false,
    };
    const service = await serviceServices.createService(serviceData);
    res.status(201).json({
      ...service,
      id: hashIdUtil.hashIdEncode(service.id),
      UserId: hashIdUtil.hashIdEncode(service.UserId),
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
    await authUtils.checkRoleAndPermission(req.auth.id, req.auth.BusinessId, [
      "admin",
      "superAdmin",
    ]);
    const services = await serviceServices.getAllServicesAdmin();
    const servicesWithHashedId = services.map((i) => {
      return {
        ...i,
        id: hashIdUtil.hashIdEncode(i.id),
        UserId: hashIdUtil.hashIdEncode(i.UserId),
      };
    });
    res.status(200).json(servicesWithHashedId);
  } catch (error) {
    next(error);
  }
}
export async function getAllServicesBusiness(req, res, next) {
  try {
    await authUtils.checkRoleAndPermission(req.auth.id, req.auth.BusinessId, [
      "root_business",
      "rep",
    ]);
    const services = await serviceServices.getAllServicesBusiness(
      req.auth.BusinessId
    );
    const servicesWithHashedId = services.map((i) => {
      return {
        ...i,
        id: hashIdUtil.hashIdEncode(i.id),
        UserId: hashIdUtil.hashIdEncode(i.UserId),
      };
    });
    res.status(200).json(servicesWithHashedId);
  } catch (error) {
    next(error);
  }
}
export async function getServiceById(req, res, next) {
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

export async function getServicesByBusinessId(req, res, next) {
  try {
    const services = await serviceServices.getServicesByBusinessId(
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
      req.auth.id,
      req.auth.BusinessId,
      ["admin", "root", "superAdmin", "rep"],
      true,
      "service",
      "update"
    );
    const owner = await authUtils.checkOwnership(
      hashIdUtil.hashIdDecode(req.body.id),
      req.auth.BusinessId,
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
      req.auth.id,
      req.auth.BusinessId,
      ["admin", "root", "superAdmin"],
      true,
      "service",
      "delete"
    );
    const owner = await authUtils.checkOwnership(
      hashIdUtil.hashIdDecode(req.body.id),
      req.auth.BusinessId,
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
      req.auth.id,
      req.auth.BusinessId,
      ["admin", "superAdmin"]
    );
    await serviceServices.restoreService(hashIdDecode(req.body.id));
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
}
