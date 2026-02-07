import { db } from "../config/db.js";
import { groups, groupMembers, users } from "../database/schema.js";
import { eq, and, or, sql } from "drizzle-orm";
import { getCachedData, setCachedData, deleteCachedDataByPattern } from "../config/redis.js";

export const createGroup = async (req, res) => {
  try {
    const { name, type } = req.body;
    const userId = req.user.id;
    const universityId = req.user.universityId;

    if (!name || !type) {
      return res.status(400).json({
        success: false,
        message: "Name and type are required",
      });
    }

    const [newGroup] = await db
      .insert(groups)
      .values({
        name,
        type,
        universityId,
        createdBy: userId,
      })
      .returning();

    await db.insert(groupMembers).values({
      groupId: newGroup.id,
      userId,
      role: "admin",
    });

    await deleteCachedDataByPattern(`groups:*:university:${universityId}`);
    await deleteCachedDataByPattern(`mygroups:*:user:${userId}`);

    return res.status(201).json({
      success: true,
      message: "Group created successfully",
      group: newGroup,
    });
  } catch (error) {
    console.error("❌ Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch groups",
    });
  }
};

export const getMyGroups = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    const cacheKey = `mygroups:page:${pageNum}:limit:${limitNum}:user:${userId}`;
    
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
      .from(groupMembers)
      .where(eq(groupMembers.userId, userId));

    const myGroups = await db
      .select({
        id: groups.id,
        name: groups.name,
        type: groups.type,
        createdAt: groups.createdAt,
        createdBy: groups.createdBy,
        role: groupMembers.role,
        creator: {
          id: users.id,
          name: users.name,
          profileUrl: users.profileUrl,
        },
      })
      .from(groupMembers)
      .leftJoin(groups, eq(groupMembers.groupId, groups.id))
      .leftJoin(users, eq(groups.createdBy, users.id))
      .where(eq(groupMembers.userId, userId))
      .limit(limitNum)
      .offset(offset);

    const groupsWithMemberCount = await Promise.all(
      myGroups.map(async (group) => {
        const membersList = await db
          .select()
          .from(groupMembers)
          .where(eq(groupMembers.groupId, group.id));

        return {
          ...group,
          memberCount: membersList.length,
          isMember: true,
        };
      })
    );

    const result = {
      groups: groupsWithMemberCount,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalCount / limitNum),
        totalItems: totalCount,
        itemsPerPage: limitNum,
        hasNextPage: pageNum < Math.ceil(totalCount / limitNum),
        hasPrevPage: pageNum > 1,
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
      message: "Failed to fetch group",
    });
  }
};

export const updateGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type } = req.body;
    const userId = req.user.id;

    const [membership] = await db
      .select()
      .from(groupMembers)
      .where(
        and(
          eq(groupMembers.groupId, id),
          eq(groupMembers.userId, userId),
          eq(groupMembers.role, "admin")
        )
      );

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: "Only admins can update the group",
      });
    }

    const [updatedGroup] = await db
      .update(groups)
      .set({
        name,
        type,
        updatedAt: new Date(),
      })
      .where(eq(groups.id, id))
      .returning();

    await deleteCachedDataByPattern(`groups:*`);
    await deleteCachedDataByPattern(`mygroups:*`);
    await deleteCachedDataByPattern(`group:${id}:*`);

    return res.status(200).json({
      success: true,
      message: "Group updated successfully",
      group: updatedGroup,
    });
  } catch (error) {
    console.error("❌ Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete group",
    });
  }
};

export const getGroupMembers = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    const cacheKey = `groupmembers:${id}:page:${pageNum}:limit:${limitNum}`;
    
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
      .from(groupMembers)
      .where(eq(groupMembers.groupId, id));

    const members = await db
      .select({
        id: groupMembers.id,
        role: groupMembers.role,
        joinedAt: groupMembers.joinedAt,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
          profileUrl: users.profileUrl,
          department: users.department,
          batch: users.batch,
        },
      })
      .from(groupMembers)
      .leftJoin(users, eq(groupMembers.userId, users.id))
      .where(eq(groupMembers.groupId, id))
      .limit(limitNum)
      .offset(offset);

    const result = {
      members,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalCount / limitNum),
        totalItems: totalCount,
        itemsPerPage: limitNum,
        hasNextPage: pageNum < Math.ceil(totalCount / limitNum),
        hasPrevPage: pageNum > 1,
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
      message: "Failed to join group",
    });
  }
};

export const addMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId: newUserId, role = "member" } = req.body;
    const currentUserId = req.user.id;

    const [membership] = await db
      .select()
      .from(groupMembers)
      .where(
        and(
          eq(groupMembers.groupId, id),
          eq(groupMembers.userId, currentUserId),
          eq(groupMembers.role, "admin")
        )
      );

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: "Only admins can add members",
      });
    }

    const [existingMember] = await db
      .select()
      .from(groupMembers)
      .where(
        and(eq(groupMembers.groupId, id), eq(groupMembers.userId, newUserId))
      );

    if (existingMember) {
      return res.status(400).json({
        success: false,
        message: "User is already a member",
      });
    }

    const [newMember] = await db
      .insert(groupMembers)
      .values({
        groupId: id,
        userId: newUserId,
        role,
      })
      .returning();

    await deleteCachedDataByPattern(`groups:*`);
    await deleteCachedDataByPattern(`mygroups:*:user:${newUserId}`);
    await deleteCachedDataByPattern(`group:${id}:*`);
    await deleteCachedDataByPattern(`groupmembers:${id}:*`);

    return res.status(201).json({
      success: true,
      message: "Member added successfully",
      member: newMember,
    });
  } catch (error) {
    console.error("❌ Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to remove member",
    });
  }
};

export const updateMemberRole = async (req, res) => {
  try {
    const { id, userId: memberToUpdate } = req.params;
    const { role } = req.body;
    const currentUserId = req.user.id;

    const [membership] = await db
      .select()
      .from(groupMembers)
      .where(
        and(
          eq(groupMembers.groupId, id),
          eq(groupMembers.userId, currentUserId),
          eq(groupMembers.role, "admin")
        )
      );

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: "Only admins can update member roles",
      });
    }

    const [updatedMember] = await db
      .update(groupMembers)
      .set({ role })
      .where(
        and(
          eq(groupMembers.groupId, id),
          eq(groupMembers.userId, memberToUpdate)
        )
      )
      .returning();

    await deleteCachedDataByPattern(`groups:*`);
    await deleteCachedDataByPattern(`mygroups:*:user:${memberToUpdate}`);
    await deleteCachedDataByPattern(`group:${id}:*`);
    await deleteCachedDataByPattern(`groupmembers:${id}:*`);

    return res.status(200).json({
      success: true,
      message: "Member role updated successfully",
      member: updatedMember,
    });
  } catch (error) {
    console.error("❌ Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to leave group",
    });
  }
};