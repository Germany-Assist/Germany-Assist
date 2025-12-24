import userDomain from "./user.domain.js";
import userServices from "./user.services.js";

export async function createClientController(req, res, next) {
  try {
    const result = await userServices.registerClient(req.body);
    res
      .cookie("refreshToken", result.refreshToken, userDomain.cookieOptions)
      .status(201)
      .json({ accessToken: result.accessToken, user: result.user });
  } catch (error) {
    next(error);
  }
}

export async function createRepController(req, res, next) {
  try {
    const result = userServices.registerRep(req.body, req.auth);
    res.status(201).json({ user: result.user });
  } catch (error) {
    await t.rollback();
    next(error);
  }
}

export async function createAdminController(req, res, next) {
  try {
    const result = await userServices.registerAdmin(req.body, req.auth);
    res.status(201).json({ user: result.user });
  } catch (error) {
    next(error);
  }
}

export async function getAllUsers(req, res, next) {
  try {
    const users = await userServices.getAllUsers(req.auth);
    res.send(users);
  } catch (error) {
    next(error);
  }
}

export async function getReps(req, res, next) {
  try {
    const users = await userServices.getReps(req.auth);
    res.send(users);
  } catch (error) {
    next(error);
  }
}

// export async function createRootAccount(
//   email,
//   unHashedPassword,
//   relatedId,
//   type,
//   t
// ) {
//   const { rootRole, rootRelatedType, firstName, lastName } =
//     userDomain.setRoleAndType(type);
//   let password = bcryptUtil.hashPassword(unHashedPassword);
//   const user = await userServices.createUser(
//     {
//       firstName: firstName,
//       lastName: lastName,
//       email,
//       password,
//       UserRole: {
//         role: rootRole,
//         relatedType: rootRelatedType,
//         relatedId: relatedId,
//       },
//     },
//     t
//   );
//   const root_permissions = await permissionServices.initPermissions(
//     user.id,
//     roleTemplates[rootRole],
//     t
//   );

//   if (!root_permissions)
//     throw new AppError(500, "failed to create permissions", false);
//   const sanitizedUser = await userMapper.sanitizeUser(user);
//   const { accessToken, refreshToken } = jwt.generateTokens(user);

//   return { sanitizedUser, accessToken, refreshToken };
// }
const userController = {
  getReps,
  getAllUsers,
  createAdminController,
  createRepController,
  createClientController,
};
export default userController;
