import User from "./models/user.js";
import ServiceProvider from "./models/service_provider.js";
import Service from "./models/service.js";
import Asset from "./models/assets.js";
import Review from "./models/review.js";
import Coupon from "./models/coupon.js";
import Chat from "./models/chat.js";
import Permission from "./models/permission.js";
import UserPermission from "./models/user_permission.js";
import UserRole from "./models/user_role.js";
import Employer from "./models/employer.js";
import Category from "./models/category.js";
import Payment from "./models/payment.js";
import Order from "./models/order.js";
import OrderItems from "./models/order_items.js";
import StripeEvent from "./models/stripe_event.js";
import Inquiry from "./models/inquiry.js";
import Favorite from "./models/favorite.js";

export const defineConstrains = () => {
  Inquiry.belongsTo(User, { foreignKey: "user_id" });
  User.hasMany(Inquiry, { foreignKey: "user_id" });
  Inquiry.belongsTo(Service, { foreignKey: "service_id" });
  Service.hasMany(Inquiry, { foreignKey: "service_id" });
  Inquiry.belongsTo(Order, { foreignKey: "order_id" });
  Order.hasMany(Inquiry, { foreignKey: "order_id" });
  User.hasMany(Order, { foreignKey: "user_id" });
  Order.belongsTo(User, { foreignKey: "user_id" });
  ServiceProvider.hasMany(Order, { foreignKey: "service_provider_id" });
  Order.belongsTo(ServiceProvider, { foreignKey: "service_provider_id" });

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
    scope: {
      related_type: "order",
    },
  });

  Service.hasMany(OrderItems, { foreignKey: "service_id" });
  OrderItems.belongsTo(Service, { foreignKey: "service_id" });

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
  Category.hasMany(Service, {
    foreignKey: "category_id",
  });
  Service.belongsTo(Category, {
    foreignKey: "category_id",
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
  User.belongsToMany(Favorite, {
    through: Favorite,
    foreignKey: "user_id",
  });

  Service.belongsToMany(Favorite, {
    through: Favorite,
    foreignKey: "service_id",
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
  Review,
  Coupon,
  Chat,
  Permission,
  UserPermission,
  UserRole,
  Employer,
  Category,
  Payment,
  Order,
  OrderItems,
  StripeEvent,
  Inquiry,
  Favorite,
};

export default db;
