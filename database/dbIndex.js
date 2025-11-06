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
import Order from "./models/order.js";
import StripeEvent from "./models/stripe_event.js";
import Favorite from "./models/favorite.js";
import Timeline from "./models/timeline.js";
import Post from "./models/post.js";
import Comment from "./models/comment.js";
export const defineConstrains = () => {
  //comment
  Comment.belongsTo(User, {
    foreignKey: "user_id",
  });
  Comment.belongsTo(Post, {
    foreignKey: "post_id",
  });
  Comment.belongsTo(Comment, {
    as: "parent",
    foreignKey: "parent_id",
    constraints: true,
  });
  Comment.hasMany(Comment, {
    as: "replies",
    foreignKey: "parent_id",
    constraints: true,
  });
  //post
  Post.belongsTo(Timeline, { foreignKey: "timeline_id" });
  Post.belongsTo(User, { foreignKey: "user_id" });
  Post.hasMany(Comment, {
    foreignKey: "post_id",
    constraints: false,
  });
  //timeline
  Timeline.hasMany(Order, { foreignKey: "timeline_id" });
  Timeline.belongsTo(Service, { foreignKey: "service_id" });
  Timeline.hasMany(Post, { foreignKey: "timeline_id" });
  //order
  Order.belongsTo(User, { foreignKey: "user_id" });
  Order.belongsTo(Service, { foreignKey: "service_id" });
  Order.belongsTo(Timeline, { foreignKey: "timeline_id" });
  //user
  User.hasMany(Post, { foreignKey: "user_id" });
  User.hasMany(Order, { foreignKey: "user_id" });
  User.hasMany(Service, { foreignKey: "user_id" });
  User.hasMany(Asset, { foreignKey: "user_id" });
  User.hasMany(Review, { foreignKey: "user_id" });
  User.hasOne(UserRole, { foreignKey: "user_id" });
  User.hasMany(Favorite, { foreignKey: "user_id" });
  User.belongsToMany(Permission, {
    through: UserPermission,
    as: "userToPermission",
    foreignKey: "user_id",
    otherKey: "permission_id",
    onDelete: "cascade",
    unique: true,
  });
  //user Role
  UserRole.belongsTo(User, { foreignKey: "user_id" });
  UserRole.belongsTo(Employer, {
    foreignKey: "related_id",
    constraints: false,
    as: "employer",
  });
  UserRole.belongsTo(ServiceProvider, {
    foreignKey: "related_id",
    constraints: false,
    as: "serviceProvider",
  });
  //service
  Service.hasMany(Order, { foreignKey: "service_id" });
  Service.belongsTo(User, { foreignKey: "user_id" });
  Service.hasMany(Asset, { foreignKey: "service_id" });
  Service.hasMany(Review, { foreignKey: "service_id" });
  Service.hasMany(Favorite, { foreignKey: "service_id" });
  Service.hasMany(Timeline, { foreignKey: "service_id" });
  Service.belongsTo(Category, { foreignKey: "category_id" });
  Service.belongsTo(ServiceProvider);
  //assets
  Asset.belongsTo(Service, { foreignKey: "service_id" });
  Asset.belongsTo(User, { foreignKey: "user_id" });

  //review
  Review.belongsTo(Service, { foreignKey: "service_id" });
  Review.belongsTo(User, { foreignKey: "user_id" });

  // service provider
  ServiceProvider.hasMany(Service);
  ServiceProvider.hasMany(Coupon);
  ServiceProvider.hasMany(Asset);
  ServiceProvider.hasMany(UserRole, {
    foreignKey: "related_id",
    constraints: false,
    scope: {
      related_type: "ServiceProvider",
    },
    as: "roles",
  });
  //category
  Category.hasMany(Service, {
    foreignKey: "category_id",
  });

  // Employer
  Employer.hasMany(UserRole, {
    foreignKey: "related_id",
    constraints: false,
    scope: {
      related_type: "Employer",
    },
    as: "roles",
  });

  //favorite
  Favorite.belongsTo(User, {
    foreignKey: "user_id",
  });
  Favorite.belongsTo(Service, {
    foreignKey: "service_id",
  });

  //permission
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
  Timeline,
  Post,
  Category,
  Order,
  StripeEvent,
  Comment,
  Favorite,
};

export default db;
