import { AppError } from "../../utils/error.class.js";
import jwt from "../../middlewares/jwt.middleware.js";

export default function socketAuthMiddleware(socket, next) {
  try {
    const auth = socket.handshake.headers.auth;
    if (!auth)
      throw new AppError(401, "no token provided", true, "no token provided");
    const decoded = jwt.verifyAccessToken(auth);
    socket.auth = decoded;
    next();
  } catch (error) {
    next(error);
  }
}
