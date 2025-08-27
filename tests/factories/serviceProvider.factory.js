import db from "../../database/dbIndex.js";
import { errorLogger } from "../../utils/loggers.js";

export async function serviceProviderFactory(overrides = {}) {
  try {
    const defaults = {
      name: "Test Provider",
      email: "test@biz.com",
      description: "Default description",
      about: "About Provider",
      phone_number: "123456789",
      image: null,
    };
    return await db.ServiceProvider.create({ ...defaults, ...overrides });
  } catch (error) {
    errorLogger(error.message);
  }
}
