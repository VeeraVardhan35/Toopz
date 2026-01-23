import {
    pgTable,
    uuid,
    varchar,
    text,
    timestamp,
    pgEnum,
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
])

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
        .notNull()
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
