import { db } from "../config/db.js";
import {
  emails,
  emailRecipients,
  emailAttachments,
  emailReplies,
  users,
  groupMembers,
  groups
} from "../database/schema.js";
import { eq, and, or, desc, sql, ilike } from "drizzle-orm";
import cloudinary from "../config/cloudinary.js";
import { extractPublicId } from "../utils/extractPublicId.js";
import { getCachedData, setCachedData, deleteCachedDataByPattern } from "../config/redis.js";

export const composeEmail = async (req, res) => {
  try {
    const { subject, content, type, recipients, groupRecipients, isImportant } = req.body;
    const files = req.files || [];
    const senderId = req.user.id;
    const universityId = req.user.universityId;

    if (!subject || !content) {
      return res.status(400).json({
        success: false,
        message: "Subject and content are required",
      });
    }

    let recipientIds = [];

    if (recipients) {
      const individualRecipients = Array.isArray(recipients)
        ? recipients
        : JSON.parse(recipients);
      recipientIds.push(...individualRecipients);
    }

    if (groupRecipients) {
      const groupIds = Array.isArray(groupRecipients)
        ? groupRecipients
        : JSON.parse(groupRecipients);

      if (groupIds.length > 0) {
        const members = await db
          .select({ userId: groupMembers.userId })
          .from(groupMembers)
          .where(sql`${groupMembers.groupId} IN (${sql.join(groupIds, sql`, `)})`);

        recipientIds.push(...members.map(m => m.userId));
      }
    }

    recipientIds = [...new Set(recipientIds)].filter(id => id !== senderId);

    if (recipientIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one recipient is required",
      });
    }

    const [newEmail] = await db
      .insert(emails)
      .values({
        universityId,
        senderId,
        subject,
        content,
        type: type || "General",
        isImportant: isImportant === true || isImportant === "true",
        updatedAt: sql`now()`,
      })
      .returning();

    await db.insert(emailRecipients).values(
      recipientIds.map(recipientId => ({
        emailId: newEmail.id,
        recipientId,
      }))
    );

    const newAttachments = [];

    for (const file of files) {
      const [attachmentRow] = await db
        .insert(emailAttachments)
        .values({
          emailId: newEmail.id,
          fileName: file.originalname,
          fileUrl: file.path,
          fileSize: file.size,
          mimeType: file.mimetype,
        })
        .returning();

      newAttachments.push(attachmentRow);
    }

    for (const recipientId of recipientIds) {
      await deleteCachedDataByPattern(`emails:*:user:${recipientId}`);
    }

    return res.status(201).json({
      success: true,
      message: "Email sent successfully",
      email: newEmail,
      attachments: newAttachments,
      recipientCount: recipientIds.length,
    });

  } catch (error) {
    console.error("❌ Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send email",
    });
  }
};

export const getEmails = async (req, res) => {
  try {
    const userId = req.user.id;
    const { filter, page = 1, limit = 20 } = req.query;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    const cacheKey = `emails:page:${pageNum}:limit:${limitNum}:filter:${filter || 'all'}:user:${userId}`;
    
    const cachedData = await getCachedData(cacheKey);
    if (cachedData) {
      return res.status(200).json({
        success: true,
        ...cachedData,
        cached: true,
      });
    }

    let conditions = [eq(emailRecipients.recipientId, userId)];

    if (filter === "important") {
      conditions.push(eq(emails.isImportant, true));
    } else if (filter === "unread") {
      conditions.push(eq(emailRecipients.isRead, false));
    }

    const [{ count: totalCount }] = await db
      .select({ count: sql`COUNT(*)::int` })
      .from(emailRecipients)
      .leftJoin(emails, eq(emailRecipients.emailId, emails.id))
      .where(and(...conditions));

    const userEmails = await db
      .select({
        id: emails.id,
        subject: emails.subject,
        content: emails.content,
        type: emails.type,
        isImportant: emails.isImportant,
        createdAt: emails.createdAt,
        isRead: emailRecipients.isRead,
        isStarred: emailRecipients.isStarred,
        readAt: emailRecipients.readAt,
        sender: {
          id: users.id,
          name: users.name,
          email: users.email,
          profileUrl: users.profileUrl,
        },
        attachmentCount: sql`(
          SELECT COUNT(*)::int 
          FROM ${emailAttachments} 
          WHERE ${emailAttachments.emailId} = ${emails.id}
        )`.as("attachment_count"),
        replyCount: sql`(
          SELECT COUNT(*)::int 
          FROM ${emailReplies} 
          WHERE ${emailReplies.emailId} = ${emails.id}
        )`.as("reply_count"),
      })
      .from(emailRecipients)
      .leftJoin(emails, eq(emailRecipients.emailId, emails.id))
      .leftJoin(users, eq(emails.senderId, users.id))
      .where(and(...conditions))
      .orderBy(desc(emails.createdAt))
      .limit(limitNum)
      .offset(offset);

    const result = {
      emails: userEmails,
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
    console.error("❌ Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch emails",
    });
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const cacheKey = `unreadcount:user:${userId}`;
    
    const cachedData = await getCachedData(cacheKey);
    if (cachedData) {
      return res.status(200).json({
        success: true,
        ...cachedData,
        cached: true,
      });
    }

    const [result] = await db
      .select({
        total: sql`COUNT(*)::int`.as("total"),
        important: sql`COUNT(*) FILTER (WHERE ${emails.isImportant} = true)::int`.as(
          "important"
        ),
      })
      .from(emailRecipients)
      .leftJoin(emails, eq(emailRecipients.emailId, emails.id))
      .where(
        and(
          eq(emailRecipients.recipientId, userId),
          eq(emailRecipients.isRead, false)
        )
      );

    const data = {
      unreadCount: result.total || 0,
      importantUnreadCount: result.important || 0,
    };

    await setCachedData(cacheKey, data, 60);

    return res.status(200).json({
      success: true,
      ...data,
      cached: false,
    });
  } catch (error) {
    console.error("❌ Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch unread count",
    });
  }
};

export const getEmailsByType = async (req, res) => {
  try {
    const userId = req.user.id;
    const type = req.params.type || req.query.type;
    const { page = 1, limit = 20 } = req.query;

    if (!type) {
      return res.status(400).json({
        success: false,
        message: "Email type is required",
      });
    }
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    const cacheKey = `emails:type:${type}:page:${pageNum}:limit:${limitNum}:user:${userId}`;
    
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
      .from(emailRecipients)
      .leftJoin(emails, eq(emailRecipients.emailId, emails.id))
      .where(
        and(eq(emailRecipients.recipientId, userId), eq(emails.type, type))
      );

    const userEmails = await db
      .select({
        id: emails.id,
        subject: emails.subject,
        content: emails.content,
        type: emails.type,
        isImportant: emails.isImportant,
        createdAt: emails.createdAt,
        isRead: emailRecipients.isRead,
        isStarred: emailRecipients.isStarred,
        sender: {
          id: users.id,
          name: users.name,
          email: users.email,
          profileUrl: users.profileUrl,
        },
        attachmentCount: sql`(
          SELECT COUNT(*)::int 
          FROM ${emailAttachments} 
          WHERE ${emailAttachments.emailId} = ${emails.id}
        )`.as("attachment_count"),
        replyCount: sql`(
          SELECT COUNT(*)::int 
          FROM ${emailReplies} 
          WHERE ${emailReplies.emailId} = ${emails.id}
        )`.as("reply_count"),
      })
      .from(emailRecipients)
      .leftJoin(emails, eq(emailRecipients.emailId, emails.id))
      .leftJoin(users, eq(emails.senderId, users.id))
      .where(
        and(eq(emailRecipients.recipientId, userId), eq(emails.type, type))
      )
      .orderBy(desc(emails.createdAt))
      .limit(limitNum)
      .offset(offset);

    const result = {
      emails: userEmails,
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
    console.error("❌ Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch emails",
    });
  }
};

export const getEmailById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const cacheKey = `email:${id}:user:${userId}`;
    
    const cachedData = await getCachedData(cacheKey);
    if (cachedData) {
      return res.status(200).json({
        success: true,
        ...cachedData,
        cached: true,
      });
    }

    const [email] = await db
      .select({
        id: emails.id,
        subject: emails.subject,
        content: emails.content,
        type: emails.type,
        isImportant: emails.isImportant,
        createdAt: emails.createdAt,
        isRead: emailRecipients.isRead,
        isStarred: emailRecipients.isStarred,
        sender: {
          id: users.id,
          name: users.name,
          email: users.email,
          profileUrl: users.profileUrl,
        },
      })
      .from(emailRecipients)
      .leftJoin(emails, eq(emailRecipients.emailId, emails.id))
      .leftJoin(users, eq(emails.senderId, users.id))
      .where(
        and(eq(emailRecipients.recipientId, userId), eq(emails.id, id))
      );

    if (!email) {
      return res.status(404).json({
        success: false,
        message: "Email not found",
      });
    }

    const attachments = await db
      .select()
      .from(emailAttachments)
      .where(eq(emailAttachments.emailId, id));

    const replies = await db
      .select({
        id: emailReplies.id,
        content: emailReplies.content,
        createdAt: emailReplies.createdAt,
        sender: {
          id: users.id,
          name: users.name,
          profileUrl: users.profileUrl,
        },
      })
      .from(emailReplies)
      .leftJoin(users, eq(emailReplies.senderId, users.id))
      .where(eq(emailReplies.emailId, id))
      .orderBy(emailReplies.createdAt);

    const result = {
      email: {
        ...email,
        attachments,
        replies,
      },
    };

    await setCachedData(cacheKey, result, 300);

    return res.status(200).json({
      success: true,
      ...result,
      cached: false,
    });
  } catch (error) {
    console.error("❌ Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch email",
    });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    await db
      .update(emailRecipients)
      .set({
        isRead: true,
        readAt: new Date(),
      })
      .where(
        and(eq(emailRecipients.emailId, id), eq(emailRecipients.recipientId, userId))
      );

    await deleteCachedDataByPattern(`emails:*:user:${userId}`);
    await deleteCachedDataByPattern(`email:${id}:user:${userId}`);
    await deleteCachedDataByPattern(`unreadcount:user:${userId}`);

    return res.status(200).json({
      success: true,
      message: "Email marked as read",
    });
  } catch (error) {
    console.error("❌ Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to mark email as read",
    });
  }
};

export const toggleStarred = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const [current] = await db
      .select({ isStarred: emailRecipients.isStarred })
      .from(emailRecipients)
      .where(
        and(eq(emailRecipients.emailId, id), eq(emailRecipients.recipientId, userId))
      );

    if (!current) {
      return res.status(404).json({
        success: false,
        message: "Email not found",
      });
    }

    await db
      .update(emailRecipients)
      .set({
        isStarred: !current.isStarred,
      })
      .where(
        and(eq(emailRecipients.emailId, id), eq(emailRecipients.recipientId, userId))
      );

    await deleteCachedDataByPattern(`emails:*:user:${userId}`);
    await deleteCachedDataByPattern(`email:${id}:user:${userId}`);

    return res.status(200).json({
      success: true,
      message: current.isStarred ? "Email unstarred" : "Email starred",
      isStarred: !current.isStarred,
    });
  } catch (error) {
    console.error("❌ Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to toggle starred",
    });
  }
};

export const toggleImportant = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const [current] = await db
      .select({
        isImportant: emails.isImportant,
        senderId: emails.senderId,
      })
      .from(emails)
      .where(eq(emails.id, id));

    if (!current) {
      return res.status(404).json({
        success: false,
        message: "Email not found",
      });
    }

    if (current.senderId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Only sender can mark email as important",
      });
    }

    await db
      .update(emails)
      .set({
        isImportant: !current.isImportant,
      })
      .where(eq(emails.id, id));

    const recipients = await db
      .select({ recipientId: emailRecipients.recipientId })
      .from(emailRecipients)
      .where(eq(emailRecipients.emailId, id));

    for (const recipient of recipients) {
      await deleteCachedDataByPattern(`emails:*:user:${recipient.recipientId}`);
      await deleteCachedDataByPattern(`email:${id}:user:${recipient.recipientId}`);
      await deleteCachedDataByPattern(`unreadcount:user:${recipient.recipientId}`);
    }

    return res.status(200).json({
      success: true,
      message: current.isImportant
        ? "Email unmarked as important"
        : "Email marked as important",
      isImportant: !current.isImportant,
    });
  } catch (error) {
    console.error("❌ Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to toggle important",
    });
  }
};

export const replyToEmail = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: "Content is required",
      });
    }

    const [originalEmail] = await db
      .select()
      .from(emails)
      .where(eq(emails.id, id));

    if (!originalEmail) {
      return res.status(404).json({
        success: false,
        message: "Email not found",
      });
    }

    const [access] = await db
      .select()
      .from(emailRecipients)
      .where(
        and(
          eq(emailRecipients.emailId, id),
          eq(emailRecipients.recipientId, userId)
        )
      );

    const isSender = originalEmail.senderId === userId;

    if (!access && !isSender) {
      return res.status(403).json({
        success: false,
        message: "You don't have access to reply to this email",
      });
    }

    const [reply] = await db
      .insert(emailReplies)
      .values({
        emailId: id,
        senderId: userId,
        content,
      })
      .returning();

    await db
      .update(emailRecipients)
      .set({
        isRead: false,
        readAt: null,
      })
      .where(
        and(
          eq(emailRecipients.emailId, id),
          sql`${emailRecipients.recipientId} != ${userId}`
        )
      );

    if (!isSender) {
      const [senderAsRecipient] = await db
        .select()
        .from(emailRecipients)
        .where(
          and(
            eq(emailRecipients.emailId, id),
            eq(emailRecipients.recipientId, originalEmail.senderId)
          )
        );

      if (!senderAsRecipient) {
        await db.insert(emailRecipients).values({
          emailId: id,
          recipientId: originalEmail.senderId,
          isRead: false,
        });
      } else {
        await db
          .update(emailRecipients)
          .set({
            isRead: false,
            readAt: null,
          })
          .where(
            and(
              eq(emailRecipients.emailId, id),
              eq(emailRecipients.recipientId, originalEmail.senderId)
            )
          );
      }
    }

    const [replyWithSender] = await db
      .select({
        id: emailReplies.id,
        content: emailReplies.content,
        createdAt: emailReplies.createdAt,
        sender: {
          id: users.id,
          name: users.name,
          profileUrl: users.profileUrl,
        },
      })
      .from(emailReplies)
      .leftJoin(users, eq(emailReplies.senderId, users.id))
      .where(eq(emailReplies.id, reply.id));

    const recipients = await db
      .select({ recipientId: emailRecipients.recipientId })
      .from(emailRecipients)
      .where(eq(emailRecipients.emailId, id));

    for (const recipient of recipients) {
      await deleteCachedDataByPattern(`emails:*:user:${recipient.recipientId}`);
      await deleteCachedDataByPattern(`email:${id}:user:${recipient.recipientId}`);
      await deleteCachedDataByPattern(`unreadcount:user:${recipient.recipientId}`);
    }

    return res.status(201).json({
      success: true,
      message: "Reply sent successfully",
      reply: replyWithSender,
    });
  } catch (error) {
    console.error("❌ Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send reply",
    });
  }
};

export const deleteEmail = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    await db.transaction(async (tx) => {
      const [emailRecipient] = await tx
        .select()
        .from(emailRecipients)
        .where(
          and(
            eq(emailRecipients.emailId, id),
            eq(emailRecipients.recipientId, userId)
          )
        );

      if (!emailRecipient) {
        throw new Error("EMAIL_NOT_FOUND");
      }

      const attachments = await tx
        .select()
        .from(emailAttachments)
        .where(eq(emailAttachments.emailId, id));

      for (const attachment of attachments) {
        const publicId = extractPublicId(attachment.fileUrl);
        await cloudinary.uploader.destroy(publicId, {
          resource_type: "auto",
        });
      }

      await tx
        .delete(emailRecipients)
        .where(
          and(
            eq(emailRecipients.emailId, id),
            eq(emailRecipients.recipientId, userId)
          )
        );
    });

    await deleteCachedDataByPattern(`emails:*:user:${userId}`);
    await deleteCachedDataByPattern(`email:${id}:user:${userId}`);
    await deleteCachedDataByPattern(`unreadcount:user:${userId}`);

    return res.status(200).json({
      success: true,
      message: "Email deleted successfully",
    });
  } catch (error) {
    console.error("❌ Error:", error);

    if (error.message === "EMAIL_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Email not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const searchEmails = async (req, res) => {
  try {
    const userId = req.user.id;
    const { q, page = 1, limit = 20 } = req.query;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const cacheKey = `search:emails:${q}:page:${pageNum}:limit:${limitNum}:user:${userId}`;
    
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
      .from(emailRecipients)
      .leftJoin(emails, eq(emailRecipients.emailId, emails.id))
      .leftJoin(users, eq(emails.senderId, users.id))
      .where(
        and(
          eq(emailRecipients.recipientId, userId),
          or(
            ilike(emails.subject, `%${q}%`),
            ilike(emails.content, `%${q}%`),
            ilike(users.name, `%${q}%`)
          )
        )
      );

    const searchResults = await db
      .select({
        id: emails.id,
        subject: emails.subject,
        content: emails.content,
        type: emails.type,
        isImportant: emails.isImportant,
        createdAt: emails.createdAt,
        isRead: emailRecipients.isRead,
        isStarred: emailRecipients.isStarred,
        sender: {
          id: users.id,
          name: users.name,
          email: users.email,
          profileUrl: users.profileUrl,
        },
        attachmentCount: sql`(
          SELECT COUNT(*)::int 
          FROM ${emailAttachments} 
          WHERE ${emailAttachments.emailId} = ${emails.id}
        )`.as("attachment_count"),
      })
      .from(emailRecipients)
      .leftJoin(emails, eq(emailRecipients.emailId, emails.id))
      .leftJoin(users, eq(emails.senderId, users.id))
      .where(
        and(
          eq(emailRecipients.recipientId, userId),
          or(
            ilike(emails.subject, `%${q}%`),
            ilike(emails.content, `%${q}%`),
            ilike(users.name, `%${q}%`)
          )
        )
      )
      .orderBy(desc(emails.createdAt))
      .limit(limitNum)
      .offset(offset);

    const result = {
      emails: searchResults,
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
    console.error("❌ Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to search emails",
    });
  }
};

export const getGroupsForEmail = async (req, res) => {
  try {
    const userId = req.user.id;

    const cacheKey = `emailgroups:user:${userId}`;
    
    const cachedData = await getCachedData(cacheKey);
    if (cachedData) {
      return res.status(200).json({
        success: true,
        ...cachedData,
        cached: true,
      });
    }

    const userGroups = await db
      .select({
        id: groups.id,
        name: groups.name,
        type: groups.type,
      })
      .from(groupMembers)
      .leftJoin(groups, eq(groupMembers.groupId, groups.id))
      .where(eq(groupMembers.userId, userId));

    const result = { groups: userGroups };

    await setCachedData(cacheKey, result, 300);

    return res.status(200).json({
      success: true,
      ...result,
      cached: false,
    });
  } catch (error) {
    console.error("❌ Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch groups",
    });
  }
};

export const markAsUnread = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    await db
      .update(emailRecipients)
      .set({
        isRead: false,
        readAt: null,
      })
      .where(
        and(
          eq(emailRecipients.emailId, id),
          eq(emailRecipients.recipientId, userId)
        )
      );

    await deleteCachedDataByPattern(`emails:*:user:${userId}`);
    await deleteCachedDataByPattern(`email:${id}:user:${userId}`);
    await deleteCachedDataByPattern(`unreadcount:user:${userId}`);

    return res.status(200).json({
      success: true,
      message: "Email marked as unread",
    });
  } catch (error) {
    console.error("❌ Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to mark email as unread",
    });
  }
};

export const toggleStar = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const email = await Email.findOne({
      where: { id, userId }
    });

    if (!email) {
      return res.status(404).json({ message: "Email not found" });
    }

    email.isStarred = !email.isStarred;
    await email.save();

    return res.status(200).json({
      message: `Email ${email.isStarred ? "starred" : "unstarred"} successfully`,
      isStarred: email.isStarred
    });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ message: "Failed to toggle star" });
  }
};

