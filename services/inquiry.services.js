import db from "../database/dbIndex.js";

export async function updateInquiry(id, data, t) {
  await db.Inquiry.update(data, { where: { id }, transaction: t });
}
const inquiryServices = {
  updateInquiry,
};

export default inquiryServices;
