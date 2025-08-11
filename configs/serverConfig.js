export const SERVER_PORT = process.env.SERVER_PORT;
export const NODE_ENV = process.env.NODE_ENV;
export const LOG_LEVEL = NODE_ENV === "dev" ? "debug" : "http";
export const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
export const ACCESS_TOKEN_EXPIRE_DURATION =
  process.env.ACCESS_TOKEN_EXPIRE_DURATION;
export const REFRESH_TOKEN_EXPIRE_DURATION =
  process.env.REFRESH_TOKEN_EXPIRE_DURATION;
export const CLIENT_URL = process.env.CLIENT_URL;
