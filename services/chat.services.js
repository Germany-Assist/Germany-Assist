import { Op } from "sequelize";
import { sequelize } from "../database/connection.js";
import db from "../database/dbIndex.js";
import { AppError } from "../utils/error.class.js";
import { debugLogger, infoLogger } from "../utils/loggers.js";

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
      where: chatId
        ? { id: chatId }
        : {
            [`participants.${userId}`]: { [Op.ne]: null },
          },
    }
  );
  return timestamp;
}

export async function getConversations(id) {
  debugLogger("fetching all conversations for ", id);
  try {
    const chats = await db.Chat.findAll({
      where: {
        [`participants.${id}`]: { [Op.ne]: null },
      },
      order: [["updatedAt", "DESC"]],
      attributes: ["id", "participants", "conversation"],
      raw: true,
    });
    if (chats.length < 1) return false;
    await updateLastFetch(id);
    return chats;
  } catch (error) {
    throw new AppError(
      500,
      error.message,
      false,
      "opps something went wrong",
      `user id :${id}`
    );
  }
}

export async function getConversation(friendId, id) {
  try {
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
    if (!chat) return false;
    await updateLastFetch(id, chat.id);
    return chat;
  } catch (error) {
    throw new AppError(
      500,
      error.message,
      false,
      "opps something went wrong",
      `user id :${id}`
    );
  }
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
    throw new AppError(500, error.message, false, "opps", `user id :${id}`);
  }
}

export async function startNewConversation(friendId, userId) {
  if (Number(friendId) === Number(userId))
    throw new AppError(
      500,
      "user cannot create conversation with him self",
      true,
      "user cannot create conversation with him self",
      `user id :${userId}`
    );
  const exists = await getConversation(friendId, userId);
  if (exists)
    throw new AppError(
      500,
      "Conversation already exists",
      true,
      "Conversation already exists",
      `user id :${userId}`
    );
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
  const friendProfile = await db.User.findByPk(friendId, {
    attributes: ["id", "firstName", "lastName", "image"],
  });
  const userProfile = await db.User.findByPk(userId, {
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
    throw new AppError(500, error.message, false, "opps", `user id :${id}`);
  }
}
