import User from "./models/user.js";
import ServiceProvider from "./models/service_provider.js";
import Service from "./models/service.js";
import Asset from "./models/assets.js";
import Contract from "./models/contract.js";
import Review from "./models/review.js";
import Coupon from "./models/coupon.js";
import Chat from "./models/chat.js";
import UserService from "./models/user_service.js";
import Permission from "./models/permission.js";
import UserPermission from "./models/user_permission.js";
import UserRole from "./models/user_role.js";
import Employer from "./models/employer.js";
export const defineConstrains = () => {
  User.hasMany(Asset);
  User.hasMany(Review);
  User.hasMany(Service);

  Service.belongsTo(Contract);
  Service.hasMany(Review);
  Service.hasMany(Asset);

  ServiceProvider.hasMany(Service);
  ServiceProvider.hasMany(Coupon);
  ServiceProvider.hasMany(Asset);

  User.hasOne(UserRole, { foreignKey: "user_id" });
  UserRole.belongsTo(User, { foreignKey: "user_id" });
  ServiceProvider.hasMany(UserRole, {
    foreignKey: "related_id",
    scope: { related_type: "Employer" },
  });
  UserRole.belongsTo(Employer, {
    foreignKey: "related_id",
    constraints: false,
  });
  ServiceProvider.hasMany(UserRole, {
    foreignKey: "related_id",
    scope: { related_type: "ServiceProvider" },
  });
  UserRole.belongsTo(ServiceProvider, {
    foreignKey: "related_id",
    constraints: false,
  });

  User.belongsToMany(Service, {
    through: UserService,
    foreignKey: "user_id",
    otherKey: "service_id",
    unique: false,
  });

  Service.belongsToMany(User, {
    through: UserService,
    foreignKey: "service_id",
    otherKey: "user_id",
    unique: false,
  });

  User.belongsToMany(Permission, {
    through: UserPermission,
    as: "userToPermission",
    foreignKey: "user_id",
    otherKey: "permission_id",
    onDelete: "cascade",
    unique: true,
  });
  Permission.belongsToMany(User, {
    as: "permissionToUser",
    through: UserPermission,
    foreignKey: "permission_id",
    otherKey: "user_id",
    onDelete: "cascade",
    unique: true,
  });

  return true;
};
if (process.env.SEEDING !== "true") {
  defineConstrains();
}

const db = {
  User,
  ServiceProvider,
  Service,
  Asset,
  Contract,
  Review,
  Coupon,
  Chat,
  Permission,
  UserPermission,
  UserRole,
  Employer,
};

export default db;
