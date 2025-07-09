import db from "../database/dbIndex.js";

export const createProviderProfile = async (profileData) => {
  return await db.ProvidersProfile.create({
    name: profileData.name,
    about: profileData.about,
    description: profileData.description,
    views: profileData.views || 0,
    email: profileData.email,
    phone_number: profileData.phone_number,
    rating: profileData.rating || null,
    total_reviews: profileData.total_reviews || 0,
    image: profileData.image,
  });
};

export const getAllProviderProfiles = async (filters = {}) => {
  return await db.ProvidersProfile.findAll({ where: filters });
};

export const getProviderProfileById = async (id) => {
  const profile = await db.ProvidersProfile.findByPk(id);
  if (!profile) throw new Error("Provider profile not found");
  return profile;
};

export const getProviderProfileByEmail = async (email) => {
  const profile = await db.ProvidersProfile.findAll({ where: { email } });
  if (profile.length < 1) throw new Error("Provider profile not found");
  return profile;
};

export const updateProviderProfile = async (id, updateData) => {
  const profile = await db.ProvidersProfile.findByPk(id);
  if (!profile) throw new Error("Provider profile not found");
  console.log(updateData);
  await profile.update(updateData);
  return profile;
};

export const deleteProviderProfile = async (id) => {
  const profile = await db.ProvidersProfile.findByPk(id);
  if (!profile) throw new Error("Provider profile not found");

  await profile.destroy();
  return { id, message: "Provider profile deleted" };
};

export const restoreProviderProfile = async (id) => {
  const profile = await db.ProvidersProfile.findOne({
    where: { id },
    paranoid: false,
  });

  if (!profile) throw new Error("Provider profile not found");
  if (!profile.deletedAt) throw new Error("Provider profile is not deleted");

  await profile.restore();
  return profile;
};

export const incrementProfileViews = async (id) => {
  const profile = await db.ProvidersProfile.findByPk(id);
  if (!profile) throw new Error("Provider profile not found");

  return await profile.increment("views");
};
////////////////////////////////////////////////////////////////
//////////this should be called with transactions only for reviews and rating/////////////////
export const updateProfileRating = async (id, newRating) => {
  const profile = await db.ProvidersProfile.findByPk(id);
  if (!profile) throw new Error("Provider profile not found");
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
