import db from "../../database/index.js";

const createNew = async (categoryId, serviceProviderId, t) => {
  await db.ServiceProviderCategory.create(
    { categoryId, serviceProviderId },
    { transaction: t },
  );
};

const providerCategoryRepository = {
  createNew,
};
export default providerCategoryRepository;
