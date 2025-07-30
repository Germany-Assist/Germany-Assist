import * as chatService from "../../services/chat.services.js";
import { socketErrorMiddleware } from "../../middlewares/socket.error.middleware.js";
import socketAuthMiddleware from "../../middlewares/socketAuth.middleware.js";
import { infoLogger } from "../../utils/loggers.js";
import { activeUsers } from "../index.js";
import { v4 as uuidv4 } from "uuid";
import { AppError } from "../../utils/error.class.js";

const rateLimits = {};
const RATE_LIMIT_WINDOW_MS = 1000;
const MAX_CALLS = 10;
function isRateLimited(socket, eventName, limit) {
  const now = Date.now();
  const key = `${socket.user.userId}:${eventName}`;
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
    try {
      infoLogger(
        `New connection to chat app: ${socket.id} user id ${socket.user.userId}`
      );
      //step 1 register the user online
      activeUsers.registerUser(socket);
      //step 2 get his friends list and conversations

      const conversations = await chatService.getConversations(
        socket.user.userId
      );
      socket.emit("conversations", conversations);
      //step 3 send user friends status and send friends user status and update status
      let listOfFriends = chatService.filterUserFriends(
        conversations,
        socket.user.userId
      );
      let onlineFriends = activeUsers.checkIfUsersActiveByIds(listOfFriends);
      // //A tell the user
      socket.emit("friends-status-online", onlineFriends);
      // //B tell the friends
      onlineFriends.forEach((element) => {
        if (activeUsers.getSocketIdForActiveUser(element)) {
          chat
            .to(activeUsers.getSocketIdForActiveUser(element))
            .emit("friends-status-online", [socket.user.userId]);
        }
      });
      socket.on("disconnect", () => {
        const target = activeUsers.getSocketsIdsForActiveUsers(listOfFriends);
        if (target < 1) return;
        infoLogger(`user disconnected from chat ${socket.user.userId}`);
        target.forEach((i) => {
          chat.to(i).emit("friends-status-offline", [socket.user.userId]);
        });
        activeUsers.removeUser(socket.user.userId);
      });
      ////// on new friends also update friends list
      socket.on("add-new-friend", async (friendId) => {
        if (listOfFriends.includes(Number(friendId))) return false;
        listOfFriends.push(Number(friendId));

        const { newChat, friendProfile, userProfile } =
          await chatService.startNewConversation(friendId, socket.user.userId);
        if (newChat) {
          socket.emit("new-friend", newChat, friendProfile);
          const friendSocket = activeUsers.checkIfUserActiveById(friendId);
          if (friendSocket)
            chat.to(friendSocket).emit("new-friend", newChat, userProfile);
        }
      });
      socket.on("get-conversation", async (friendId) => {
        const con = await chatService.getConversation(
          friendId,
          socket.user.userId
        );
        if (!con) return;
        socket.emit("recive-conversation", con);
        let friend = activeUsers.checkIfUserActiveById(friendId);
        if (friend) {
          chat.to(friend).emit("just-fetched", con.id);
        }
      });
      socket.on("new-message", async (message, participant, ack) => {
        if (isRateLimited(socket, "new-message")) {
          ack("faild");
          socket.rateLimitError("sending new messages");
        }
        const con = await chatService.getConversation(
          participant,
          socket.user.userId
        );
        if (!con) return;
        let senderId = socket.user.userId;
        infoLogger(`message from ${senderId} to ${participant}`);
        if (message && participant && con) {
          let messageObj = {
            message: message.body,
            type: message.type,
            timestamp: Date.now().toString(),
            id: uuidv4(),
            senderId,
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
              //////callback for the frontend////////
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
              }
            );
          } else {
            await chatService.updateChat(con, messageObj);
            //indecates successfull delivery
            ack("success");
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
        const er = new AppError(500, error.message, true, "ops");
        socket.error(error);
      }
    }
  });
}
