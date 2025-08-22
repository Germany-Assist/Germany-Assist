import db from "../../database/dbIndex.js";
import { hashPassword } from "../../utils/bcrypt.util.js";

export async function userFactory(overrides = {}) {
  const defaults = {
    firstName: "John",
    lastName: "Doe",
    email: "user@test.com",
    password: hashPassword("123456"),
    role: "client",
    BusinessId: null,
  };
  return await db.User.create({ ...defaults, ...overrides });
}
