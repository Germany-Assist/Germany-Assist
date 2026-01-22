import db from "../../database/index.js";

async function archiveVariant(providerId, variantId, status) {
  const update = await db.Variant.findOne({
    where: { id: variantId },
    include: [
      {
        model: db.Service,
        where: { serviceProviderId: providerId },
        required: true,
      },
    ],
  });
  if (!update) return null;
  update.isArchived = status;
  await update.save();
  return update;
}
async function authorizeVariantCreation(providerId, serviceId) {
  return await db.Service.findOne({
    raw: true,
    where: { serviceProviderId: providerId, id: serviceId },
  });
}
async function createNewVariant(data) {
  const newVariant = await db.Variant.create(data);
  return newVariant;
}
const VariantRepository = {
  archiveVariant,
  createNewVariant,
  authorizeVariantCreation,
};
export default VariantRepository;
