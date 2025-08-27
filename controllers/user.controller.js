import { NODE_ENV, REFRESH_COOKIE_AGE } from "../configs/serverConfig.js";
import jwt from "../middlewares/jwt.middleware.js";
import { infoLogger } from "../utils/loggers.js";
import bcryptUtil from "../utils/bcrypt.util.js";
import { sequelize } from "../database/connection.js";
import permissionServices from "../services/permission.services.js";
import { roleTemplates } from "../database/templates.js";
import hashIdUtil from "../utils/hashId.util.js";
import authUtils from "../utils/authorize.util.js";
import userServices from "../services/user.services.js";
import { AppError } from "../utils/error.class.js";
export const cookieOptions = {
  httpOnly: true,
  secure: NODE_ENV === "production" ? true : false,
  sameSite: "strict",
  maxAge: REFRESH_COOKIE_AGE,
  path: "/api/user/refresh-token",
};
const sanitizeUser = (user) => {
  return {
    id: hashIdUtil.hashIdEncode(user.id),
    firstName: user.first_name,
    lastName: user.last_name,
    dob: user.dob,
    email: user.email,
    image: user.image,
    isVerified: user.is_verified,
    role: user.UserRole.role,
    related_type: user.UserRole.related_type,
    related_id: user.UserRole.related_id,
  };
};
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
    const sanitizedUser = sanitizeUser(user);
    await t.commit();
    res.cookie("refreshToken", refreshToken, cookieOptions);
    res.status(201).json({ accessToken, user: sanitizedUser });
  } catch (error) {
    await t.rollback();
    next(error);
  }
}
export async function createRepController(req, res, next) {
  const t = await sequelize.transaction();
  const permission = await authUtils.checkRoleAndPermission(
    req.auth,
    [("service_provider_root", "employer_root")],
    true,
    "user",
    "create"
  );
  if (!permission) throw new AppError(403, "forbidden", true, "forbidden");
  let repRole, repRelatedType;
  switch (req.auth.role) {
    case "service_provider_root":
      repRole = "service_provider_rep";
      repRelatedType = "ServiceProvider";
      break;
    case "employer_root":
      repRole = "employer_rep";
      repRelatedType = "Employer";
      break;
    default:
      throw new AppError(400, "failed to set role", false);
  }
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
        UserRole: {
          role: repRole,
          related_type: repRelatedType,
          related_id: req.auth.related_id,
        },
      },
      t
    );
    await permissionServices.initPermissions(
      user.id,
      roleTemplates[repRole],
      t
    );
    const { accessToken, refreshToken } = jwt.generateTokens(user);
    const sanitizedUser = sanitizeUser(user);
    await t.commit();
    res.cookie("refreshToken", refreshToken, cookieOptions);
    res.status(201).res.json({ accessToken, user: sanitizedUser });
  } catch (error) {
    await t.rollback();
    next(error);
  }
}
export async function createAdminController(req, res, next) {
  const t = await sequelize.transaction();
  await authUtils.checkRoleAndPermission(
    req.auth.id,
    req.auth.BusinessId,
    ["superAdmin", "admin"],
    true,
    "user",
    "create"
  );
  try {
    infoLogger(`creating new admin`);
    const { firstName, lastName, email, DOB, image } = req.body;
    const password = bcryptUtil.hashPassword(req.body.password);
    const user = await userServices.createUser(
      {
        first_name: firstName,
        last_name: lastName,
        email,
        password,
        DOB,
        image,
        role: "admin",
        is_verified: false,
      },
      t
    );

    await permissionServices.initPermissions(user.id, roleTemplates.admin, t);
    const { accessToken, refreshToken } = jwt.generateTokens(
      id,
      role.role,
      role.related_type,
      role.related_id
    );
    const sanitizedUser = {
      id: hashIdUtil.hashIdEncode(user.id),
      firstName: user.first_name,
      lastName: user.last_name,
      dob: user.dob,
      email: user.email,
      image: user.image,
      isVerified: user.is_verified,
      role: user.UserRole.role,
      relatedType: user.UserRole.related_type,
      relatedId: user.UserRole.related_id,
    };
    await t.commit();
    res.cookie("refreshToken", refreshToken, cookieOptions);
    res.status(201).res.json({ accessToken, user: sanitizedUser });
  } catch (error) {
    await t.rollback();
    next(error);
  }
}

export async function loginUserController(req, res, next) {
  try {
    const user = await userServices.loginUser(req.body);
    const { accessToken, refreshToken } = jwt.generateTokens(user);
    const sanitizedUser = sanitizeUser(user);
    res.cookie("refreshToken", refreshToken, cookieOptions);
    res.status(200).res.json({ accessToken, user: sanitizedUser });
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
    const user = jwt.verifyToken(refreshToken);
    const accessToken = jwt.generateAccessToken(user);
    res.cookie("refreshToken", refreshToken, cookieOptions);
    res.send({ accessToken });
  } catch (error) {
    next(error);
  }
}
export async function loginUserTokenController(req, res, next) {
  try {
    const user = await userServices.getUserById(req.auth.id);
    const sanitizedUser = {
      id: hashIdUtil.hashIdEncode(user.id),
      firstName: user.first_name,
      lastName: user.last_name,
      dob: user.dob,
      email: user.email,
      image: user.image,
      isVerified: user.is_verified,
      isRoot: user.is_root,
      role: user.UserRole.role,
      relatedType: user.UserRole.related_type,
      relatedId: user.UserRole.related_id,
    };
    res.send(sanitizedUser);
  } catch (error) {
    next(error);
  }
}
export async function getAllUsers(req, res, next) {
  try {
    await authUtils.checkRoleAndPermission(
      req.auth.id,
      req.auth.BusinessId,
      ["admin", "superAdmin"],
      true,
      "user",
      "read"
    );
    const users = await userServices.getAllUsers();
    const usersWithIds = users.map((e) => {
      return { ...e, id: hashIdUtil.hashIdEncode(e.id) };
    });
    res.send(usersWithIds);
  } catch (error) {
    next(error);
  }
}
export async function getBusinessReps(req, res, next) {
  try {
    await authUtils.checkRoleAndPermission(
      req.auth.id,
      req.auth.BusinessId,
      ["root_business", "rep"],
      true,
      "user",
      "read"
    );
    const users = await userServices.getBusinessReps(req.auth.BusinessId);
    const usersWithIds = users.map((e) => {
      return { ...e, id: hashIdUtil.hashIdEncode(e.id) };
    });
    res.send(usersWithIds);
  } catch (error) {
    next(error);
  }
}
export async function verifyUser(req, res, next) {
  try {
    await authUtils.checkRoleAndPermission(
      req.auth.id,
      req.auth.BusinessId,
      ["admin", "superAdmin"],
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
