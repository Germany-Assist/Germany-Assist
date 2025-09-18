import { sequelize } from "../../database/connection.js";
import db from "../../database/dbIndex.js";
import { roleTemplates } from "../../database/templates.js";
import permissionServices from "../../services/permission.services.js";
import { AppError } from "../../utils/error.class.js";
import { errorLogger } from "../../utils/loggers.js";

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
