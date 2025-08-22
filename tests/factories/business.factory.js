import db from "../../database/dbIndex.js";

export async function businessFactory(overrides = {}) {
  const defaults = {
    name: "Test Business",
    email: "test@biz.com",
    description: "Default description",
    about: "About business",
    phone_number: "123456789",
    image: null,
  };
  return await db.Business.create({ ...defaults, ...overrides });
}
