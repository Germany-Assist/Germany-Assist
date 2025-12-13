import { sequelize } from "../../src/database/connection.js";
import db from "../../src/database/dbIndex.js";
import { roleTemplates } from "../../src/database/templates.js";
import permissionServices from "../../src/modules/permission/permission.services.js";
import { AppError } from "../../src/utils/error.class.js";
import { errorLogger } from "../../src/utils/loggers.js";

export async function permissionFactory(template, userId, overrides = []) {
  try {
    const templates = Object.keys(roleTemplates);
    if (!templates.includes(template))
      throw new AppError(
        400,
        "you must use the templates for the permission factory"
      );
    if (!userId)
      throw new AppError(
        400,
        "you must provide User Id the permission factory"
      );
    await permissionServices.initPermissions(userId, [
      ...roleTemplates[template],
      ...overrides,
    ]);
  } catch (error) {
    console.log(error);
    errorLogger(error.message);
  }
}
