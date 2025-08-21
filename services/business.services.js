import db from "../database/dbIndex.js";
import { AppError } from "../utils/error.class.js";

export const createBusiness = async (profileData, t) => {
  return await db.Business.create(
    {
      name: profileData.name,
      about: profileData.about,
      description: profileData.description,
      email: profileData.email,
      phone_number: profileData.phone_number,
      image: profileData.image,
    },
    { transaction: t }
  );
};

export const getAllBusiness = async () => {
  return await db.Business.findAll({
    attributes: [
      "id",
      "name",
      "about",
      "description",
      "phone_number",
      "image",
      "isVerified",
      "total_reviews",
      "rating",
      "email",
      "views",
    ],
  });
};

export const getBusinessById = async (id) => {
  const profile = await db.Business.findByPk(id, {
    attributes: [
      "id",
      "name",
      "about",
      "description",
      "phone_number",
      "image",
      "isVerified",
      "total_reviews",
      "rating",
      "email",
      "views",
    ],
  });
  if (!profile)
    throw new AppError(404, "Business not found", true, "Business not found");
  profile.increment("views");
  await profile.save();
  return profile;
};

export const updateBusiness = async (id, updateData) => {
  const [count, [profile]] = await db.Business.update(updateData, {
    where: { id },
    returning: true,
  });
  if (count === 0) throw new AppError(404, "Business not found", true);
  return profile;
};

export const deleteBusiness = async (id) => {
  const profile = await db.Business.findByPk(id);
  if (!profile)
    throw new AppError(404, "Business not found", true, "Business not found");
  await profile.destroy();
  return { id, message: "Business deleted" };
};
export const restoreBusiness = async (id) => {
  const profile = await db.Business.findOne({
    where: { id },
    paranoid: false,
  });
  if (!profile)
    throw new AppError(404, "Business not found", true, "Business not found");
  if (!profile.deletedAt)
    throw new AppError(
      400,
      "Business profile is not deleted",
      true,
      "Business profile is not deleted"
    );
  await profile.restore();
  return profile;
};

export const updateBusinessRating = async (id, newRating) => {
  if (typeof newRating !== "number" || newRating < 0 || newRating > 5) {
    throw new AppError(400, "Invalid rating value", true);
  }
  const profile = await db.Business.findByPk(id);
  if (!profile)
    throw new AppError(404, "Business not found", true, "Business not found");
  const currentTotalReviews = profile.total_reviews || 0;
  const currentRating = profile.rating || 0;
  const updatedTotalReviews = currentTotalReviews + 1;
  const updatedRating =
    (currentRating * currentTotalReviews + newRating) / updatedTotalReviews;
  return await profile.update({
    rating: updatedRating,
    total_reviews: updatedTotalReviews,
  });
};
export default {
  createBusiness,
  getAllBusiness,
  getBusinessById,
  updateBusiness,
  deleteBusiness,
  restoreBusiness,
  updateBusinessRating,
};
