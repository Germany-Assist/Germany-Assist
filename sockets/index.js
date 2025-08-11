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
      friends: [],
    };
  }
  appendFriendToUser(id, friend) {
    if (!this.checkIfUserActiveById(id)) return false;
    if (Array.isArray(friend)) {
      this.users[id].friends.push(...friend.map((f) => Number(f)));
      return true;
    } else {
      this.users[id].friends.push(Number(friend));
      return true;
    }
  }

  onlineFriends(id) {
    if (this.users[id] && this.users[id].friends.length > 0)
      return this.getSocketsIdsForActiveUsers(this.users[id].friends);
    return false;
  }
  getAllUsers() {
    return this.users;
  }
  removeUser(userId) {
    delete this.users[userId];
  }
  checkIfUserActiveById(userId) {
    if (this.users[userId]) return this.users[userId];
    return false;
  }
  checkIfUsersActiveByIds(ids) {
    let activeUsers = ids.filter((id) => this.users[id]);
    return activeUsers;
  }
  getSocketIdForActiveUser(userId) {
    if (this.checkIfUserActiveById(userId)) return this.users[userId].socketId;
    return false;
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
      origin: [CLIENT_URL],
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
