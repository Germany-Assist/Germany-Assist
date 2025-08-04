import db from "../database/dbIndex.js";
import { AppError } from "../utils/error.class.js";

export const createBusiness = async (profileData) => {
  return await db.Business.create({
    name: profileData.name,
    about: profileData.about,
    description: profileData.description,
    // views: profileData.views || 0,
    email: profileData.email,
    phone_number: profileData.phone_number,
    image: profileData.image,
  });
};

export const getAllBusiness = async (filters = {}) => {
  return await db.Business.findAll({ where: filters });
};

export const getBusinessById = async (id) => {
  const profile = await db.Business.findByPk(id);
  if (!profile)
    throw new AppError(404, "Business not found", true, "Business not found");
  return profile;
};

export const updateBusiness = async (id, updateData) => {
  const profile = await db.Business.findByPk(id);
  if (!profile)
    throw new AppError(404, "Business not found", true, "Business not found");
  await profile.update(updateData);
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

export const incrementViews = async (id) => {
  const profile = await db.Business.findByPk(id);
  if (!profile)
    throw new AppError(404, "Business not found", true, "Business not found");
  return await profile.increment("views");
};
