import User from "./models/user.js";
import Business from "./models/business.js";
import Service from "./models/service.js";
import Asset from "./models/assets.js";
import Contract from "./models/contract.js";
import Review from "./models/review.js";
import Coupon from "./models/coupon.js";
import Chat from "./models/chat.js";
import UserService from "./models/user_service.js";
import Permission from "./models/permission.js";
import UserPermission from "./models/user_permission.js";
export const defineConstarins = () => {
  User.hasMany(Asset);
  User.hasMany(Review);
  User.belongsTo(Business);
  User.hasMany(Service);

  Service.belongsTo(Contract);
  Service.hasMany(Review);
  Service.hasMany(Asset);

  Business.hasMany(Service);
  Business.hasMany(Coupon);
  Business.hasMany(Asset);

  User.belongsToMany(Service, {
    through: UserService,
    foreignKey: "userId",
    otherKey: "serviceId",
    unique: false,
  });

  Service.belongsToMany(User, {
    through: UserService,
    foreignKey: "serviceId",
    otherKey: "userId",
    unique: false,
  });

  User.belongsToMany(Permission, {
    through: UserPermission,
    as: "userToPermission",
    foreignKey: "UserId",
    otherKey: "PermissionId",
    onDelete: "cascade",
    unique: true,
  });
  Permission.belongsToMany(User, {
    as: "permissionToUser",
    through: UserPermission,
    foreignKey: "PermissionId",
    otherKey: "UserId",
    onDelete: "cascade",
    unique: true,
  });

  return true;
};
if (process.env.SEEDING !== "true") {
  defineConstarins();
}

const db = {
  User,
  Business,
  Service,
  Asset,
  Contract,
  Review,
  Coupon,
  Chat,
  Permission,
  UserPermission,
};

export default db;
