import { db } from "../config/db.js";
import { users, universities, posts, groups, groupMembers } from "../database/schema.js";
import { and, desc, eq, sql } from "drizzle-orm";
import { deleteCachedDataByPattern } from "../config/redis.js";

export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        department: users.department,
        batch: users.batch,
        profileUrl: users.profileUrl,
        createdAt: users.createdAt,
        university: {
          id: universities.id,
          name: universities.name,
          domain: universities.domain,
        },
      })
      .from(users)
      .leftJoin(universities, eq(users.universityId, universities.id))
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const [{ count: postsCount }] = await db
      .select({ count: sql`COUNT(*)::int` })
      .from(posts)
      .where(eq(posts.authorId, userId));

    const [{ count: groupsCount }] = await db
      .select({ count: sql`COUNT(*)::int` })
      .from(groupMembers)
      .where(eq(groupMembers.userId, userId));

    return res.status(200).json({
      success: true,
      user: {
        ...user,
        stats: {
          posts: postsCount,
          groups: groupsCount,
        },
      },
    });
  } catch (error) {
    console.error("❌ Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user posts",
    });
  }
};

export const getUserGroups = async (req, res) => {
  try {
    const { userId } = req.params;

    const userGroups = await db
      .select({
        id: groups.id,
        name: groups.name,
        type: groups.type,
        role: groupMembers.role,
        joinedAt: groupMembers.joinedAt,
      })
      .from(groupMembers)
      .leftJoin(groups, eq(groupMembers.groupId, groups.id))
      .where(eq(groupMembers.userId, userId))
      .orderBy(desc(groupMembers.joinedAt));

    return res.status(200).json({
      success: true,
      groups: userGroups,
    });
  } catch (error) {
    console.error("❌ Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
};

export const uploadProfileImage = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const profileUrl = req.file.path;

    const [updatedUser] = await db
      .update(users)
      .set({ profileUrl })
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        department: users.department,
        batch: users.batch,
        profileUrl: users.profileUrl,
      });

    await deleteCachedDataByPattern(`user:${userId}*`);
    await deleteCachedDataByPattern(`cache:*${userId}*`);

    return res.status(200).json({
      success: true,
      profileUrl,
      user: updatedUser,
    });
  } catch (error) {
    console.error("❌ Error:", error);
