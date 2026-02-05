import {
    pgTable,
    uuid,
    varchar,
    text,
    timestamp,
    pgEnum,
    uniqueIndex,
    boolean,
    integer
} from "drizzle-orm/pg-core";

/* ---------- ENUMS ---------- */
export const roleEnum = pgEnum("role", [
    "student",
    "professor",
    "admin",
    "UniversalAdmin"
]);

export const departmentEnum = pgEnum("department", [
    "Computer Science and Engineering",
    "Electronics and Communication",
    "Electrical Engineering",
    "Mechanical Engineering",
    "Smart Manufacturing",
    "Civil Engineering",
    "Chemical Engineering",
    "Design",
    "others",
]);

export const batchEnum = pgEnum("batch", [
    "2020",
    "2021",
    "2022",
    "2023",
    "2024",
    "2025",
]);

export const groupType = pgEnum('groupType', [
    "Academic",
    "Cultural",
    "Sports",
    "Technical",
    "Professional",
    "Special",
]);

export const mediaTypeEnum = pgEnum("mediaType", [
    'IMAGE',
    'VIDEO',
    'AUDIO',
    'DOCUMENT'
]);

export const roleTypeEnum  = pgEnum("roleType", [
    "admin",
    "member",
    "coordinator",
    "co-coordinator",
    "captain",
    "Mentor"
]);

export const emailTypeEnum = pgEnum("emailType", [
  "Academic",
  "Clubs",
  "Lost & Found",
  "Optional / Misc",
  "General"
]);

export const requestStatusEnum = pgEnum("requestStatus", ["pending", "approved", "rejected"]);

// Message-related enums
export const conversationTypeEnum = pgEnum("conversationType", ["direct", "group"]);
export const messageContentTypeEnum = pgEnum("messageContentType", ["text", "image", "video", "file"]);

export const universities = pgTable("universities", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 256 }).notNull(),
    domain: varchar("domain", { length: 256 }).unique(),
    city: varchar("city", { length: 256 }),
    state: varchar("state", { length: 256 }),
    logoUrl: text("logo_url"),

    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export const users = pgTable("users", {
    id: uuid("id").defaultRandom().primaryKey(),

    universityId: uuid("university_id")
        .references(() => universities.id, { onDelete: "cascade" }),

    name: varchar("name", { length: 256 }).notNull(),
    email: varchar("email", { length: 256 }).notNull().unique(),
    password : text("password").notNull(),
    role: roleEnum("role").notNull(),
    department: departmentEnum("department"),
    batch: batchEnum("batch"),

    profileUrl: text("profile_url"),

    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export const groups = pgTable("groups", {
    id : uuid("id").defaultRandom().primaryKey(),
    universityId : uuid("university_id")
        .notNull()
        .references(() => universities.id, {onDelete : 'cascade'}),
    name : varchar("name", {length : 256}),
    type : groupType(),
    createdBy : uuid("created_by")
        .notNull()
        .references(() => users.id, {onDelete : "cascade"}),
    createdAt : timestamp("created_at").defaultNow(),
    updatedAt : timestamp("updated_at").defaultNow()
});

export const posts = pgTable("posts", {
    id : uuid("id").defaultRandom().primaryKey(),
    universityId : uuid("university_id")
        .notNull()
        .references(() => universities.id, {onDelete:'cascade'}),
    authorId : uuid("author_id")
        .notNull()
        .references(() => users.id, {onDelete : 'cascade'}),
    groupId : uuid("group_id")
        .references(() => groups.id, {onDelete : "cascade"}),
    content : text("content"),
    createdAt : timestamp("created_at").defaultNow(),
    updatedAt : timestamp("updated_at").defaultNow()
});

export const postMedia = pgTable("postMedia", {
        id : uuid("id").defaultRandom().primaryKey(),
        postId : uuid("post_id")
            .notNull()
            .references(() => posts.id, {onDelete : "cascade"}),
        type :  mediaTypeEnum("type").notNull(),
        url : text("url"),
        createdAt : timestamp("created_at").defaultNow(),
        updatedAt : timestamp("updated_at").defaultNow()
});

export const groupMembers = pgTable("groupMembers", {
    id : uuid("id").defaultRandom().primaryKey(),
    groupId : uuid("group_id")
        .notNull()
        .references(() => groups.id, {onDelete : 'cascade'}),
    userId : uuid("user_id")
        .notNull()
        .references(() => users.id , {onDelete : 'cascade'}),
    role : roleTypeEnum("role").notNull(),
    joinedAt : timestamp("joined_at").defaultNow()
});

export const postLikes = pgTable(
  "postLikes",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    postId: uuid("postId")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),

    userId: uuid("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    createdAt: timestamp("createdAt").defaultNow(),
    updatedAt: timestamp("updatedAt").defaultNow(),
  },
  (table) => ({
    uniqueLike: uniqueIndex("unique_post_user_like").on(
      table.postId,
      table.userId
    ),
  })
);

export const postComments = pgTable("postComments", {
    id : uuid("id").defaultRandom().primaryKey(),
    postId : uuid("postId")
        .notNull()
        .references(() => posts.id, {onDelete : "cascade"}),
    authorId : uuid("authorId")
        .notNull()
        .references(() => users.id, {onDelete : "cascade"}),
    content : text("content").notNull(),
    createdAt : timestamp("createdAt").defaultNow(),
    updatedAt : timestamp("updatedAt").defaultNow()
});

export const emails = pgTable("emails", {
  id: uuid("id").defaultRandom().primaryKey(),
  universityId: uuid("university_id")
    .notNull()
    .references(() => universities.id, { onDelete: "cascade" }),
  senderId: uuid("sender_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  subject: varchar("subject", { length: 512 }).notNull(),
  content: text("content").notNull(),
  type: emailTypeEnum("type").notNull().default("General"),
  isImportant: boolean("is_important").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const emailRecipients = pgTable("emailRecipients", {
  id: uuid("id").defaultRandom().primaryKey(),
  emailId: uuid("email_id")
    .notNull()
    .references(() => emails.id, { onDelete: "cascade" }),
  recipientId: uuid("recipient_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  isRead: boolean("is_read").default(false),
  isStarred: boolean("is_starred").default(false),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const emailAttachments = pgTable("emailAttachments", {
  id: uuid("id").defaultRandom().primaryKey(),
  emailId: uuid("email_id")
    .notNull()
    .references(() => emails.id, { onDelete: "cascade" }),
  fileName: varchar("file_name", { length: 256 }).notNull(),
  fileUrl: text("file_url").notNull(),
  fileSize: integer("file_size"),
  mimeType: varchar("mime_type", { length: 128 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const emailReplies = pgTable("emailReplies", {
  id: uuid("id").defaultRandom().primaryKey(),
  emailId: uuid("email_id")
    .notNull()
    .references(() => emails.id, { onDelete: "cascade" }),
  senderId: uuid("sender_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Message Conversations table
export const conversations = pgTable("conversations", {
  id: uuid("id").defaultRandom().primaryKey(),
  universityId: uuid("university_id")
    .notNull()
    .references(() => universities.id, { onDelete: "cascade" }),
  type: conversationTypeEnum("type").notNull(), // ← FIXED: Use the enum defined above
  groupId: uuid("group_id").references(() => groups.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 256 }),
  avatarUrl: text("avatar_url"),
  createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Conversation Participants table
export const conversationParticipants = pgTable("conversationParticipants", {
  id: uuid("id").defaultRandom().primaryKey(),
  conversationId: uuid("conversation_id")
    .notNull()
    .references(() => conversations.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  lastReadAt: timestamp("last_read_at"),
  joinedAt: timestamp("joined_at").defaultNow(),
});

// Messages table
export const messages = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  conversationId: uuid("conversation_id")
    .notNull()
    .references(() => conversations.id, { onDelete: "cascade" }),
  senderId: uuid("sender_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  content: text("content"),
  type: messageContentTypeEnum("type").notNull().default("text"), // ← FIXED: Use the enum defined above
  fileUrl: text("file_url"),
  fileName: varchar("file_name", { length: 256 }),
  fileSize: integer("file_size"),
  isEdited: boolean("is_edited").default(false),
  isDeleted: boolean("is_deleted").default(false),
  replyToId: uuid("reply_to_id").references(() => messages.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Message Read Receipts table
export const messageReadReceipts = pgTable("messageReadReceipts", {
  id: uuid("id").defaultRandom().primaryKey(),
  messageId: uuid("message_id")
    .notNull()
    .references(() => messages.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  readAt: timestamp("read_at").defaultNow(),
});

export const pendingAdminRequests = pgTable("pendingAdminRequests", {
  id: uuid("id").defaultRandom().primaryKey(),

  universityId: uuid("university_id")
    .notNull()
    .references(() => universities.id, { onDelete: "cascade" }),

  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  requestedRole: varchar("requested_role", { length: 50 }).notNull(),

  status: requestStatusEnum("status")
    .notNull()
    .default("pending"),

  requestMessage: text("request_message"),
  responseMessage: text("response_message"),

  reviewedBy: uuid("reviewed_by")
    .references(() => users.id, { onDelete: "set null" }),

  reviewedAt: timestamp("reviewed_at"),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});


// Status enum (add this with other enums)
