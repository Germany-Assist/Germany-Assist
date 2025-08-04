import * as serviceServices from "../services/service.services.js";

export async function createService(req, res, next) {
  try {
    const service = {
      title: req.body.title,
      description: req.body.description,
      UserId: req.body.userId, // ????????
      ProviderId: req.body.providerId, // ??????
      views: 0, // ??????
      type: req.body.type, // ??????,
      rating: 0,
      total_reviews: 0,
      price: req.body.price, // ??????
      ContractId: req.body.contractId || null, // ??????
      image: req.body.image || null,
    };
    console.log();
    await serviceServices.createService(service);
    res.sendStatus(201);
  } catch (error) {
    next(error);
  }
}

export async function getAllServices(req, res, next) {
  try {
    const services = await serviceServices.getAllServices();
    res.status(200).json(services);
  } catch (error) {
    next(error);
  }
}

export async function getServiceById(req, res, next) {
  try {
    const service = await serviceServices.getServiceById(req.params.id);
    res.status(200).json(service);
  } catch (error) {
    next(error);
  }
}

export async function getServicesByUserId(req, res, next) {
  try {
    const services = await serviceServices.getServicesByUserId(
      req.params.userId
    );
    res.status(200).json(services);
  } catch (error) {
    next(error);
  }
}

export async function getServicesByProviderId(req, res, next) {
  try {
    const services = await serviceServices.getServicesByProviderId(
      req.params.providerId
    );
    res.status(200).json(services);
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

export async function updateService(req, res, next) {
  try {
    await serviceServices.updateService(req.params.id, req.body);
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
}

export async function deleteService(req, res, next) {
  try {
    await serviceServices.deleteService(req.params.id);
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
}

export async function restoreService(req, res, next) {
  try {
    await serviceServices.restoreService(req.params.id);
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
}

export async function incrementServiceViews(req, res, next) {
  try {
    await serviceServices.incrementServiceViews(req.params.id);
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
}
