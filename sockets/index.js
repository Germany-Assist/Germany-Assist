import { Server } from "socket.io";
import socketAuthMiddleware from "../middlewares/socketAuth.middleware.js";
import setupNamespaces from "./events/index.js";
import { socketErrorMiddleware } from "../middlewares/socket.error.middleware.js";
import { CLIENT_URL } from "../configs/serverConfig.js";
/// in the future this should be replaced with redis
class usersLiveModel {
  users = {};
  registerUser(socket) {
    this.users[socket.user.userId] = {
      ...socket.user,
      socketId: socket.id,
      activeSince: Date.now(),
    };
  }
  getAllUsers() {
    return this.users;
  }
  removeUser(userId) {
    delete this.users[userId];
  }
  checkIfUserActiveById(userId) {
    return this.users[userId];
  }
  checkIfUsersActiveByIds(ids) {
    let activeUsers = ids.filter((id) => this.users[id]);
    return activeUsers;
  }
  getSocketIdForActiveUser(userId) {
    if (this.checkIfUserActiveById(userId)) return this.users[userId].socketId;
  }
  getSocketsIdsForActiveUsers(usersIds) {
    const activeUsers = usersIds.map((element) => {
      if (this.checkIfUserActiveById(element))
        return this.users[element].socketId;
    });
    return activeUsers;
  }
}

export const activeUsers = new usersLiveModel();

export default function createSocketServer(server) {
  const io = new Server(server, {
    cors: {
      origin: CLIENT_URL,
      methods: ["GET", "POST"],
    },
    connectionStateRecovery: {
      maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
    },
  });

  io.use(socketErrorMiddleware);
  io.use(socketAuthMiddleware);
  //dont forget to auth the name spaces
  setupNamespaces(io);
  return io;
}
