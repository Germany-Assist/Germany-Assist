import db from "../database/dbIndex.js";
import { AppError } from "../utils/error.class.js";

export const createProvider = async (profileData) => {
  return await db.Provider.create({
    name: profileData.name,
    about: profileData.about,
    description: profileData.description,
    // views: profileData.views || 0,
    email: profileData.email,
    phone_number: profileData.phone_number,
    // rating: profileData.rating || null,
    // total_reviews: profileData.total_reviews || 0,
    image: profileData.image,
  });
};
export const getAllProviders = async (filters = {}) => {
  return await db.Provider.findAll({ where: filters });
};

export const getProviderById = async (id) => {
  const profile = await db.Provider.findByPk(id);
  if (!profile)
    throw new AppError(404, "Provider not found", true, "Provider not found");
  return profile;
};

export const getProviderByEmail = async (email) => {
  const profile = await db.Provider.findAll({ where: { email } });
  if (profile.length < 1)
    throw new AppError(404, "Provider not found", true, "Provider not found");
  return profile;
};

export const updateProvider = async (id, updateData) => {
  const profile = await db.Provider.findByPk(id);
  if (!profile)
    throw new AppError(404, "Provider not found", true, "Provider not found");
  await profile.update(updateData);
  return profile;
};

export const deleteProvider = async (id) => {
  const profile = await db.Provider.findByPk(id);
  if (!profile)
    throw new AppError(404, "Provider not found", true, "Provider not found");
  await profile.destroy();
  return { id, message: "Provider profile deleted" };
};

export const restoreProvider = async (id) => {
  const profile = await db.Provider.findOne({
    where: { id },
    paranoid: false,
  });

  if (!profile)
    throw new AppError(404, "Provider not found", true, "Provider not found");
  if (!profile.deletedAt)
    throw new AppError(
      400,
      "Provider profile is not deleted",
      true,
      "Provider profile is not deleted"
    );

  await profile.restore();
  return profile;
};

export const incrementViews = async (id) => {
  const profile = await db.Provider.findByPk(id);
  if (!profile)
    throw new AppError(404, "Provider not found", true, "Provider not found");

  return await profile.increment("views");
};
////////////////////////////////////////////////////////////////
//////////this should be called with transactions only for reviews and rating/////////////////
export const updateProviderRating = async (id, newRating) => {
  const profile = await db.Provider.findByPk(id);
  if (!profile)
    throw new AppError(404, "Provider not found", true, "Provider not found");
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
