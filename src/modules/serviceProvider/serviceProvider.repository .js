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
    { transaction: t },
  );
};
export const verifyServiceProvider = async (SPId, t) => {
  return await db.ServiceProvider.update(
    { isVerified: true },
    { where: { id: SPId }, transaction: t },
  );
};

export const checkIfSPAllowedCategory = async (spId, catId, transaction) => {
  const allowed = await db.ServiceProvider.findOne({
    where: { id: spId },
    include: [{ model: db.Category, where: { id: catId } }],
    required: true,
    transaction,
  });
  if (allowed) return;
  throw new AppError(
    403,
    "You are not verified for this category",
    false,
    "You are not verified for this category",
  );
};
const serviceProviderRepository = {
  createServiceProvider,
  verifyServiceProvider,
  checkIfSPAllowedCategory,
};
export default serviceProviderRepository;
