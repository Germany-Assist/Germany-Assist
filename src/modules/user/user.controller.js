import { NODE_ENV, REFRESH_COOKIE_AGE } from "../../configs/serverConfig.js";
import jwt from "../../middlewares/jwt.middleware.js";
import { infoLogger } from "../../utils/loggers.js";
import bcryptUtil from "../../utils/bcrypt.util.js";
import { sequelize } from "../../database/connection.js";
import permissionServices from "../permission/permission.services.js";
import { roleTemplates } from "../../database/templates.js";
import hashIdUtil from "../../utils/hashId.util.js";
import authUtils from "../../utils/authorize.util.js";
import userServices from "./user.services.js";
import { AppError } from "../../utils/error.class.js";
import { v4 as uuid } from "uuid";
import { generateDownloadUrl } from "../../configs/s3Configs.js";
export const cookieOptions = {
  httpOnly: true,
  secure: NODE_ENV === "production" ? true : false,
  sameSite: "strict",
  maxAge: REFRESH_COOKIE_AGE,
  path: "/api/user/refresh-token",
};
const sanitizeUser = async (user) => {
  let favorites, orders, signedImage, imageKey;
  if (user.favorites && user.favorites.length > 0) {
    favorites = user.favorites.map((i) => {
      return {
        ...i,
        id: hashIdUtil.hashIdEncode(i.id),
        service: { ...i.Service, id: hashIdUtil.hashIdEncode(i.Service.id) },
      };
    });
  }
  if (user.Orders && user.Orders.length > 0) {
    orders = user.Orders.map((i) => {
      return {
        serviceId: hashIdUtil.hashIdEncode(i.Service.id),
        orderId: hashIdUtil.hashIdEncode(i.id),
        timelineId: hashIdUtil.hashIdEncode(i.Timeline.id),
        timelineLabel: i.Timeline.label,
      };
    });
  }
  if (user.profilePicture && user.profilePicture.length > 0) {
    if (user.googleId) {
      signedImage = user?.profilePicture[0]?.url;
    } else {
      signedImage = await generateDownloadUrl(user?.profilePicture[0]?.url);
    }
    imageKey = user?.profilePicture[0]?.name;
  }
  return {
    id: hashIdUtil.hashIdEncode(user.id),
    firstName: user.first_name,
    lastName: user.last_name,
    dob: user.dob,
    email: user.email,
    image: signedImage,
    imageKey: imageKey,
    isVerified: user.is_verified,
    role: user.UserRole.role,
    related_type: user.UserRole.related_type,
    related_id: user.UserRole.related_id,
    favorites,
    orders,
  };
};
function setRoleAndType(type) {
  let rootRole, rootRelatedType, firstName, lastName;
  switch (type) {
    case "serviceProvider":
      firstName = "root";
      lastName = "serviceProvider";
      rootRole = "service_provider_root";
      rootRelatedType = "ServiceProvider";
      break;
    case "employer":
      firstName = "root";
      lastName = "employer";
      rootRole = "employer_root";
      rootRelatedType = "Employer";
      break;
    default:
      throw new AppError(400, "failed to set role", false);
  }
  return { rootRole, rootRelatedType, firstName, lastName };
}
function setRoleAndTypeRep(parentRole) {
  let role, related_type;
  switch (parentRole) {
    case "service_provider_root":
      role = "service_provider_rep";
      related_type = "ServiceProvider";
      break;
    case "employer_root":
      role = "employer_rep";
      related_type = "Employer";
      break;
    default:
      throw new AppError(400, "failed to set role", false);
  }
  return { role, related_type };
}
export async function createClientController(req, res, next) {
  const t = await sequelize.transaction();
  try {
    const { firstName, lastName, email, dob, image } = req.body;
    const password = bcryptUtil.hashPassword(req.body.password);
    const user = await userServices.createUser(
      {
        first_name: firstName,
        last_name: lastName,
        email,
        password,
        dob,
        image,
        is_verified: false,
        UserRole: {
          role: "client",
          related_type: "client",
          related_id: null,
        },
      },
      t
    );
    await permissionServices.initPermissions(user.id, roleTemplates.client, t);
    const { accessToken, refreshToken } = jwt.generateTokens(user);
    const sanitizedUser = await userController.sanitizeUser(user);
    res
      .cookie("refreshToken", refreshToken, cookieOptions)
      .status(201)
      .json({ accessToken, user: sanitizedUser });
    await t.commit();
  } catch (error) {
    await t.rollback();
    next(error);
  }
}
//will work for any type of business(service Provider/employers)
export async function createRepController(req, res, next) {
  const t = await sequelize.transaction();
  const permission = await authUtils.checkRoleAndPermission(
    req.auth,
    ["service_provider_root", "employer_root"],
    true,
    "user",
    "create"
  );
  if (!permission) throw new AppError(403, "forbidden", true, "forbidden");

  try {
    const { role, related_type } = userController.setRoleAndTypeRep(
      req.auth.role
    );
    const { firstName, lastName, email, dob, image } = req.body;
    const password = bcryptUtil.hashPassword(req.body.password);
    const user = await userServices.createUser(
      {
        first_name: firstName,
        last_name: lastName,
        email,
        password,
        dob,
        image,
        UserRole: {
          role,
          related_type,
          related_id: req.auth.related_id,
        },
      },
      t
    );
    await permissionServices.initPermissions(user.id, roleTemplates[role], t);
    const { accessToken, refreshToken } = jwt.generateTokens(user);
    const sanitizedUser = await userController.sanitizeUser(user);
    res.cookie("refreshToken", refreshToken, cookieOptions);
    res.status(201).json({ accessToken, user: sanitizedUser });
    await t.commit();
  } catch (error) {
    await t.rollback();
    next(error);
  }
}
export async function createAdminController(req, res, next) {
  const t = await sequelize.transaction();
  await authUtils.checkRoleAndPermission(
    req.auth,
    ["super_admin"],
    true,
    "admin",
    "create"
  );
  try {
    infoLogger(`creating new admin`);
    const { firstName, lastName, email, dob, image } = req.body;
    const password = bcryptUtil.hashPassword(req.body.password);
    const user = await userServices.createUser(
      {
        first_name: firstName,
        last_name: lastName,
        email,
        password,
        dob,
        image,
        is_verified: false,
        UserRole: {
          role: "admin",
          related_type: "admin",
          related_id: null,
        },
      },
      t
    );
    await permissionServices.initPermissions(user.id, roleTemplates.admin, t);
    const { accessToken, refreshToken } = jwt.generateTokens(user);
    const sanitizedUser = await userController.sanitizeUser(user);
    res.cookie("refreshToken", refreshToken, cookieOptions);
    res.status(201).json({ accessToken, user: sanitizedUser });
    await t.commit();
  } catch (error) {
    await t.rollback();
    next(error);
  }
}
export async function createRootAccount(
  email,
  unHashedPassword,
  relatedId,
  type,
  t
) {
  const { rootRole, rootRelatedType, firstName, lastName } =
    userController.setRoleAndType(type);
  let password = bcryptUtil.hashPassword(unHashedPassword);
  const user = await userServices.createUser(
    {
      first_name: firstName,
      last_name: lastName,
      email,
      password,
      UserRole: {
        role: rootRole,
        related_type: rootRelatedType,
        related_id: relatedId,
      },
    },
    t
  );
  const root_permissions = await permissionServices.initPermissions(
    user.id,
    roleTemplates[rootRole],
    t
  );

  if (!root_permissions)
    throw new AppError(500, "failed to create permissions", false);
  const sanitizedUser = await userController.sanitizeUser(user);
  const { accessToken, refreshToken } = jwt.generateTokens(user);
  return { sanitizedUser, accessToken, refreshToken };
}
export async function loginUserController(req, res, next) {
  try {
    const user = await userServices.loginUser(req.body);
    const { accessToken, refreshToken } = jwt.generateTokens(user);
    const sanitizedUser = await userController.sanitizeUser(user);
    res
      .cookie("refreshToken", refreshToken, cookieOptions)
      .status(200)
      .json({ accessToken, user: sanitizedUser });
  } catch (error) {
    next(error);
  }
}
export async function refreshUserToken(req, res, next) {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.sendStatus(401);
    }
    const { id } = jwt.verifyToken(refreshToken);
    const user = await userServices.getUserById(id);
    const accessToken = jwt.generateAccessToken(user);
    res.send({ accessToken });
  } catch (error) {
    next(error);
  }
}
export async function loginUserTokenController(req, res, next) {
  try {
    const user = await userServices.getUserById(req.auth.id);
    const sanitizedUser = await userController.sanitizeUser(user);
    res.send(sanitizedUser);
  } catch (error) {
    next(error);
  }
}
export async function getUserProfile(req, res, next) {
  try {
    const user = await userServices.getUserProfile(req.auth.id);
    const sanitizedUser = await userController.sanitizeUser(
      await user.toJSON()
    );
    res.send(sanitizedUser);
  } catch (error) {
    next(error);
  }
}
export async function getAllUsers(req, res, next) {
  try {
    await authUtils.checkRoleAndPermission(
      req.auth,
      ["admin", "superAdmin"],
      true,
      "user",
      "read"
    );
    const users = await userServices.getAllUsers();
    const sanitizedUsers = users.map(async (e) => {
      return await userController.sanitizeUser(e);
    });
    res.send(sanitizedUsers);
  } catch (error) {
    next(error);
  }
}
export async function getBusinessReps(req, res, next) {
  try {
    await authUtils.checkRoleAndPermission(
      req.auth,
      ["service_provider_root", "service_provider_rep"],
      true,
      "user",
      "read"
    );
    const users = await userServices.getBusinessReps(req.auth.related_id);
    const sanitizedUsers = users.map(async (e) => {
      return await userController.sanitizeUser(e);
    });
    res.send(sanitizedUsers);
  } catch (error) {
    next(error);
  }
}
export async function verifyUser(req, res, next) {
  try {
    await authUtils.checkRoleAndPermission(
      req.auth,
      ["admin", "super_admin"],
      true,
      "user",
      "verify"
    );
    await userServices.alterUserVerification(
      hashIdUtil.hashIdDecode(req.params.id),
      true
    );
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
}
const userController = {
  createRootAccount,
  verifyUser,
  getBusinessReps,
  getAllUsers,
  loginUserTokenController,
  loginUserController,
  refreshUserToken,
  createAdminController,
  createRepController,
  createClientController,
  sanitizeUser,
  setRoleAndType,
  getUserProfile,
  setRoleAndTypeRep,
};
export default userController;
