import db from "../database/dbIndex.js";

export const createBusinessProfile = async (profileData) => {
  return await db.BusinessProfiles.create({
    name: profileData.name,
    about: profileData.about,
    description: profileData.description,
    views: profileData.views || 0,
    email: profileData.email,
    phone_number: profileData.phone_number,
    image: profileData.image,
  });
};

export const getAllBusinessProfiles = async (filters = {}) => {
  return await db.BusinessProfiles.findAll({ where: filters });
};

export const getBusinessProfileById = async (id) => {
  const profile = await db.BusinessProfiles.findByPk(id);
  if (!profile) throw new Error("Business profile not found");
  return profile;
};

export const updateBusinessProfile = async (id, updateData) => {
  const profile = await db.BusinessProfiles.findByPk(id);
  if (!profile) throw new Error("Business profile not found");

  await profile.update(updateData);
  return profile;
};

export const deleteBusinessProfile = async (id) => {
  const profile = await db.BusinessProfiles.findByPk(id);
  if (!profile) throw new Error("Business profile not found");

  await profile.destroy();
  return { id, message: "Business profile deleted" };
};

export const restoreBusinessProfile = async (id) => {
  const profile = await db.BusinessProfiles.findOne({
    where: { id },
    paranoid: false,
  });

  if (!profile) throw new Error("Business profile not found");
  if (!profile.deletedAt) throw new Error("Business profile is not deleted");

  await profile.restore();
  return profile;
};

export const incrementProfileViews = async (id) => {
  const profile = await db.BusinessProfiles.findByPk(id);
  if (!profile) throw new Error("Business profile not found");

  return await profile.increment("views");
};
