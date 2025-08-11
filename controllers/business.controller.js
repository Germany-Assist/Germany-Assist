import * as businessServices from "../services/business.services.js";
import { AppError } from "../utils/error.class.js";

export async function createBusiness(req, res, next) {
  try {
    const profile = await businessServices.createBusiness(req.body);
    res.status(201).json(profile);
  } catch (error) {
    if (error instanceof AppError) error.appendTrace(req.requestId);
    next(error);
  }
}
export async function getAllBusiness(req, res, next) {
  try {
    const filters = req.query;
    const profiles = await businessServices.getAllBusiness(filters);
    res.status(200).json(profiles);
  } catch (error) {
    if (error instanceof AppError) error.appendTrace(req.requestId);
    next(error);
  }
}

export async function getBusinessById(req, res, next) {
  try {
    const profile = await businessServices.getBusinessById(
      parseInt(req.params.id)
    );
    res.status(200).json(profile);
  } catch (error) {
    if (error instanceof AppError) error.appendTrace(req.requestId);
    next(error);
  }
}

export async function updateBusiness(req, res, next) {
  try {
    const profile = await businessServices.updateBusiness(
      parseInt(req.params.id),
      req.body
    );
    res.status(200).json(profile);
  } catch (error) {
    if (error instanceof AppError) error.appendTrace(req.requestId);
    next(error);
  }
}

export async function deleteBusiness(req, res, next) {
  try {
    const result = await businessServices.deleteBusiness(
      parseInt(req.params.id)
    );
    res.sendStatus(200);
  } catch (error) {
    if (error instanceof AppError) error.appendTrace(req.requestId);
    next(error);
  }
}
export async function restoreBusiness(req, res, next) {
  try {
    const profile = await businessServices.restoreBusiness(
      parseInt(req.params.id)
    );
    res.status(200).json(profile);
  } catch (error) {
    if (error instanceof AppError) error.appendTrace(req.requestId);
    next(error);
  }
}

export async function incrementViews(req, res, next) {
  try {
    const profile = await businessServices.incrementViews(
      parseInt(req.params.id)
    );
    res.sendStatus(200);
  } catch (error) {
    if (error instanceof AppError) error.appendTrace(req.requestId);
    next(error);
  }
}
