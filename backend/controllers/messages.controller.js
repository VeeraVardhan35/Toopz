import { db } from "../config/db.js";
import {
  conversations,
  conversationParticipants,
  messages,
  messageReadReceipts,
  users,
  groups,
  groupMembers,
} from "../database/schema.js";
import { eq, and, or, desc, sql, ilike, inArray } from "drizzle-orm";
import cloudinary from "../config/cloudinary.js";
import { getIO } from "../config/socket.js";
import { getCachedData, setCachedData, deleteCachedDataByPattern } from "../config/redis.js";

export const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    const cacheKey = `conversations:page:${pageNum}:limit:${limitNum}:user:${userId}`;
    
    const cachedData = await getCachedData(cacheKey);
    if (cachedData) {
      return res.status(200).json({
        success: true,
        ...cachedData,
        cached: true,
      });
    }

    const [{ count: totalCount }] = await db
      .select({ count: sql`COUNT(*)::int` })
      .from(conversationParticipants)
      .where(eq(conversationParticipants.userId, userId));

    const userConversations = await db
      .select({
        id: conversations.id,
        type: conversations.type,
        name: conversations.name,
        avatarUrl: conversations.avatarUrl,
        groupId: conversations.groupId,
        updatedAt: conversations.updatedAt,
        lastMessage: sql`(
          SELECT json_build_object(
            'id', m.id,
            'content', m.content,
            'type', m.type,
            'createdAt', m.created_at,
            'senderId', m.sender_id
          )
          FROM ${messages} m
          WHERE m.conversation_id = ${conversations.id}
          ORDER BY m.created_at DESC
          LIMIT 1
        )`.as("last_message"),
        unreadCount: sql`(
          SELECT COUNT(*)::int
          FROM ${messages} m
          LEFT JOIN ${messageReadReceipts} mrr 
            ON m.id = mrr.message_id AND mrr.user_id = ${userId}
          WHERE m.conversation_id = ${conversations.id}
            AND m.sender_id != ${userId}
            AND mrr.id IS NULL
        )`.as("unread_count"),
      })
      .from(conversationParticipants)
      .leftJoin(
        conversations,
        eq(conversationParticipants.conversationId, conversations.id)
      )
      .where(eq(conversationParticipants.userId, userId))
      .orderBy(desc(conversations.updatedAt))
      .limit(limitNum)
      .offset(offset);

    const conversationsWithParticipants = await Promise.all(
      userConversations.map(async (conv) => {
        if (conv.type === "direct") {
          const [otherUser] = await db
            .select({
              id: users.id,
              name: users.name,
              profileUrl: users.profileUrl,
              email: users.email,
            })
            .from(conversationParticipants)
            .leftJoin(users, eq(conversationParticipants.userId, users.id))
            .where(
              and(
                eq(conversationParticipants.conversationId, conv.id),
                sql`${conversationParticipants.userId} != ${userId}`
              )
            );

          return {
            ...conv,
            otherUser,
          };
        } else {
          const participants = await db
            .select({
              id: users.id,
              name: users.name,
              profileUrl: users.profileUrl,
            })
            .from(conversationParticipants)
            .leftJoin(users, eq(conversationParticipants.userId, users.id))
            .where(eq(conversationParticipants.conversationId, conv.id));

          let groupInfo = null;
          if (conv.groupId) {
            const [group] = await db
              .select({
                id: groups.id,
                name: groups.name,
                type: groups.type,
              })
              .from(groups)
              .where(eq(groups.id, conv.groupId));
            groupInfo = group;
          }

          return {
            ...conv,
            participants,
            group: groupInfo,
            name: conv.name || groupInfo?.name || "Group Chat",
          };
        }
      })
    );

    const result = {
      conversations: conversationsWithParticipants,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalCount / limitNum),
        totalItems: totalCount,
        itemsPerPage: limitNum,
        hasNextPage: pageNum < Math.ceil(totalCount / limitNum),
        hasPrevPage: pageNum > 1,
      },
    };

    await setCachedData(cacheKey, result, 120);

    return res.status(200).json({
      success: true,
      ...result,
      cached: false,
    });
  } catch (error) {
<<<<<<< HEAD
    console.error("❌ Error:", error);
=======
>>>>>>> 2cd663c (Ready for Deployment with reduced errors)
    return res.status(500).json({
      success: false,
      message: "Failed to fetch conversations",
    });
  }
};

export const createGroupConversation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { groupId } = req.body;

    if (!groupId) {
      return res.status(400).json({
        success: false,
        message: "Group ID is required",
      });
    }

    const [group] = await db
      .select({
        id: groups.id,
        name: groups.name,
        type: groups.type,
      })
      .from(groups)
      .where(eq(groups.id, groupId));

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    const [existingConversation] = await db
      .select()
      .from(conversations)
      .where(
        and(
          eq(conversations.type, "group"),
          eq(conversations.groupId, groupId)
        )
      );

    if (existingConversation) {
      return res.status(200).json({
        success: true,
        conversation: {
          ...existingConversation,
          name: existingConversation.name || group.name,
        },
      });
    }

    const members = await db
      .select({
        userId: groupMembers.userId,
      })
      .from(groupMembers)
      .where(eq(groupMembers.groupId, groupId));

    const [newConversation] = await db
      .insert(conversations)
      .values({
        universityId: req.user.universityId,
        type: "group",
        groupId,
        name: group.name,
        createdBy: userId,
      })
      .returning();

    if (members.length > 0) {
      await db.insert(conversationParticipants).values(
        members.map((member) => ({
          conversationId: newConversation.id,
          userId: member.userId,
        }))
      );
    }

    await deleteCachedDataByPattern(`conversations:*:user:${userId}`);

    return res.status(201).json({
      success: true,
      conversation: newConversation,
    });
  } catch (error) {
<<<<<<< HEAD
    console.error("❌ Error:", error);
=======
>>>>>>> 2cd663c (Ready for Deployment with reduced errors)
    return res.status(500).json({
      success: false,
      message: "Failed to create group conversation",
    });
  }
};

export const getOrCreateConversation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { otherUserId } = req.body;

    if (!otherUserId) {
      return res.status(400).json({
        success: false,
        message: "Other user ID is required",
      });
    }

    if (otherUserId === userId) {
      return res.status(400).json({
        success: false,
        message: "Cannot create conversation with yourself",
      });
    }

    const [otherUserExists] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, otherUserId));

    if (!otherUserExists) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID (user does not exist)",
      });
    }

    const existingConversations = await db
      .select({ id: conversations.id })
      .from(conversationParticipants)
      .innerJoin(
        conversations,
        eq(conversationParticipants.conversationId, conversations.id)
      )
      .where(
        and(
          eq(conversations.type, "direct"),
          eq(conversationParticipants.userId, userId)
        )
      );

    for (const conv of existingConversations) {
      const [hasOtherUser] = await db
        .select({ id: conversationParticipants.id })
        .from(conversationParticipants)
        .where(
          and(
            eq(conversationParticipants.conversationId, conv.id),
            eq(conversationParticipants.userId, otherUserId)
          )
        );

      if (hasOtherUser) {
        const [otherUser] = await db
          .select({
            id: users.id,
            name: users.name,
            profileUrl: users.profileUrl,
          })
          .from(users)
          .where(eq(users.id, otherUserId));

        return res.status(200).json({
          success: true,
          conversation: {
            id: conv.id,
            type: "direct",
            otherUser,
          },
        });
      }
    }

    const [newConversation] = await db
      .insert(conversations)
      .values({
        universityId: req.user.universityId,
        type: "direct",
        createdBy: userId,
      })
      .returning();

    await db.insert(conversationParticipants).values([
      {
        conversationId: newConversation.id,
        userId: userId,
      },
      {
        conversationId: newConversation.id,
        userId: otherUserId,
      },
    ]);

    const [otherUser] = await db
      .select({
        id: users.id,
        name: users.name,
        profileUrl: users.profileUrl,
      })
      .from(users)
      .where(eq(users.id, otherUserId));

    await deleteCachedDataByPattern(`conversations:*:user:${userId}`);
    await deleteCachedDataByPattern(`conversations:*:user:${otherUserId}`);

    return res.status(201).json({
      success: true,
      conversation: {
        ...newConversation,
        otherUser,
      },
    });
  } catch (error) {
<<<<<<< HEAD
    console.error("❌ Error:", error);
=======
>>>>>>> 2cd663c (Ready for Deployment with reduced errors)
    return res.status(500).json({
      success: false,
      message: "Failed to get or create conversation",
    });
  }
};

export const getMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    const cacheKey = `messages:${conversationId}:page:${pageNum}:limit:${limitNum}`;
    
    const cachedData = await getCachedData(cacheKey);
    if (cachedData) {
      return res.status(200).json({
        success: true,
        ...cachedData,
        cached: true,
      });
    }

    const [participant] = await db
      .select()
      .from(conversationParticipants)
      .where(
        and(
          eq(conversationParticipants.conversationId, conversationId),
          eq(conversationParticipants.userId, userId)
        )
      );

    if (!participant) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this conversation",
      });
    }

    const [{ count: totalCount }] = await db
      .select({ count: sql`COUNT(*)::int` })
      .from(messages)
      .where(eq(messages.conversationId, conversationId));

    const conversationMessages = await db
      .select({
        id: messages.id,
        conversationId: messages.conversationId,
        content: messages.content,
        type: messages.type,
        fileUrl: messages.fileUrl,
        fileName: messages.fileName,
        fileSize: messages.fileSize,
        isEdited: messages.isEdited,
        isDeleted: messages.isDeleted,
        replyToId: messages.replyToId,
        createdAt: messages.createdAt,
        updatedAt: messages.updatedAt,
        sender: {
          id: users.id,
          name: users.name,
          profileUrl: users.profileUrl,
        },
      })
      .from(messages)
      .leftJoin(users, eq(messages.senderId, users.id))
      .where(eq(messages.conversationId, conversationId))
      .orderBy(desc(messages.createdAt))
      .limit(limitNum)
      .offset(offset);

    const messageIds = conversationMessages.map(m => m.id);
    
    let readReceipts = [];
    if (messageIds.length > 0) {
      readReceipts = await db
        .select({
          messageId: messageReadReceipts.messageId,
          user: {
            id: users.id,
            name: users.name,
            profileUrl: users.profileUrl,
          },
          readAt: messageReadReceipts.readAt,
        })
        .from(messageReadReceipts)
        .leftJoin(users, eq(messageReadReceipts.userId, users.id))
        .where(sql`${messageReadReceipts.messageId} IN (${sql.join(messageIds, sql`, `)})`);
    }

    const readReceiptsMap = {};
    readReceipts.forEach(receipt => {
      if (!readReceiptsMap[receipt.messageId]) {
        readReceiptsMap[receipt.messageId] = [];
      }
      readReceiptsMap[receipt.messageId].push({
        userId: receipt.user.id,
        userName: receipt.user.name,
        userProfileUrl: receipt.user.profileUrl,
        readAt: receipt.readAt,
      });
    });

    const messagesWithReceipts = conversationMessages.map(msg => ({
      ...msg,
      readBy: readReceiptsMap[msg.id] || [],
    }));

    const result = {
      messages: messagesWithReceipts.reverse(), // Reverse to show oldest first
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalCount / limitNum),
        totalItems: totalCount,
        itemsPerPage: limitNum,
        hasNextPage: pageNum < Math.ceil(totalCount / limitNum),
        hasPrevPage: pageNum > 1,
      },
    };

    await setCachedData(cacheKey, result, 60);

    return res.status(200).json({
      success: true,
      ...result,
      cached: false,
    });
  } catch (error) {
<<<<<<< HEAD
    console.error("❌ Error:", error);
=======
>>>>>>> 2cd663c (Ready for Deployment with reduced errors)
    return res.status(500).json({
      success: false,
      message: "Failed to fetch messages",
    });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params;
    const { content, type = "text", replyToId } = req.body;
    const file = req.file;

    const [participant] = await db
      .select()
      .from(conversationParticipants)
      .where(
        and(
          eq(conversationParticipants.conversationId, conversationId),
          eq(conversationParticipants.userId, userId)
        )
      );

    if (!participant) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to send messages in this conversation",
      });
    }

    let fileUrl = null;
    let fileName = null;
    let fileSize = null;

    if (file) {
      const upload = await cloudinary.uploader.upload(file.path, {
        resource_type: "auto",
        folder: "messages",
      });
      fileUrl = upload.secure_url;
      fileName = file.originalname;
      fileSize = file.size;
    }

    const [newMessage] = await db
      .insert(messages)
      .values({
        conversationId,
        senderId: userId,
        content: content || "",
        type,
        fileUrl,
        fileName,
        fileSize,
        replyToId: replyToId || null,
      })
      .returning();

    await db
      .update(conversations)
      .set({ updatedAt: new Date() })
      .where(eq(conversations.id, conversationId));

    const [sender] = await db
      .select({
        id: users.id,
        name: users.name,
        profileUrl: users.profileUrl,
      })
      .from(users)
      .where(eq(users.id, userId));

    const formattedMessage = {
      id: newMessage.id,
      conversationId: newMessage.conversationId,
      content: newMessage.content,
      type: newMessage.type,
      fileUrl: newMessage.fileUrl || null,
      fileName: newMessage.fileName || null,
      fileSize: newMessage.fileSize || null,
      isEdited: newMessage.isEdited || false,
      isDeleted: newMessage.isDeleted || false,
      replyToId: newMessage.replyToId || null,
      createdAt: newMessage.createdAt,
      updatedAt: newMessage.updatedAt,
      sender,
      readBy: [],
    };

    const io = getIO();
    io.to(`conversation_${conversationId}`).emit("new_message", formattedMessage);

    await deleteCachedDataByPattern(`messages:${conversationId}:*`);
    await deleteCachedDataByPattern(`conversations:*`);

    return res.status(201).json({
      success: true,
      message: formattedMessage,
    });
  } catch (error) {
<<<<<<< HEAD
    console.error("❌ Error:", error);
=======
>>>>>>> 2cd663c (Ready for Deployment with reduced errors)
    return res.status(500).json({
      success: false,
      message: "Failed to send message",
    });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params;

    const [userInfo] = await db
      .select({
        id: users.id,
        name: users.name,
        profileUrl: users.profileUrl,
      })
      .from(users)
      .where(eq(users.id, userId));

    const unreadMessages = await db
      .select({ 
        id: messages.id,
        senderId: messages.senderId,
      })
      .from(messages)
      .leftJoin(
        messageReadReceipts,
        and(
          eq(messageReadReceipts.messageId, messages.id),
          eq(messageReadReceipts.userId, userId)
        )
      )
      .where(
        and(
          eq(messages.conversationId, conversationId),
          sql`${messages.senderId} != ${userId}`,
          sql`${messageReadReceipts.id} IS NULL`
        )
      );

    if (unreadMessages.length > 0) {
      const now = new Date();
      await db.insert(messageReadReceipts).values(
        unreadMessages.map((msg) => ({
          messageId: msg.id,
          userId,
          readAt: now,
        }))
      );

      const io = getIO();
      unreadMessages.forEach((msg) => {
        io.to(`conversation_${conversationId}`).emit("message_read", {
          messageId: msg.id,
          conversationId,
          readBy: {
            userId: userInfo.id,
            userName: userInfo.name,
            userProfileUrl: userInfo.profileUrl,
            readAt: now,
          },
        });
      });
    }

    await db
      .update(conversationParticipants)
      .set({ lastReadAt: new Date() })
      .where(
        and(
          eq(conversationParticipants.conversationId, conversationId),
          eq(conversationParticipants.userId, userId)
        )
      );

    await deleteCachedDataByPattern(`messages:${conversationId}:*`);
    await deleteCachedDataByPattern(`conversations:*`);

    return res.status(200).json({
      success: true,
      message: "Messages marked as read",
    });
  } catch (error) {
<<<<<<< HEAD
    console.error("❌ Error:", error);
=======
>>>>>>> 2cd663c (Ready for Deployment with reduced errors)
    return res.status(500).json({
      success: false,
      message: "Failed to mark messages as read",
    });
  }
};

export const editMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { messageId } = req.params;
    const { content } = req.body;

    const [message] = await db
      .select()
      .from(messages)
      .where(eq(messages.id, messageId));

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    if (message.senderId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to edit this message",
      });
    }

    const [updatedMessage] = await db
      .update(messages)
      .set({
        content,
        isEdited: true,
        updatedAt: new Date(),
      })
      .where(eq(messages.id, messageId))
      .returning();

    const [sender] = await db
      .select({
        id: users.id,
        name: users.name,
        profileUrl: users.profileUrl,
      })
      .from(users)
      .where(eq(users.id, updatedMessage.senderId));

    const formattedMessage = {
      id: updatedMessage.id,
      conversationId: updatedMessage.conversationId,
      content: updatedMessage.content,
      type: updatedMessage.type,
      fileUrl: updatedMessage.fileUrl || null,
      fileName: updatedMessage.fileName || null,
      fileSize: updatedMessage.fileSize || null,
      isEdited: updatedMessage.isEdited,
      isDeleted: updatedMessage.isDeleted || false,
      replyToId: updatedMessage.replyToId || null,
      createdAt: updatedMessage.createdAt,
      updatedAt: updatedMessage.updatedAt,
      sender,
    };

    const io = getIO();
    io.to(`conversation_${message.conversationId}`).emit("message_edited", formattedMessage);

    await deleteCachedDataByPattern(`messages:${message.conversationId}:*`);

    return res.status(200).json({
      success: true,
      message: formattedMessage,
    });
  } catch (error) {
<<<<<<< HEAD
    console.error("❌ Error:", error);
=======
>>>>>>> 2cd663c (Ready for Deployment with reduced errors)
    return res.status(500).json({
      success: false,
      message: "Failed to edit message",
    });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { messageId } = req.params;

    const [message] = await db
      .select()
      .from(messages)
      .where(eq(messages.id, messageId));

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    if (message.senderId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this message",
      });
    }

    await db
      .update(messages)
      .set({
        isDeleted: true,
        content: "This message was deleted",
        updatedAt: new Date(),
      })
      .where(eq(messages.id, messageId));

    const io = getIO();
    io.to(`conversation_${message.conversationId}`).emit("message_deleted", {
      messageId,
    });

    await deleteCachedDataByPattern(`messages:${message.conversationId}:*`);

    return res.status(200).json({
      success: true,
      message: "Message deleted",
    });
  } catch (error) {
<<<<<<< HEAD
    console.error("❌ Error:", error);
=======
>>>>>>> 2cd663c (Ready for Deployment with reduced errors)
    return res.status(500).json({
      success: false,
      message: "Failed to delete message",
    });
  }
};

export const searchConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    const { q = "", page = 1, limit = 50 } = req.query;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    const cacheKey = `search:conversations:${q}:page:${pageNum}:limit:${limitNum}:user:${userId}`;
    
    const cachedData = await getCachedData(cacheKey);
    if (cachedData) {
      return res.status(200).json({
        success: true,
        ...cachedData,
        cached: true,
      });
    }

    const [{ count: usersCount }] = await db
      .select({ count: sql`COUNT(*)::int` })
      .from(users)
      .where(
        and(
          sql`${users.id} != ${userId}`,
          eq(users.universityId, req.user.universityId),
          q ? or(
            ilike(users.name, `%${q}%`),
            ilike(users.email, `%${q}%`)
          ) : sql`true`
        )
      );

    const searchedUsers = await db
      .select({
        id: users.id,
        name: users.name,
        profileUrl: users.profileUrl,
        email: users.email,
      })
      .from(users)
      .where(
        and(
          sql`${users.id} != ${userId}`,
          eq(users.universityId, req.user.universityId),
          q ? or(
            ilike(users.name, `%${q}%`),
            ilike(users.email, `%${q}%`)
          ) : sql`true`
        )
      )
      .limit(limitNum)
      .offset(offset);

    const [{ count: groupsCount }] = await db
      .select({ count: sql`COUNT(*)::int` })
      .from(groups)
      .where(
        and(
          eq(groups.universityId, req.user.universityId),
          q ? ilike(groups.name, `%${q}%`) : sql`true`
        )
      );

    const searchedGroups = await db
      .select({
        id: groups.id,
        name: groups.name,
        type: groups.type,
        createdBy: groups.createdBy,
      })
      .from(groups)
      .where(
        and(
          eq(groups.universityId, req.user.universityId),
          q ? ilike(groups.name, `%${q}%`) : sql`true`
        )
      )
      .limit(limitNum)
      .offset(offset);

    const formattedGroups = searchedGroups.map(group => ({
      id: group.id,
      name: group.name,
      description: group.type || '',
      avatarUrl: null,
    }));

    const result = {
      users: searchedUsers,
      groups: formattedGroups,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.max(
          Math.ceil(usersCount / limitNum),
          Math.ceil(groupsCount / limitNum)
        ),
        totalItems: usersCount + groupsCount,
        itemsPerPage: limitNum,
        hasNextPage: pageNum < Math.max(
          Math.ceil(usersCount / limitNum),
          Math.ceil(groupsCount / limitNum)
        ),
        hasPrevPage: pageNum > 1,
      },
    };

    await setCachedData(cacheKey, result, 120);

    return res.status(200).json({
      success: true,
      ...result,
      cached: false,
    });
  } catch (error) {
<<<<<<< HEAD
    console.error("❌ Error:", error);
=======
>>>>>>> 2cd663c (Ready for Deployment with reduced errors)
    return res.status(500).json({
      success: false,
      message: "Failed to search",
    });
  }
};