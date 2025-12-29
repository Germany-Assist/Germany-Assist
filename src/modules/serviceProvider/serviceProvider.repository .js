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
    { transaction: t }
  );
};

const serviceProviderRepository = {
  createServiceProvider,
};
export default serviceProviderRepository;
