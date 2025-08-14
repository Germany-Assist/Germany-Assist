import * as chatService from "../../services/chat.services.js";
import { socketErrorMiddleware } from "../../middlewares/socket.error.middleware.js";
import socketAuthMiddleware from "../../middlewares/socketAuth.middleware.js";
import { debugLogger, infoLogger } from "../../utils/loggers.js";
import { activeUsers } from "../index.js";
import { v4 as uuidv4 } from "uuid";
import { AppError } from "../../utils/error.class.js";
import userServices, {
  getUserById,
  userExists,
} from "../../services/user.services.js";

const rateLimits = {};
const RATE_LIMIT_WINDOW_MS = 1000;
const MAX_CALLS = 10;

function isRateLimited(socket, eventName, limit) {
  const now = Date.now();
  const key = `${socket.user.id}:${eventName}`;
  if (!rateLimits[key]) {
    rateLimits[key] = [];
  }
  rateLimits[key] = rateLimits[key].filter(
    (ts) => now - ts < RATE_LIMIT_WINDOW_MS
  );
  if (rateLimits[key].length >= MAX_CALLS) {
    return true;
  }
  rateLimits[key].push(now);
  return false;
}

export default function chatNamespace(io) {
  const chat = io.of("/chat");
  chat.use(socketErrorMiddleware);
  chat.use(socketAuthMiddleware);
  //
  chat.on("connection", async (socket) => {
    const userId = socket.user.id;
    try {
      infoLogger(`New connection to chat app: ${socket.id} user id ${userId}`);
      //step 1 register the user online

      activeUsers.registerUser(socket);
      //step 2 get his friends list and conversations
      const conversations = await chatService.getConversations(userId);

      if (conversations.length > 0) {
        socket.emit("conversations", conversations);
        //step 3 send user friends status and send friends user status and update status
        let listOfFriends = chatService.filterUserFriends(
          conversations,
          userId
        );
        activeUsers.appendFriendToUser(userId, listOfFriends);
        // //A tell the user
        socket.emit("frieds-status-online", activeUsers.onlineFriends(userId));
        // //B tell the friends
        let onlineFriends = activeUsers.onlineFriends(userId);
        if (onlineFriends) {
          onlineFriends.forEach((element) => {
            if (activeUsers.getSocketIdForActiveUser(element)) {
              chat
                .to(activeUsers.getSocketIdForActiveUser(element))
                .emit("friends-status-online", [userId]);
            }
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
          let onlineFriends = activeUsers.onlineFriends(userId);
          if (onlineFriends) {
            onlineFriends.forEach((i) => {
              chat.to(i).emit("friends-status-offline", [userId]);
            });
          }
        } catch (error) {
          if (error instanceof AppError) return socket.error(error);
          const er = new AppError(
            500,
            error.message,
            true,
            "opps",
            `user id ${userId}`
          );
          if (typeof callback === "function") {
            callback({
              success: false,
              message: er.publicMessage,
            });
          }
          socket.error(error);
        }
      });
      ////// on new friends also update friends list
      socket.on("add-new-friend", async (friendId, callback) => {
        try {
          infoLogger(`adding new friend user ${userId} is adding ${friendId}`);
          if (!friendId) {
            socket.validationError("invalid id", "add-new-friend");
            if (typeof callback === "function") {
              callback({
                success: false,
                message: "invalid id",
              });
              return false;
            }
          }

          if (!(await userServices.userExists(friendId))) {
            socket.validationError(
              "The specified user does not exist",
              "add-new-friend"
            );
            if (typeof callback === "function") {
              callback({
                success: false,
                message: "The specified user does not exist",
              });
            }
            return false;
          }
          let onlineFriends = activeUsers.onlineFriends(userId);
          if (onlineFriends && onlineFriends.includes(Number(friendId))) {
            if (typeof callback === "function") {
              callback({
                success: false,
                message: "already exists",
              });
            }
            return socket.noResultsError("already exists", "add-new-friend");
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
          if (typeof callback === "function") {
            callback({ success: true });
          }
        } catch (error) {
          if (error instanceof AppError) {
            if (typeof callback === "function") {
              callback({ success: false, message: error.publicMessage });
            }
            socket.error(error);
          } else {
            const er = new AppError(
              500,
              error.message,
              true,
              "opps",
              `user id ${userId}`
            );
            if (typeof callback === "function") {
              console.log(error);
              callback({
                success: false,
                message: er.publicMessage,
              });
            }
            socket.error(error);
          }
        }
      });

      socket.on("get-conversation", async (friendId, callback) => {
        infoLogger(
          `${userId} is trying to fetch his con with ${typeof friendId}`
        );
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
              callback({
                success: false,
                message: "Conversation not found",
              });
            return socket.noResultsError(
              "Conversation not found",
              "get-conversation"
            );
          }

          socket.emit("recive-conversation", con);

          let friend = activeUsers.checkIfUserActiveById(friendId);
          if (friend) {
            chat.to(friend).emit("just-fetched", con.id);
          }
          if (typeof callback === "function") callback({ success: true });
        } catch (error) {
          if (error instanceof AppError) {
            if (typeof callback === "function") {
              callback({ success: true, message: error.publicMessage });
            }
            socket.error(error);
            return;
          } else {
            const er = new AppError(
              500,
              error.message,
              true,
              "opps",
              `user id ${userId}`
            );
            if (typeof callback === "function") {
              callback({
                success: false,
                message: er.publicMessage,
              });
            }
            socket.error(error);
          }
        }
      });
      /////////////////////////////////////
      socket.on("send-message", async (message, participant, ack) => {
        if (!message || typeof message !== "object") {
          if (typeof ack === "function")
            ack({ success: false, message: "Invalid message format" });
          return socket.validationError(
            "Invalid message format",
            "send-message"
          );
        }
        if (!participant) {
          if (typeof ack === "function")
            ack({ success: false, message: "Missing participant" });
          return socket.validationError("Missing participant", "send-message");
        }
        if (
          !message.body &&
          typeof message.body !== "string" &&
          message.body.trim().length === 0 &&
          message.body.trim().length > 1000
        ) {
          if (typeof ack === "function")
            ack({ success: false, message: "Invalid message format" });
          return socket.validationError(
            "Invalid message format",
            "send-message"
          );
        }
        if (isRateLimited(socket, "send-message")) {
          if (typeof ack === "function")
            ack({ success: false, status: "limit reached" });
          socket.rateLimitError("sending messages");
        }
        const con = await chatService.getConversation(participant, userId);
        if (!con) {
          if (typeof ack === "function")
            ack({
              success: false,
              message: "Invalid message format",
            });
          socket.noResultsError("conversation not found", "send-message");
        }

        infoLogger(`message from ${userId} to ${participant}`);
        if (message && participant && con) {
          let messageObj = {
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

          //send the message to the particepent
          const parSocket = activeUsers.getSocketIdForActiveUser(participant);
          if (parSocket) {
            chat.to(parSocket).emit(
              "new-message",
              { ...messageObj, stored: false },
              ////// callback for the frontend extra level to check if disconnected during sending however this extrem ////////
              async (status) => {
                socket.emit(
                  "update-message-status",
                  con.id,
                  messageObj.id,
                  "delivered",
                  "im just a recive confirmation message"
                );
                await chatService.updateChat(con, {
                  ...messageObj,
                  delivered: true,
                });
                //indecates successfull delivery to the target user
                if (typeof ack === "function")
                  ack({ success: true, message: "recived" });
              }
            );
          } else {
            await chatService.updateChat(con, messageObj);
            //indecates successfull delivery to the server
            if (typeof ack === "function")
              ack({ success: true, message: "sent" });
          }
        }
      });

      socket.on(
        "update-message-status",
        async (participantId, msgId, status) => {
          const conId = await chatService.updateMessageStatus(
            msgId,
            socket.user.userId,
            participantId,
            status || "seen",
            true
          );
          const par = activeUsers.getSocketIdForActiveUser(participantId);
          if (par) {
            io.to(par).emit("update-message-status", conId, msgId, "seen");
          }
        }
      );
    } catch (error) {
      if (error instanceof AppError) {
        socket.error(error);
      } else {
        const er = new AppError(
          500,
          error.message,
          true,
          "opps",
          `user id ${userId}`
        );
        socket.error(error);
      }
    }
  });
}
