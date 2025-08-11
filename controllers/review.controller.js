import * as reviewServices from "../services/review.services.js";
import { AppError } from "../utils/error.class.js";

export async function createReview(req, res, next) {
  try {
    await reviewServices.createReview(req.body);
    res.sendStatus(201);
  } catch (error) {
    if (error instanceof AppError) error.appendTrace(req.requestId);
    next(error);
  }
}

export async function getAllReviews(req, res, next) {
  try {
    const reviews = await reviewServices.getAllReviews();
    res.status(200).json(reviews);
  } catch (error) {
    if (error instanceof AppError) error.appendTrace(req.requestId);
    next(error);
  }
}

export async function getReviewById(req, res, next) {
  try {
    const review = await reviewServices.getReviewById(req.params.id);
    res.status(200).json(review);
  } catch (error) {
    if (error instanceof AppError) error.appendTrace(req.requestId);
    next(error);
  }
}

export async function getReviewsByUserId(req, res, next) {
  try {
    const reviews = await reviewServices.getReviewsByUserId(req.params.userId);
    res.status(200).json(reviews);
  } catch (error) {
    if (error instanceof AppError) error.appendTrace(req.requestId);
    next(error);
  }
}

export async function getReviewsByServiceId(req, res, next) {
  try {
    const reviews = await reviewServices.getReviewsByServiceId(
      req.params.serviceId
    );
    res.status(200).json(reviews);
  } catch (error) {
    if (error instanceof AppError) error.appendTrace(req.requestId);
    next(error);
  }
}

export async function updateReview(req, res, next) {
  try {
    const updated = await reviewServices.updateReview(
      req.params.id,
      req.body.body,
      req.body.rating
    );
    res.sendStatus(200);
  } catch (error) {
    if (error instanceof AppError) error.appendTrace(req.requestId);
    next(error);
  }
}

export async function deleteReview(req, res, next) {
  try {
    const deleted = await reviewServices.deleteReview(req.params.id);
    res.sendStatus(200);
  } catch (error) {
    if (error instanceof AppError) error.appendTrace(req.requestId);
    next(error);
  }
}
export async function restoreReview(req, res, next) {
  try {
    const deleted = await reviewServices.restoreReview(req.params.id);
    res.sendStatus(200);
  } catch (error) {
    if (error instanceof AppError) error.appendTrace(req.requestId);
    next(error);
  }
}

export async function getAverageRatingForService(req, res, next) {
  try {
    const result = await reviewServices.getAverageRatingForServiceId(
      req.params.serviceId
    );
    const response = {
      averageRating: parseFloat(result?.averageRating) || 0,
      reviewCount: result?.reviewCount || 0,
    };
    res.status(200).json(response);
  } catch (error) {
    if (error instanceof AppError) error.appendTrace(req.requestId);
    next(error);
  }
}
