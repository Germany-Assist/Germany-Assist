import * as provierServices from "../services/provider.services.js";

export async function createProvider(req, res, next) {
  try {
    const profile = await provierServices.createProvider(req.body);
    res.status(201).json(profile);
  } catch (error) {
    next(error);
  }
}

export async function getAllProviders(req, res, next) {
  try {
    const filters = req.query;
    const profiles = await provierServices.getAllProviders(filters);
    res.send(profiles);
  } catch (error) {
    next(error);
  }
}

export async function getProviderById(req, res, next) {
  try {
    const profile = await provierServices.getProviderById(
      parseInt(req.params.id)
    );
    res.send(profile);
  } catch (error) {
    next(error);
  }
}
export async function getProviderByEmail(req, res, next) {
  try {
    const profiles = await provierServices.getProviderByEmail(req.params.email);
    res.status(200).json(profiles);
  } catch (error) {
    next(error);
  }
}

export async function updateProvider(req, res, next) {
  try {
    const profile = await provierServices.updateProvider(
      parseInt(req.params.id),
      req.body
    );
    res.send(profile);
  } catch (error) {
    next(error);
  }
}
export async function deleteProvider(req, res, next) {
  try {
    const result = await provierServices.deleteProvider(
      parseInt(req.params.id)
    );
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
}
export async function restoreProvider(req, res, next) {
  try {
    const profile = await provierServices.restoreProvider(
      parseInt(req.params.id)
    );
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
}
export async function incrementViews(req, res, next) {
  try {
    const profile = await provierServices.incrementViews(
      parseInt(req.params.id)
    );
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
}
export async function updateProviderRating(req, res, next) {
  try {
    const { rating } = req.body;
    const profile = await provierServices.updateProviderRating(
      parseInt(req.params.id),
      parseFloat(rating)
    );
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
}
