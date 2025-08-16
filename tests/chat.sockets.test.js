import test, {
  beforeEach,
  afterEach,
  describe,
  before,
  after,
} from "node:test";
import assert from "node:assert";
import { once } from "node:events";
import { io, app, server } from "../app.js";
import { sequelize } from "../database/connection.js";
import { io as ioc } from "socket.io-client";
import { SERVER_PORT } from "../configs/serverConfig.js";
import request from "supertest";
import { errorLogger } from "../utils/loggers.js";
import db from "../database/dbIndex.js";
import { setTimeout as delay } from "node:timers/promises";

let clientSocket1, clientSocket2, clientSocket3, user1, user2, user3;

const user1Data = {
  firstName: "firstUser",
  lastName: "test",
  email: "chat-user1@example.com",
  password: "StrongPassword123!",
  DOB: "1992-05-15",
};

const user2Data = {
  firstName: "secondUser",
  lastName: "test",
  email: "chat-user2@example.com",
  password: "StrongPassword123!",
  DOB: "1992-05-15",
};
const user3Data = {
  firstName: "thirdUser",
  lastName: "test",
  email: "chat-user3@example.com",
  password: "StrongPassword123!",
  DOB: "1992-05-15",
};
function connectSocket(accessToken) {
  return ioc(`http://localhost:${SERVER_PORT}/chat`, {
    extraHeaders: { auth: `Bearer ${accessToken}` },
    forceNew: true,
  });
}
before(async () => {
  await db.Chat.destroy({ where: {}, force: true });
  await db.User.destroy({ where: {}, force: true });
  await db.UserPermission.destroy({ where: {}, force: true });

  [user1, user2, user3] = await Promise.all([
    request(app).post("/api/user").send(user1Data),
    request(app).post("/api/user").send(user2Data),
    request(app).post("/api/user").send(user3Data),
  ]);

  if (!server.listening) {
    server.listen(SERVER_PORT, "localhost");
    await once(server, "listening");
  }
});
after(async () => {
  if (clientSocket1?.connected) await clientSocket1.disconnect();
  if (clientSocket2?.connected) await clientSocket2.disconnect();
  if (clientSocket3?.connected) await clientSocket3.disconnect();
  await io.close();
  if (server.listening) {
    server.close();
  }
});
beforeEach(async () => {
  clientSocket1 = connectSocket(user1.body.accessToken);
  clientSocket2 = connectSocket(user2.body.accessToken);
  await Promise.all([
    once(clientSocket1, "connect"),
    once(clientSocket2, "connect"),
  ]);
  clientSocket1.on("error", (err) =>
    errorLogger(`Socket1 Error: ${JSON.stringify(err)}`)
  );
  clientSocket2.on("error", (err) =>
    errorLogger(`Socket2 Error: ${JSON.stringify(err)}`)
  );
});

afterEach(async () => {
  if (clientSocket1?.connected) await clientSocket1.disconnect();
  if (clientSocket2?.connected) await clientSocket2.disconnect();
  if (clientSocket3?.connected) await clientSocket3.disconnect();
});

describe("Socket.IO friends feature messages", { timeout: 10000 }, () => {
  test("should connect both sockets", () => {
    assert.ok(clientSocket1.connected);
    assert.ok(clientSocket2.connected);
  });
  test(
    "sender should receive 'new-friend' event after adding",
    { timeout: 2000 },
    async () => {
      await clientSocket1.emit("add-new-friend", user2.body.user.id);
      const result = await once(clientSocket1, "new-friend");
      assert.ok(result);
      assert.strictEqual(result[1].id, user2.body.user.id);
    }
  );
  test("should emit 'add-new-friend' with error already exists", async () => {
    await clientSocket1.emit("add-new-friend", user2.body.user.id);
    await delay(1000);
    const response = await new Promise(async (res) => {
      clientSocket2.emit("add-new-friend", user1.body.user.id, res);
    });
    assert.strictEqual(response.success, false);
    assert.strictEqual(response.message, "Conversation already exists");
  });

  test("should return error if friend ID is empty", async () => {
    const response = await Promise.race([
      new Promise((res) => {
        clientSocket2.emit("add-new-friend", "", res);
      }),
      delay(3000).then(() => ({ success: null })),
    ]);

    assert.notStrictEqual(
      response.success,
      null,
      "Server did not respond in time"
    );
    assert.strictEqual(response.success, false);
    assert.strictEqual(response.message, "invalid id");
  });
  test("should return error if user no longer exists", async () => {
    const response = await Promise.race([
      new Promise((res) => {
        clientSocket2.emit("add-new-friend", "999999999999", res);
      }),
      delay(3000).then(() => ({ success: null })),
    ]);

    assert.notStrictEqual(
      response.success,
      null,
      "Server did not respond in time"
    );
    assert.strictEqual(response.success, false);
    assert.strictEqual(response.message, "The specified user does not exist");
  });
});

// describe(
//   "testing messages and features",
//   { timeout: { timeout: 15000 } },
//   () => {
//     test("should send a message to active user and ack recived", async () => {
//       await clientSocket1.emit("add-new-friend", user2.body.user.id);
//       await delay(1000);
//       let message1 = {
//         body: "greeting",
//         type: "text",
//       };

//       const responseM1 = await Promise.race([
//         new Promise((res) => {
//           clientSocket1.emit("send-message", message1, user2.body.user.id, res);
//         }),
//         delay(2000).then(() => ({ success: null })),
//       ]);
//       assert.notStrictEqual(
//         responseM1.success,
//         null,
//         "Server did not respond in time"
//       );
//       assert.strictEqual(responseM1.success, true);
//       assert.strictEqual(responseM1.message, "recived");
//     });
//     test("should send a message to a non active user and ack sent", async () => {
//       await clientSocket1.emit("add-new-friend", user2.body.user.id);
//       await clientSocket2.disconnect();
//       await delay(1000);
//       let message1 = {
//         body: "greeting",
//         type: "text",
//       };
//       const responseM1 = await Promise.race([
//         new Promise((res) => {
//           clientSocket1.emit("send-message", message1, user2.body.user.id, res);
//         }),
//         delay(2000).then(() => ({ success: null })),
//       ]);
//       assert.notStrictEqual(
//         responseM1.success,
//         null,
//         "Server did not respond in time"
//       );
//       assert.strictEqual(responseM1.success, true);
//       assert.strictEqual(responseM1.message, "sent");
//     });
//     test("should fail to send a message due to Invalid message format", async () => {
//       await clientSocket1.emit("add-new-friend", user2.body.user.id);
//       await delay(1000);
//       let message1 = "";
//       const responseM1 = await Promise.race([
//         new Promise((res) => {
//           clientSocket1.emit("send-message", message1, user2.body.user.id, res);
//         }),
//         delay(2000).then(() => ({ success: null })),
//       ]);
//       assert.notStrictEqual(
//         responseM1.success,
//         null,
//         "Server did not respond in time"
//       );
//       assert.strictEqual(responseM1.success, false);
//       assert.strictEqual(responseM1.message, "Invalid message format");
//     });
//     test("should fail to send a message due to Missing participant", async () => {
//       await clientSocket1.emit("add-new-friend", user2.body.user.id);
//       await delay(1000);
//       let message1 = {
//         body: "greeting",
//         type: "text",
//       };
//       const responseM1 = await Promise.race([
//         new Promise((res) => {
//           clientSocket1.emit("send-message", message1, "", res);
//         }),
//         delay(2000).then(() => ({ success: null })),
//       ]);
//       assert.notStrictEqual(
//         responseM1.success,
//         null,
//         "Server did not respond in time"
//       );
//       assert.strictEqual(responseM1.success, false);
//       assert.strictEqual(responseM1.message, "Missing participant");
//     });
//     test(
//       "should pass to follow the pattren of loging in",
//       { timeout: 10000 },
//       async () => {
//         let message1 = {
//           body: "greeting",
//           type: "text",
//         };
//         let message2 = {
//           body: "www.s3/amr/whatever.png",
//           type: "image",
//         };
//         // 1. user1(online) adds user3(offline)
//         let addFriendPromise = new Promise((res) => {
//           clientSocket1.emit("add-new-friend", user3.body.user.id, res);
//         });
//         assert.strictEqual((await addFriendPromise).success, true);
//         // 2. user1 sends 2 messages to user3
//         await clientSocket1.emit("send-message", message1, user3.body.user.id);
//         await delay(1000);
//         await clientSocket1.emit("send-message", message2, user3.body.user.id);
//         await delay(1000);
//         assert.ok(true);
//         // 3. user one should recive a ack but that was tested in the previuos test
//         // 4. user3 should log in and recive an object conversations that contain his messages
//         // 4. also user1 should be notified if he is online and his friend just beacame online to update the messages status
//         clientSocket3 = connectSocket(user3.body.accessToken);
//         const conversationsPromise = once(clientSocket3, "conversations");
//         let conversations = await conversationsPromise;
//         conversations = conversations[0]; // this is just to avoid ack
//         const conversation = conversations[0];
//         // important for later i will explain down bellow
//         let firstLastFetch =
//           conversation.participants[user3.body.user.id].lastFetch;
//         let secondLastFetch;
//         //
//         assert.ok(conversations);
//         assert.ok(Array.isArray(conversations));
//         assert.strictEqual(conversations.length, 1);

//         const messages = conversation.conversation;
//         assert.ok(messages);
//         assert.ok(Array.isArray(messages));
//         assert.strictEqual(messages.length, 2);

//         assert.deepStrictEqual(messages[0].body, message1.body);
//         assert.deepStrictEqual(messages[1].body, message2.body);
//         assert.ok(conversation.participants[user3.body.user.id]);
//         assert.ok(conversation.participants[user1.body.user.id]);

//         let res = once(clientSocket3, "recive-conversation");
//         clientSocket3.emit("get-conversation", user1.body.user.id);
//         let newConv = await res;
//         assert.strictEqual(newConv.length, 2); // to skip the ack
//         newConv = newConv[0]; // to skip the ack
//         assert.ok(newConv.participants[user3.body.user.id]);
//         assert.ok(newConv.participants[user1.body.user.id]);
//         secondLastFetch = newConv.participants[user3.body.user.id].lastFetch;
//         // yes all of this just to check if he update the last fetch time
//         assert.ok(secondLastFetch > firstLastFetch);
//       }
//     );
//   }
// );
