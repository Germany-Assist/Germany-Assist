import { NODE_ENV, REFRESH_COOKIE_AGE } from "../../configs/serverConfig.js";

const cookieOptions = {
  httpOnly: true,
  secure: NODE_ENV === "production" ? true : false,
  sameSite: "strict",
  maxAge: REFRESH_COOKIE_AGE,
  path: "/api/user/refresh-token",
};
const authDomain = { cookieOptions };
export default authDomain;
