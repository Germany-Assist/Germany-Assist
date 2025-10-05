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
import Category from "./models/category.js";
import ServiceCategory from "./models/service_category.js";
import Payment from "./models/payment.js";
import Order from "./models/order.js";
import OrderItems from "./models/order_items.js";
import StripeEvent from "./models/stripe_event.js";
export const defineConstrains = () => {
  User.hasMany(Order, { foreignKey: "user_id" });
  Order.belongsTo(User, { foreignKey: "user_id" });

  Service.hasMany(OrderItems, { foreignKey: "service_id" });
  OrderItems.belongsTo(Service, { foreignKey: "service_id" });

  Order.hasMany(Payment, {
    foreignKey: "related_id",
    constraints: false,
    scope: {
      related_type: "order",
    },
  });
  Payment.belongsTo(Order, {
    foreignKey: "related_id",
    constraints: false,
  });
  OrderItems.belongsTo(Order, { foreignKey: "order_id" });
  Order.hasMany(OrderItems, { foreignKey: "order_id" });

  // Subscription.hasMany(Payment, {
  //   foreignKey: "related_id",
  //   constraints: false,
  //   scope: {
  //     related_type: "subscription",
  //   },
  // });

  // Payment.belongsTo(Subscription, {
  //   foreignKey: "related_id",
  //   constraints: false,
  // });

  User.hasMany(Service, { foreignKey: "user_id" });
  Service.belongsTo(User, { foreignKey: "user_id" });
  Service.belongsTo(Contract, { foreignKey: "contract_id" });

  Service.hasMany(Asset, { foreignKey: "service_id" });
  Asset.belongsTo(Service, { foreignKey: "service_id" });

  Service.hasMany(Review, { foreignKey: "service_id" });
  Review.belongsTo(Service, { foreignKey: "service_id" });

  ServiceProvider.hasMany(Service);
  Service.belongsTo(ServiceProvider);
  ServiceProvider.hasMany(Coupon);
  ServiceProvider.hasMany(Asset);

  User.hasMany(Asset, { foreignKey: "user_id" });
  Asset.belongsTo(User, { foreignKey: "user_id" });

  User.hasMany(Review, { foreignKey: "user_id" });
  Review.belongsTo(User, { foreignKey: "user_id" });

  User.hasOne(UserRole, { foreignKey: "user_id" });
  UserRole.belongsTo(User, { foreignKey: "user_id" });
  //service category
  Category.belongsToMany(Service, {
    through: ServiceCategory,
    as: "services",
    foreignKey: "category_id",
    otherKey: "service_id",
  });
  Service.belongsToMany(Category, {
    through: ServiceCategory,
    as: "categories",
    foreignKey: "service_id",
    otherKey: "category_id",
  });
  // Employer -> UserRole
  Employer.hasMany(UserRole, {
    foreignKey: "related_id",
    constraints: false,
    scope: {
      related_type: "Employer",
    },
    as: "roles",
  });

  UserRole.belongsTo(Employer, {
    foreignKey: "related_id",
    constraints: false,
    as: "employer",
  });

  // ServiceProvider -> UserRole
  ServiceProvider.hasMany(UserRole, {
    foreignKey: "related_id",
    constraints: false,
    scope: {
      related_type: "ServiceProvider",
    },
    as: "roles",
  });

  UserRole.belongsTo(ServiceProvider, {
    foreignKey: "related_id",
    constraints: false,
    as: "serviceProvider",
  });

  //user - service
  User.belongsToMany(Service, {
    through: { model: UserService, scope: { type: "favorite" } },
    foreignKey: "user_id",
    otherKey: "service_id",
    as: "userFavorite",
  });
  //cart
  User.belongsToMany(Service, {
    through: { model: UserService, scope: { type: "cart" } },
    foreignKey: "user_id",
    otherKey: "service_id",
    as: "userCart",
  });
  Service.belongsToMany(User, {
    through: UserService,
    foreignKey: "service_id",
    otherKey: "user_id",
    unique: false,
  });
  //user - permission
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
  Category,
  ServiceCategory,
  UserService,
  Payment,
  Order,
  OrderItems,
  StripeEvent,
};

export default db;
