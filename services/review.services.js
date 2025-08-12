import { sequelize } from "../database/connection.js";
import db from "../database/dbIndex.js";
import { AppError } from "../utils/error.class.js";
export const createReview = async (data) => {
  const { body, userId, rating, serviceId } = data;
  return await db.Review.create({
    body,
    UserId: userId,
    rating,
    ServiceId: serviceId,
  });
};
export const getAllReviews = async (filters = {}) => {
  return await db.Review.findAll({ where: filters });
};

export const getReviewById = async (id) => {
  const review = await db.Review.findByPk(id);
  if (!review)
    throw new AppError(404, "no review found", true, "no review found");
  return review;
};

export const getReviewsByUserId = async (userId) => {
  const reviews = await db.Review.findAll({ where: { UserId: userId } });
  if (!reviews)
    throw new AppError(404, "no review found", true, "no review found");
  return reviews;
};

export const getReviewsByServiceId = async (serviceId) => {
  const reviews = await db.Review.findAll({ where: { ServiceId: serviceId } });
  if (!reviews)
    throw new AppError(404, "no reviews found", true, "no reviews found");
  return reviews;
};

export const updateReview = async (id, body, rating) => {
  const review = await db.Review.findByPk(id);
  if (!review)
    throw new AppError(404, "no reviews found", true, "no reviews found");
  if (body) review.body = body;
  if (rating) review.rating = rating;
  return await review.save();
};

export const deleteReview = async (id) => {
  const review = await db.Review.findByPk(id);
  if (!review)
    throw new AppError(404, "no reviews found", true, "no reviews found");
  return await review.destroy();
};
export const restoreReview = async (id) => {
  const review = await db.Review.findOne({ where: { id }, paranoid: false });
  if (!review)
    throw new AppError(404, "review not found", true, "review not found");
  if (!review.deletedAt)
    throw new AppError(
      400,
      "review is not deleted",
      true,
      "review is not deleted"
    );
  await review.restore();
  return review;
};
export const getAverageRatingForServiceId = async (ServiceId) => {
  ///this will be discussed further please vist the business services last service to understand
  return await db.Review.findOne({
    where: { ServiceId },
    attributes: [
      [sequelize.fn("AVG", sequelize.col("rating")), "averageRating"],
      [sequelize.fn("COUNT", sequelize.col("id")), "reviewCount"],
    ],
    raw: true,
  });
};
