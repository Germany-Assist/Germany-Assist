import { Op, where } from "sequelize";
import { sequelize } from "../database/connection.js";
import db from "../database/dbIndex.js";
import { AppError } from "../utils/error.class.js";

export async function updateLastFetch(userId, chatId) {
  const timestamp = Date.now().toString();
  await db.Chat.update(
    {
      participants: sequelize.literal(
        `jsonb_set(
            "participants"::jsonb,
            '{${userId},lastFetch}'::text[],
            to_jsonb(${timestamp}::text),
            true
          )`
      ),
    },
    {
      where: { id: chatId },
    }
  );
  //should triger notification
  return timestamp;
}

export async function getConversations(id) {
  const chats = await db.Chat.findAll({
    where: {
      [`participants.${id}`]: { [Op.ne]: null },
    },
    order: [["updatedAt", "DESC"]],
    attributes: ["id", "participants", "conversation"],
    raw: true,
  });
  if (chats.length > 0) {
    chats.forEach(async (i) => {
      await updateLastFetch(id, i.id);
    });
  }
  return chats;
}

export async function getConversation(friendId, id) {
  const chat = await db.Chat.findOne({
    where: {
      [Op.and]: [
        { [`participants.${id}`]: { [Op.ne]: null } },
        { [`participants.${friendId}`]: { [Op.ne]: null } },
      ],
    },
    attributes: ["id", "participants", "conversation"],
    raw: true,
  });
  await updateLastFetch(id, chat.id);
  return chat;
}
export async function updateChat(con, message) {
  try {
    const result = await db.Chat.update(
      {
        conversation: sequelize.literal(
          `COALESCE("conversation", '[]'::jsonb) || '${JSON.stringify([
            message,
          ])}'::jsonb`
        ),
      },
      { where: { id: con.id } }
    );
    return result;
  } catch (error) {
    console.error("Error updating chat:", error);
    throw error;
  }
}

export async function startNewConversation(friendId, userId) {
  if (friendId === userId) return false;

  const exists = await getConversation(friendId, userId);

  if (exists) return false;
  const newChat = await db.Chat.create({
    conversation: [],
    participants: {
      [friendId]: {
        lastFetch: Date.now().toString(),
        lastUpdated: Date.now().toString(),
      },
      [userId]: {
        lastFetch: Date.now().toString(),
        lastUpdated: Date.now().toString(),
      },
    },
  });
  const friendProfile = db.User.findByPk(friendId, {
    attributes: ["id", "firstName", "lastName", "image"],
  });
  const userProfile = db.User.findByPk(userId, {
    attributes: ["id", "firstName", "lastName", "image"],
  });
  return { newChat, friendProfile, userProfile };
}
export function filterUserFriends(conversations, userId) {
  let listOfFriends = [];
  if (conversations && conversations.length > 0) {
    conversations.forEach((i) => {
      let parIds = Object.keys(i.participants);
      let arr = parIds.filter((i) => i != userId);
      listOfFriends.push(...arr);
    });
  }
  return listOfFriends;
}

export async function findConId(id1, id2) {
  const chat = await db.Chat.findOne({
    where: {
      [Op.and]: [
        { [`participants.${id1}`]: { [Op.ne]: null } },
        { [`participants.${id2}`]: { [Op.ne]: null } },
      ],
    },
    attributes: ["id"],
    raw: true,
  });
  if (!chat) return false;
  return chat.id;
}

export async function updateMessageStatus(
  msgId,
  userId,
  participantId,
  status,
  action = true
) {
  try {
    const conId = await findConId(userId, participantId);
    if (!conId) return false;
    const result = await db.Chat.update(
      {
        conversation: sequelize.literal(`
      jsonb_set(
            COALESCE("conversation", '[]'::jsonb),
            (
          SELECT ('{'||index||',${status}}')::text[]
          FROM (
            SELECT ordinality-1 as index
            FROM jsonb_array_elements("conversation") WITH ORDINALITY
            WHERE (value->>'id') = '${msgId}'
            LIMIT 1
          ) AS msg
        ),
        '${action}'::jsonb,
        true
      )
    `),
      },
      {
        where: {
          [Op.and]: [
            { [`participants.${userId}`]: { [Op.ne]: null } },
            { [`participants.${participantId}`]: { [Op.ne]: null } },
          ],
        },
      }
    );
    if (result[0] !== 0) return conId;
  } catch (error) {
    console.log(error.message);
  }
}
