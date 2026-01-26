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
// Compose new email
export const composeEmail = async (req, res) => {
  try {
    const { subject, content, type, recipients, groupRecipients, isImportant } = req.body;
    const files = req.files || []; // ✅ declare ONCE
    const senderId = req.user.id;
    const universityId = req.user.universityId;

    if (!subject || !content) {
      return res.status(400).json({
        success: false,
        message: "Subject and content are required",
      });
    }

    // 🔹 Parse recipients
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

      for (const groupId of groupIds) {
        const members = await db
          .select({ userId: groupMembers.userId })
          .from(groupMembers)
          .where(eq(groupMembers.groupId, groupId));

        recipientIds.push(...members.map(m => m.userId));
      }
    }

    // 🔹 Remove duplicates + sender
    recipientIds = [...new Set(recipientIds)].filter(id => id !== senderId);

    if (recipientIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one recipient is required",
      });
    }

    // 🔹 Create email
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

    // 🔹 Add recipients
    await db.insert(emailRecipients).values(
      recipientIds.map(recipientId => ({
        emailId: newEmail.id,
        recipientId,
      }))
    );

    // 🔹 Attachments (CloudinaryStorage ✅)
    const newAttachments = [];

    for (const file of files) {
      const [attachmentRow] = await db
        .insert(emailAttachments)
        .values({
          emailId: newEmail.id,
          fileName: file.originalname,
          fileUrl: file.path,   // ✅ already Cloudinary URL
          fileSize: file.size,
          mimeType: file.mimetype,
        })
        .returning();

      newAttachments.push(attachmentRow);
    }

    return res.status(201).json({
      success: true,
      message: "Email sent successfully",
      email: newEmail,
      attachments: newAttachments,
      recipientCount: recipientIds.length,
    });

  } catch (error) {
    console.error("Compose email error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send email",
    });
  }
};

// Get all emails for user
export const getEmails = async (req, res) => {
  try {
    const userId = req.user.id;
    const { filter } = req.query; // all, important, unread

    let conditions = [eq(emailRecipients.recipientId, userId)];

    if (filter === "important") {
      conditions.push(eq(emails.isImportant, true));
    } else if (filter === "unread") {
      conditions.push(eq(emailRecipients.isRead, false));
    }

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
      .orderBy(desc(emails.createdAt));

    return res.status(200).json({
      success: true,
      emails: userEmails,
    });
  } catch (error) {
    console.error("Get emails error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch emails",
    });
  }
};

// Get unread count
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

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

    return res.status(200).json({
      success: true,
      unreadCount: result.total || 0,
      importantUnreadCount: result.important || 0,
    });
  } catch (error) {
    console.error("Get unread count error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch unread count",
    });
  }
};

// Get emails by type
export const getEmailsByType = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type } = req.params;

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
      .orderBy(desc(emails.createdAt));

    return res.status(200).json({
      success: true,
      emails: userEmails,
    });
  } catch (error) {
    console.error("Get emails by type error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch emails",
    });
  }
};

// Get email by ID
export const getEmailById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

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

    // Get attachments
    const attachments = await db
      .select()
      .from(emailAttachments)
      .where(eq(emailAttachments.emailId, id));

    // Get replies
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

    return res.status(200).json({
      success: true,
      email: {
        ...email,
        attachments,
        replies,
      },
    });
  } catch (error) {
    console.error("Get email error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch email",
    });
  }
};

// Mark as read
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
        and(
          eq(emailRecipients.emailId, id),
          eq(emailRecipients.recipientId, userId)
        )
      );

    return res.status(200).json({
      success: true,
      message: "Marked as read",
    });
  } catch (error) {
    console.error("Mark as read error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to mark as read",
    });
  }
};

// Mark as unread
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

    return res.status(200).json({
      success: true,
      message: "Marked as unread",
    });
  } catch (error) {
    console.error("Mark as unread error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to mark as unread",
    });
  }
};

// Toggle star
export const toggleStar = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const [current] = await db
      .select()
      .from(emailRecipients)
      .where(
        and(
          eq(emailRecipients.emailId, id),
          eq(emailRecipients.recipientId, userId)
        )
      );

    await db
      .update(emailRecipients)
      .set({
        isStarred: !current.isStarred,
      })
      .where(
        and(
          eq(emailRecipients.emailId, id),
          eq(emailRecipients.recipientId, userId)
        )
      );

    return res.status(200).json({
      success: true,
      isStarred: !current.isStarred,
    });
  } catch (error) {
    console.error("Toggle star error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to toggle star",
    });
  }
};

// Toggle important
export const toggleImportant = async (req, res) => {
  try {
    const { id } = req.params;

    const [current] = await db.select().from(emails).where(eq(emails.id, id));

    await db
      .update(emails)
      .set({
        isImportant: !current.isImportant,
      })
      .where(eq(emails.id, id));

    return res.status(200).json({
      success: true,
      isImportant: !current.isImportant,
    });
  } catch (error) {
    console.error("Toggle important error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to toggle important",
    });
  }
};

// Reply to email
// Reply to email (Better approach - thread-based)
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

    // Get the original email details
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

    // Check if user has access to this email (is a recipient or sender)
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

    // Create the reply
    const [reply] = await db
      .insert(emailReplies)
      .values({
        emailId: id,
        senderId: userId,
        content,
      })
      .returning();

    // Mark the email as unread for all recipients except the replier
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

    // If the original sender is not a recipient, create a recipient entry for them
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
        // Mark as unread for sender
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

    // Get sender info for response
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

    return res.status(201).json({
      success: true,
      message: "Reply sent successfully",
      reply: replyWithSender,
    });
  } catch (error) {
    console.error("Reply error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send reply",
    });
  }
};

// Delete email
export const deleteEmail = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    await db.transaction(async (tx) => {
      // 1️⃣ Check if email exists and user is recipient
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

      // 2️⃣ Get all attachments
      const attachments = await tx
        .select()
        .from(emailAttachments)
        .where(eq(emailAttachments.emailId, id));

      // 3️⃣ Delete from Cloudinary
      for (const attachment of attachments) {
        const publicId = extractPublicId(attachment.fileUrl);
        await cloudinary.uploader.destroy(publicId, {
          resource_type: "auto",
        });
      }

      // 4️⃣ Delete email recipient (this will cascade delete in DB if configured)
      await tx
        .delete(emailRecipients)
        .where(
          and(
            eq(emailRecipients.emailId, id),
            eq(emailRecipients.recipientId, userId)
          )
        );
    });

    return res.status(200).json({
      success: true,
      message: "Email deleted successfully",
    });
  } catch (error) {
    console.error("Delete email error:", error);

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

// Search emails
export const searchEmails = async (req, res) => {
  try {
    const userId = req.user.id;
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

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
      .orderBy(desc(emails.createdAt));

    return res.status(200).json({
      success: true,
      emails: searchResults,
    });
  } catch (error) {
    console.error("Search emails error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to search emails",
    });
  }
};

// Get all groups user is part of (for email compose)
export const getGroupsForEmail = async (req, res) => {
  try {
    const userId = req.user.id;

    const userGroups = await db
      .select({
        id: groups.id,
        name: groups.name,
        type: groups.type,
      })
      .from(groupMembers)
      .leftJoin(groups, eq(groupMembers.groupId, groups.id))
      .where(eq(groupMembers.userId, userId));

    return res.status(200).json({
      success: true,
      groups: userGroups,
    });
  } catch (error) {
    console.error("Get groups error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch groups",
    });
  }
};

