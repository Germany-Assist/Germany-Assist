import db from "../../database/index.js";

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
const serviceProviderRepository = {
  createServiceProvider,
  verifyServiceProvider,
};
export default serviceProviderRepository;
