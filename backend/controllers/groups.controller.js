import { db } from "../config/db.js";
import { groups, groupMembers, users } from "../database/schema.js";
import { eq, and, or, sql } from "drizzle-orm";
import { getCachedData, setCachedData, deleteCachedDataByPattern } from "../config/redis.js";

// Create a new group
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

    // Invalidate cache
    await deleteCachedDataByPattern(`groups:*:university:${universityId}`);
    await deleteCachedDataByPattern(`mygroups:*:user:${userId}`);

    return res.status(201).json({
      success: true,
      message: "Group created successfully",
      group: newGroup,
    });
  } catch (error) {
    console.error("Create group error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create group",
    });
  }
};

// Get all groups in the university with pagination and caching
export const getGroups = async (req, res) => {
  try {
    const universityId = req.user.universityId;
    const { type, page = 1, limit = 10 } = req.query;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    // Create cache key
    const cacheKey = `groups:page:${pageNum}:limit:${limitNum}:type:${type || 'all'}:university:${universityId}`;
    
    // Check cache
    const cachedData = await getCachedData(cacheKey);
    if (cachedData) {
      return res.status(200).json({
        success: true,
        ...cachedData,
        cached: true,
      });
    }

    let conditions = [eq(groups.universityId, universityId)];
    
    if (type) {
      conditions.push(eq(groups.type, type));
    }

    // Get total count
    const [{ count: totalCount }] = await db
      .select({ count: sql`COUNT(*)::int` })
      .from(groups)
      .where(and(...conditions));

    const allGroups = await db
      .select({
        id: groups.id,
        name: groups.name,
        type: groups.type,
        createdAt: groups.createdAt,
        createdBy: groups.createdBy,
        creator: {
          id: users.id,
          name: users.name,
          profileUrl: users.profileUrl,
        },
      })
      .from(groups)
      .leftJoin(users, eq(groups.createdBy, users.id))
      .where(and(...conditions))
      .limit(limitNum)
      .offset(offset);

    // Get member counts for each group
    const groupsWithMemberCount = await Promise.all(
      allGroups.map(async (group) => {
        const membersList = await db
          .select()
          .from(groupMembers)
          .where(eq(groupMembers.groupId, group.id));

        return {
          ...group,
          memberCount: membersList.length,
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

    // Cache the result for 5 minutes
    await setCachedData(cacheKey, result, 300);

    return res.status(200).json({
      success: true,
      ...result,
      cached: false,
    });
  } catch (error) {
    console.error("Get groups error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch groups",
    });
  }
};

// Get groups the user is a member of with pagination and caching
export const getMyGroups = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    // Create cache key
    const cacheKey = `mygroups:page:${pageNum}:limit:${limitNum}:user:${userId}`;
    
    // Check cache
    const cachedData = await getCachedData(cacheKey);
    if (cachedData) {
      return res.status(200).json({
        success: true,
        ...cachedData,
        cached: true,
      });
    }

    // Get total count
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

    // Get member counts for each group
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

    // Cache the result for 5 minutes
    await setCachedData(cacheKey, result, 300);

    return res.status(200).json({
      success: true,
      ...result,
      cached: false,
    });
  } catch (error) {
    console.error("Get my groups error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch your groups",
    });
  }
};

export const getGroupById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Create cache key
    const cacheKey = `group:${id}:user:${userId}`;
    
    // Check cache
    const cachedData = await getCachedData(cacheKey);
    if (cachedData) {
      return res.status(200).json({
        success: true,
        ...cachedData,
        cached: true,
      });
    }

    const [group] = await db
      .select({
        id: groups.id,
        name: groups.name,
        type: groups.type,
        createdAt: groups.createdAt,
        createdBy: groups.createdBy,
        creator: {
          id: users.id,
          name: users.name,
          profileUrl: users.profileUrl,
        },
      })
      .from(groups)
      .leftJoin(users, eq(groups.createdBy, users.id))
      .where(eq(groups.id, id));

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    // Check if user is a member
    const [membership] = await db
      .select()
      .from(groupMembers)
      .where(
        and(eq(groupMembers.groupId, id), eq(groupMembers.userId, userId))
      );

    const result = {
      group: {
        ...group,
        isMember: !!membership,
        userRole: membership?.role || null,
      },
    };

    // Cache the result for 5 minutes
    await setCachedData(cacheKey, result, 300);

    return res.status(200).json({
      success: true,
      ...result,
      cached: false,
    });
  } catch (error) {
    console.error("Get group error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch group",
    });
  }
};

// Update group
export const updateGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type } = req.body;
    const userId = req.user.id;

    // Check if user is admin of the group
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

    // Invalidate cache
    await deleteCachedDataByPattern(`groups:*`);
    await deleteCachedDataByPattern(`mygroups:*`);
    await deleteCachedDataByPattern(`group:${id}:*`);

    return res.status(200).json({
      success: true,
      message: "Group updated successfully",
      group: updatedGroup,
    });
  } catch (error) {
    console.error("Update group error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update group",
    });
  }
};

// Delete group
export const deleteGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if user is the creator
    const [group] = await db.select().from(groups).where(eq(groups.id, id));

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    if (group.createdBy !== userId) {
      return res.status(403).json({
        success: false,
        message: "Only the creator can delete the group",
      });
    }

    await db.delete(groups).where(eq(groups.id, id));

    // Invalidate cache
    await deleteCachedDataByPattern(`groups:*`);
    await deleteCachedDataByPattern(`mygroups:*`);
    await deleteCachedDataByPattern(`group:${id}:*`);

    return res.status(200).json({
      success: true,
      message: "Group deleted successfully",
    });
  } catch (error) {
    console.error("Delete group error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete group",
    });
  }
};

// Get group members with pagination and caching
export const getGroupMembers = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    // Create cache key
    const cacheKey = `groupmembers:${id}:page:${pageNum}:limit:${limitNum}`;
    
    // Check cache
    const cachedData = await getCachedData(cacheKey);
    if (cachedData) {
      return res.status(200).json({
        success: true,
        ...cachedData,
        cached: true,
      });
    }

    // Get total count
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

    // Cache the result for 5 minutes
    await setCachedData(cacheKey, result, 300);

    return res.status(200).json({
      success: true,
      ...result,
      cached: false,
    });
  } catch (error) {
    console.error("Get members error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch members",
    });
  }
};

// Join group
export const joinGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if user is already a member
    const [existingMember] = await db
      .select()
      .from(groupMembers)
      .where(and(eq(groupMembers.groupId, id), eq(groupMembers.userId, userId)));

    if (existingMember) {
      return res.status(400).json({
        success: false,
        message: "You are already a member of this group",
      });
    }

    // Add user as member
    const [newMember] = await db
      .insert(groupMembers)
      .values({
        groupId: id,
        userId,
        role: "member",
      })
      .returning();

    // Invalidate cache
    await deleteCachedDataByPattern(`groups:*`);
    await deleteCachedDataByPattern(`mygroups:*:user:${userId}`);
    await deleteCachedDataByPattern(`group:${id}:*`);
    await deleteCachedDataByPattern(`groupmembers:${id}:*`);

    return res.status(201).json({
      success: true,
      message: "Joined group successfully",
      member: newMember,
    });
  } catch (error) {
    console.error("Join group error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to join group",
    });
  }
};

// Add member to group
export const addMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId: newUserId, role = "member" } = req.body;
    const currentUserId = req.user.id;

    // Check if current user is admin
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

    // Check if user is already a member
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

    // Invalidate cache
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
    console.error("Add member error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to add member",
    });
  }
};

// Remove member from group
export const removeMember = async (req, res) => {
  try {
    const { id, userId: memberToRemove } = req.params;
    const currentUserId = req.user.id;

    // Check if current user is admin
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
        message: "Only admins can remove members",
      });
    }

    // Check if trying to remove the group creator
    const [group] = await db.select().from(groups).where(eq(groups.id, id));

    if (group.createdBy === memberToRemove) {
      return res.status(400).json({
        success: false,
        message: "Cannot remove the group creator",
      });
    }

    await db
      .delete(groupMembers)
      .where(
        and(
          eq(groupMembers.groupId, id),
          eq(groupMembers.userId, memberToRemove)
        )
      );

    // Invalidate cache
    await deleteCachedDataByPattern(`groups:*`);
    await deleteCachedDataByPattern(`mygroups:*:user:${memberToRemove}`);
    await deleteCachedDataByPattern(`group:${id}:*`);
    await deleteCachedDataByPattern(`groupmembers:${id}:*`);

    return res.status(200).json({
      success: true,
      message: "Member removed successfully",
    });
  } catch (error) {
    console.error("Remove member error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to remove member",
    });
  }
};

// Update member role
export const updateMemberRole = async (req, res) => {
  try {
    const { id, userId: memberToUpdate } = req.params;
    const { role } = req.body;
    const currentUserId = req.user.id;

    // Check if current user is admin
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

    // Invalidate cache
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
    console.error("Update role error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update member role",
    });
  }
};

// Leave group
export const leaveGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if user is the creator
    const [group] = await db.select().from(groups).where(eq(groups.id, id));

    if (group.createdBy === userId) {
      return res.status(400).json({
        success: false,
        message: "Creator cannot leave the group. Delete the group instead.",
      });
    }

    await db
      .delete(groupMembers)
      .where(and(eq(groupMembers.groupId, id), eq(groupMembers.userId, userId)));

    // Invalidate cache
    await deleteCachedDataByPattern(`groups:*`);
    await deleteCachedDataByPattern(`mygroups:*:user:${userId}`);
    await deleteCachedDataByPattern(`group:${id}:*`);
    await deleteCachedDataByPattern(`groupmembers:${id}:*`);

    return res.status(200).json({
      success: true,
      message: "Left group successfully",
    });
  } catch (error) {
    console.error("Leave group error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to leave group",
    });
  }
};