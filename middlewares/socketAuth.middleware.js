import { AppError } from "../utils/error.class.js";
import { verifyAccessToken } from "./jwt.middleware.js";

export default function socketAuthMiddleware(socket, next) {
  try {
    const auth = socket.handshake.headers.auth;
    if (!auth)
      throw new AppError(401, "no token provided", true, "no token provided");
    const token = auth.split(" ")[1];
    const decoded = verifyAccessToken(token);
    socket.user = decoded;
    next();
  } catch (error) {
    const err = new AppError(401, error.message, true, error.message, {
      socketId: socket.id,
    });
    socket.error(err);
    next(err);
  }
}
