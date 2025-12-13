import db from "../../src/database/dbIndex.js";
import { errorLogger } from "../../src/utils/loggers.js";
import { permissionFactory } from "./permission.factory.js";
import { userWithTokenFactory } from "./user.factory.js";
import { v4 as uuidv4 } from "uuid";
export async function serviceProviderFactory(overrides = {}) {
  try {
    const defaults = {
      name: "Test Provider",
      email: `serviceProvider+${uuidv4()}@test.com`,
      description: "Default description",
      about: "About Provider",
      phone_number: "123456789",
      image: null,
    };
    const sp = await db.ServiceProvider.create({ ...defaults, ...overrides });
    return await sp.toJSON();
  } catch (error) {
    errorLogger(error.message);
  }
}
export async function serviceProviderFullFactory(overrides = {}) {
  try {
    const SP = await serviceProviderFactory(overrides);
    const { user, accessToken } = await userWithTokenFactory({
      email: SP.email,
      is_verified: true,
      UserRole: {
        role: "service_provider_root",
        related_type: "ServiceProvider",
        related_id: SP.id,
      },
      ...overrides,
    });
    const Permission = await permissionFactory(
      "service_provider_root",
      user.id
    );

    return {
      accessToken,
      user,
      serviceProvider: SP,
    };
  } catch (error) {
    errorLogger(error);
  }
}
