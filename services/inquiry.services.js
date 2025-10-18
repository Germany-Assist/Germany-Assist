import db from "../database/dbIndex.js";

export async function updateInquiry(filter, data, t) {
  await db.Inquiry.update(data, { where: filter, transaction: t });
}
const inquiryServices = {
  updateInquiry,
};

export default inquiryServices;
