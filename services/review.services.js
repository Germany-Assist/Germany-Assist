import db from "../database/dbIndex.js";
import { AppError } from "../utils/error.class.js";

export async function canReview(userId, serviceId) {
  const can = await db.Order.findOne({
    where: { user_id: userId, service_id: serviceId },
  });
  if (!can)
    throw new AppError(
      403,
      "cant review without buying the service",
      true,
      "You cannot review a service you have not purchased"
    );
}
export const createReview = async (data, t) => {
  const { body, rating, service_id, user_id } = data;
  return await db.Review.create(
    {
      body,
      rating,
      user_id,
      service_id,
    },
    { transaction: t }
  );
};

export const updateReview = async (data, t) => {
  const { body, rating, service_id, user_id } = data;
  const review = await db.Review.findOne({ where: { service_id, user_id } });
  if (!review)
    throw new AppError(404, "no review found", true, "no review found");
  const oldRating = review.rating;
  if (body) review.body = body;
  if (rating) review.rating = rating;
  await review.save({ transaction: t });
  return oldRating;
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
