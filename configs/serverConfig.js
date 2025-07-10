export const SERVER_PORT = process.env.SERVER_PORT;
export const NODE_ENV = process.env.NODE_ENV;
export const LOG_LEVEL = NODE_ENV === "dev" ? "debug" : "http";
