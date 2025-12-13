import db from "../../database/index.js";
import { AppError } from "../../utils/error.class.js";

export const createServiceProvider = async (profileData, t) => {
  let { name, about, description, phoneNumber, image, email } = profileData;
  return await db.ServiceProvider.create(
    {
      name,
      about,
      email,
      description,
      phoneNumber,
      image,
    },
    { transaction: t }
  );
};

export const getAllServiceProvider = async () => {
  return await db.ServiceProvider.findAll({
    attributes: [
      "id",
      "name",
      "about",
      "description",
      "phoneNumber",
      "image",
      "isVerified",
      "totalReviews",
      "rating",
      "email",
      "views",
    ],
  });
};

export const getServiceProviderById = async (id) => {
  const profile = await db.ServiceProvider.findByPk(id, {
    attributes: [
      "id",
      "name",
      "about",
      "description",
      "phoneNumber",
      "image",
      "isVerified",
      "totalReviews",
      "rating",
      "email",
      "views",
    ],
    include: [
      {
        model: db.Service,
        attributes: ["id", "title", "rating", "image"],
        required: false,
        where: { published: true, approved: true, rejected: false },
      },
    ],
  });
  if (!profile)
    throw new AppError(
      404,
      "Service Provider not found",
      true,
      "Service Provider not found"
    );
  profile.increment("views");
  await profile.save();
  return profile.toJSON();
};

export const updateServiceProvider = async (id, updateData) => {
  const [count, [profile]] = await db.ServiceProvider.update(updateData, {
    where: { id },
    returning: true,
  });
  if (count === 0) throw new AppError(404, "Service Provider not found", true);
  return profile;
};

export const deleteServiceProvider = async (id) => {
  const profile = await db.ServiceProvider.findByPk(id);
  if (!profile)
    throw new AppError(
      404,
      "Service Provider not found",
      true,
      "Service Provider not found"
    );
  await profile.destroy();
  return { id, message: "Service Provider deleted" };
};
export const restoreServiceProvider = async (id) => {
  const profile = await db.ServiceProvider.findOne({
    where: { id },
    paranoid: false,
  });
  if (!profile)
    throw new AppError(
      404,
      "Service Provider not found",
      true,
      "Service Provider not found"
    );
  if (!profile.deletedAt)
    throw new AppError(
      400,
      "Service Provider is not deleted",
      true,
      "Service Provider is not deleted"
    );
  await profile.restore();
  return profile;
};

export const updateServiceProviderRating = async (id, newRating) => {
  if (typeof newRating !== "number" || newRating < 0 || newRating > 5) {
    throw new AppError(400, "Invalid rating value", true);
  }
  const profile = await db.ServiceProvider.findByPk(id);
  if (!profile)
    throw new AppError(404, "Business not found", true, "Business not found");
  const currentTotalReviews = profile.totalReviews || 0;
  const currentRating = profile.rating || 0;
  const updatedTotalReviews = currentTotalReviews + 1;
  const updatedRating =
    (currentRating * currentTotalReviews + newRating) / updatedTotalReviews;
  return await profile.update({
    rating: updatedRating,
    totalReviews: updatedTotalReviews,
  });
};
const serviceProviderService = {
  createServiceProvider,
  getAllServiceProvider,
  getServiceProviderById,
  updateServiceProvider,
  deleteServiceProvider,
  restoreServiceProvider,
  updateServiceProviderRating,
};

export default serviceProviderService;
