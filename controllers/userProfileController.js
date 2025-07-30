import { NODE_ENV } from "../configs/serverConfig.js";
import {
  createUser,
  getUserById,
  loginUser,
} from "../services/user.services.js";
import {
  generateAccessToken,
  generateTokens,
  verifyToken,
} from "../middlewares/jwt.middleware.js";
import { debugLogger } from "../utils/loggers.js";

// register and i will give you new access token and refresh token in a cookie
export async function createUserController(req, res, next) {
  try {
    debugLogger("creating new user");
    const data = req.body;
    const user = await createUser(data);
    const { accessToken, refreshToken } = generateTokens(user);
    const sanitizedUser = {
      firstName: user.firstName,
      lastName: user.lastName,
      DOB: user.DOB,
      email: user.email,
      image: user.image,
      isVerified: user.isVerified,
    };
    res.status(201);
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: NODE_ENV === "production" ? true : false,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    res.json({ accessToken, user: sanitizedUser });
    debugLogger(`success`);
  } catch (error) {
    next(error);
  }
}
// give me user name and password and i will give you new access token and refresh token in a cookie
export async function loginUserController(req, res, next) {
  try {
    const user = await loginUser(req.body);
    const { accessToken, refreshToken } = generateTokens(user);
    const sanitizedUser = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      DOB: user.DOB,
      email: user.email,
      image: user.image,
      isVerified: user.isVerified,
    };
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: NODE_ENV === "production" ? true : false,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    res.json({ accessToken, user: sanitizedUser });
  } catch (error) {
    next(error);
  }
}
//send me you refresh token cookie and shall give u new access token
export async function refreshUserToken(req, res, next) {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.sendStatus(401);
    }
    const user = verifyToken(refreshToken);
    const accessToken = generateAccessToken({ id: user.id });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: NODE_ENV === "production" ? true : false,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    res.send({ accessToken });
  } catch (error) {
    next(error);
  }
}

//send me your token and i will send you your profile back
export async function loginUserTokenController(req, res, next) {
  try {
    const user = await getUserById(req.auth.userId);
    const sanitizedUser = {
      firstName: user.firstName,
      lastName: user.lastName,
      DOB: user.DOB,
      email: user.email,
      image: user.image,
      isVerified: user.isVerified,
    };
    res.send(sanitizedUser);
  } catch (error) {
    next(error);
  }
}
