import * as chatService from "../../services/chat.services.js";
import { socketErrorMiddleware } from "../../middlewares/socket.error.middleware.js";
import socketAuthMiddleware from "../../middlewares/socketAuth.middleware.js";
import { debugLogger, infoLogger } from "../../utils/loggers.js";
import { activeUsers } from "../index.js";
import { v4 as uuidv4 } from "uuid";
import { AppError } from "../../utils/error.class.js";
import { getUserById, userExists } from "../../services/user.services.js";

const rateLimits = {};
const RATE_LIMIT_WINDOW_MS = 1000;
const MAX_CALLS = 10;

function isRateLimited(socket, eventName) {
  const now = Date.now();
  const key = `${socket.user.id}:${eventName}`;
  if (!rateLimits[key]) rateLimits[key] = [];
  rateLimits[key] = rateLimits[key].filter(
    (ts) => now - ts < RATE_LIMIT_WINDOW_MS
  );
  if (rateLimits[key].length >= MAX_CALLS) return true;
  rateLimits[key].push(now);
  return false;
}

export default function chatNamespace(io) {
  const chat = io.of("/chat");
  chat.use(socketErrorMiddleware);
  chat.use(socketAuthMiddleware);

  chat.on("connection", async (socket) => {
    const userId = socket.user.id;

    try {
      infoLogger(`New connection: ${socket.id} user id ${userId}`);
      activeUsers.registerUser(socket);

      const conversations = await chatService.getConversations(userId);

      if (conversations.length > 0) {
        socket.emit("conversations", conversations);

        const listOfFriends = chatService.filterUserFriends(
          conversations,
          userId
        );
        activeUsers.appendFriendToUser(userId, listOfFriends);

        socket.emit("frieds-status-online", activeUsers.onlineFriends(userId));

        const onlineFriends = activeUsers.onlineFriends(userId);
        if (onlineFriends) {
          onlineFriends.forEach((element) => {
            const friendSocket = activeUsers.getSocketIdForActiveUser(element);
            if (friendSocket)
              chat.to(friendSocket).emit("friends-status-online", [userId]);
          });
        }
      } else {
        socket.noResultsError("empty conversations", "conversations");
      }

      socket.on("disconnect", () => {
        try {
          if (!activeUsers.checkIfUserActiveById(userId)) return;
          activeUsers.removeUser(userId);
          infoLogger(`user disconnected from chat ${userId}`);

          const onlineFriends = activeUsers.onlineFriends(userId);
          if (onlineFriends) {
            onlineFriends.forEach((i) =>
              chat.to(i).emit("friends-status-offline", [userId])
            );
          }
        } catch (error) {
          const er =
            error instanceof AppError
              ? error
              : new AppError(
                  500,
                  error.message,
                  true,
                  "opps",
                  `user id ${userId}`
                );
          socket.error(er);
        }
      });

      socket.on("add-new-friend", async (friendId, callback) => {
        try {
          infoLogger(`adding new friend user ${userId} is adding ${friendId}`);

          if (!friendId) {
            socket.validationError("invalid id", "add-new-friend");
            if (typeof callback === "function")
              callback({ success: false, message: "invalid id" });
            return;
          }

          if (!(await userExists(friendId))) {
            socket.validationError(
              "The specified user does not exist",
              "add-new-friend"
            );
            if (typeof callback === "function")
              callback({
                success: false,
                message: "The specified user does not exist",
              });
            return;
          }

          const onlineFriends = activeUsers.onlineFriends(userId);
          if (onlineFriends && onlineFriends.includes(Number(friendId))) {
            socket.noResultsError("already exists", "add-new-friend");
            if (typeof callback === "function")
              callback({ success: false, message: "already exists" });
            return;
          }

          const { newChat, friendProfile, userProfile } =
            await chatService.startNewConversation(friendId, userId);

          if (newChat) {
            activeUsers.appendFriendToUser(userId, Number(friendId));
            socket.emit("new-friend", newChat, friendProfile);

            const friendSocket = activeUsers.checkIfUserActiveById(friendId);
            if (friendSocket)
              chat.to(friendSocket).emit("new-friend", newChat, userProfile);
          }

          if (typeof callback === "function") callback({ success: true });
        } catch (error) {
          const er =
            error instanceof AppError
              ? error
              : new AppError(
                  500,
                  error.message,
                  true,
                  "opps",
                  `user id ${userId}`
                );
          if (typeof callback === "function")
            callback({ success: false, message: er.publicMessage });
          socket.error(er);
        }
      });

      socket.on("get-conversation", async (friendId, callback) => {
        try {
          if (!friendId || typeof friendId !== "number") {
            if (typeof callback === "function")
              callback({ success: false, message: "Invalid friend ID" });
            return socket.validationError(
              "Invalid friend ID",
              "get-conversation"
            );
          }

          const con = await chatService.getConversation(friendId, userId);

          if (!con) {
            if (typeof callback === "function")
              callback({ success: false, message: "Conversation not found" });
            return socket.noResultsError(
              "Conversation not found",
              "get-conversation"
            );
          }

          socket.emit("recive-conversation", con);
          if (typeof callback === "function") callback({ success: true });
        } catch (error) {
          const er =
            error instanceof AppError
              ? error
              : new AppError(
                  500,
                  error.message,
                  true,
                  "opps",
                  `user id ${userId}`
                );
          if (typeof callback === "function")
            callback({ success: false, message: er.publicMessage });
          socket.error(er);
        }
      });

      socket.on("send-message", async (message, participant, ack) => {
        try {
          if (!message || typeof message !== "object")
            throw new AppError(400, "Invalid message format");
          if (!participant) throw new AppError(400, "Missing participant");
          if (
            !message.body ||
            typeof message.body !== "string" ||
            message.body.trim().length === 0 ||
            message.body.trim().length > 1000
          ) {
            throw new AppError(400, "Invalid message format");
          }

          if (isRateLimited(socket, "send-message")) {
            socket.rateLimitError("sending messages");
            if (typeof ack === "function")
              ack({ success: false, status: "limit reached" });
            return;
          }

          const con = await chatService.getConversation(participant, userId);
          if (!con) throw new AppError(404, "conversation not found");

          const messageObj = {
            body: message.body.trim(),
            type: message.type,
            timestamp: Date.now().toString(),
            id: uuidv4(),
            senderId: userId,
            conId: con.id,
            stored: true,
            seen: false,
            delivered: false,
          };

          const parSocket = activeUsers.getSocketIdForActiveUser(participant);

          if (parSocket) {
            chat
              .to(parSocket)
              .emit(
                "new-message",
                { ...messageObj, stored: false },
                async () => {
                  try {
                    socket.emit(
                      "update-message-status",
                      con.id,
                      messageObj.id,
                      "delivered"
                    );
                    await chatService.updateChat(con, {
                      ...messageObj,
                      delivered: true,
                    });
                  } finally {
                    if (typeof ack === "function")
                      ack({ success: true, message: "recived" });
                  }
                }
              );
          } else {
            await chatService.updateChat(con, messageObj);
            if (typeof ack === "function")
              ack({ success: true, message: "sent" });
          }
        } catch (error) {
          const er =
            error instanceof AppError
              ? error
              : new AppError(
                  500,
                  error.message,
                  true,
                  "opps",
                  `user id ${userId}`
                );
          if (typeof ack === "function")
            ack({ success: false, message: er.publicMessage });
          socket.error(er);
        }
      });

      socket.on(
        "update-message-status",
        async (participantId, msgId, status) => {
          try {
            const conId = await chatService.updateMessageStatus(
              msgId,
              socket.user.userId,
              participantId,
              status || "seen",
              true
            );
            const par = activeUsers.getSocketIdForActiveUser(participantId);
            if (par)
              io.to(par).emit("update-message-status", conId, msgId, "seen");
          } catch (error) {
            socket.error(
              error instanceof AppError
                ? error
                : new AppError(
                    500,
                    error.message,
                    true,
                    "opps",
                    `user id ${userId}`
                  )
            );
          }
        }
      );
    } catch (error) {
      const er =
        error instanceof AppError
          ? error
          : new AppError(500, error.message, true, "opps", `user id ${userId}`);
      socket.error(er);
    }
  });
}
