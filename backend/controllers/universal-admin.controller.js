import { db } from "../config/db.js";
import {
  users,
  universities,
  posts,
  groups,
  groupMembers,
  postLikes,
  postComments,
} from "../database/schema.js";
import { eq, and, sql, desc, ilike } from "drizzle-orm";
import { paginate, getPaginationMeta } from "../utils/pagination.js";

// Get all universities with stats
export const getAllUniversities = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = "" } = req.query;
    const { limit: take, offset: skip } = paginate(page, limit);

    let conditions = [];
    if (search) {
      conditions.push(ilike(universities.name, `%${search}%`));
    }

    // Get total count
    const [{ count: total }] = await db
      .select({ count: sql`COUNT(*)::int` })
      .from(universities)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    // Get universities with stats
    const allUniversities = await db
      .select({
        id: universities.id,
        name: universities.name,
        domain: universities.domain,
        city: universities.city,
        state: universities.state,
        logoUrl: universities.logoUrl,
        createdAt: universities.createdAt,
      })
      .from(universities)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(universities.createdAt))
      .limit(take)
      .offset(skip);

    // Get stats for each university
    const universitiesWithStats = await Promise.all(
      allUniversities.map(async (university) => {
        // Count users by role
        const userStats = await db
          .select({
            role: users.role,
            count: sql`COUNT(*)::int`,
          })
          .from(users)
          .where(eq(users.universityId, university.id))
          .groupBy(users.role);

        const stats = {
          students: 0,
          professors: 0,
          admins: 0,
          total: 0,
        };

        userStats.forEach((stat) => {
          if (stat.role === "student") stats.students = stat.count;
          if (stat.role === "professor") stats.professors = stat.count;
          if (stat.role === "admin") stats.admins = stat.count;
          stats.total += stat.count;
        });

        // Count posts
        const [{ count: postsCount }] = await db
          .select({ count: sql`COUNT(*)::int` })
          .from(posts)
          .where(eq(posts.universityId, university.id));

        // Count groups
        const [{ count: groupsCount }] = await db
          .select({ count: sql`COUNT(*)::int` })
          .from(groups)
          .where(eq(groups.universityId, university.id));

        return {
          ...university,
          stats: {
            ...stats,
            posts: postsCount,
            groups: groupsCount,
          },
        };
      })
    );

    return res.status(200).json({
      success: true,
      universities: universitiesWithStats,
      pagination: getPaginationMeta(total, page, limit),
    });
  } catch (error) {
    console.error("Get universities error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch universities",
    });
  }
};

// Get university details with all data
export const getUniversityById = async (req, res) => {
  try {
    const { id } = req.params;

    const [university] = await db
      .select()
      .from(universities)
      .where(eq(universities.id, id));

    if (!university) {
      return res.status(404).json({
        success: false,
        message: "University not found",
      });
    }

    // Get detailed stats
    const userStats = await db
      .select({
        role: users.role,
        count: sql`COUNT(*)::int`,
      })
      .from(users)
      .where(eq(users.universityId, id))
      .groupBy(users.role);

    const stats = {
      students: 0,
      professors: 0,
      admins: 0,
      total: 0,
    };

    userStats.forEach((stat) => {
      if (stat.role === "student") stats.students = stat.count;
      if (stat.role === "professor") stats.professors = stat.count;
      if (stat.role === "admin") stats.admins = stat.count;
      stats.total += stat.count;
    });

    const [{ count: postsCount }] = await db
      .select({ count: sql`COUNT(*)::int` })
      .from(posts)
      .where(eq(posts.universityId, id));

    const [{ count: groupsCount }] = await db
      .select({ count: sql`COUNT(*)::int` })
      .from(groups)
      .where(eq(groups.universityId, id));

    return res.status(200).json({
      success: true,
      university: {
        ...university,
        stats: {
          ...stats,
          posts: postsCount,
          groups: groupsCount,
        },
      },
    });
  } catch (error) {
    console.error("Get university error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch university",
    });
  }
};

// Get all users in a university
export const getUniversityUsers = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 50, role, search = "" } = req.query;
    const { limit: take, offset: skip } = paginate(page, limit);

    let conditions = [eq(users.universityId, id)];

    if (role) {
      conditions.push(eq(users.role, role));
    }

    if (search) {
      conditions.push(
        sql`(${users.name} ILIKE ${"%" + search + "%"} OR ${users.email} ILIKE ${
          "%" + search + "%"
        })`
      );
    }

    // Get total count
    const [{ count: total }] = await db
      .select({ count: sql`COUNT(*)::int` })
      .from(users)
      .where(and(...conditions));

    // Get users
    const universityUsers = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        department: users.department,
        batch: users.batch,
        profileUrl: users.profileUrl,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(and(...conditions))
      .orderBy(desc(users.createdAt))
      .limit(take)
      .offset(skip);

    return res.status(200).json({
      success: true,
      users: universityUsers,
      pagination: getPaginationMeta(total, page, limit),
    });
  } catch (error) {
    console.error("Get university users error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};

// Get all posts in a university
export const getUniversityPosts = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const { limit: take, offset: skip } = paginate(page, limit);

    // Get total count
    const [{ count: total }] = await db
      .select({ count: sql`COUNT(*)::int` })
      .from(posts)
      .where(eq(posts.universityId, id));

    // Get posts with author info
        const universityPosts = await db
        .select({
            id: posts.id,
            content: posts.content,
            createdAt: posts.createdAt,
            author: {
            id: users.id,
            name: users.name,
            email: users.email,
            profileUrl: users.profileUrl,
            role: users.role,
            },
            likesCount: sql`(
            SELECT COUNT(*) FROM ${postLikes} WHERE ${postLikes.postId} = ${posts.id}
            )::int`,
            commentsCount: sql`(
            SELECT COUNT(*) FROM ${postComments} WHERE ${postComments.postId} = ${posts.id}
            )::int`,
        })
        .from(posts)
        .leftJoin(users, eq(posts.authorId, users.id))
        .where(eq(posts.universityId, id))
        .orderBy(desc(posts.createdAt))
        .limit(take)
        .offset(skip);


    // Get likes and comments count for each post
    const postsWithStats = await Promise.all(
      universityPosts.map(async (post) => {
        const [{ count: likesCount }] = await db
          .select({ count: sql`COUNT(*)::int` })
          .from(postLikes)
          .where(eq(postLikes.postId, post.id));

        const [{ count: commentsCount }] = await db
          .select({ count: sql`COUNT(*)::int` })
          .from(postComments)
          .where(eq(postComments.postId, post.id));

        return {
          ...post,
          stats: {
            likes: likesCount,
            comments: commentsCount,
          },
        };
      })
    );

    return res.status(200).json({
      success: true,
      posts: postsWithStats,
      pagination: getPaginationMeta(total, page, limit),
    });
  } catch (error) {
    console.error("Get university posts error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch posts",
    });
  }
};

// Get all groups in a university
export const getUniversityGroups = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20, type } = req.query;
    const { limit: take, offset: skip } = paginate(page, limit);

    let conditions = [eq(groups.universityId, id)];

    if (type) {
      conditions.push(eq(groups.type, type));
    }

    // Get total count
    const [{ count: total }] = await db
      .select({ count: sql`COUNT(*)::int` })
      .from(groups)
      .where(and(...conditions));

    // Get groups with creator info
    const universityGroups = await db
      .select({
        id: groups.id,
        name: groups.name,
        type: groups.type,
        createdAt: groups.createdAt,
        creator: {
          id: users.id,
          name: users.name,
          email: users.email,
          profileUrl: users.profileUrl,
        },
      })
      .from(groups)
      .leftJoin(users, eq(groups.createdBy, users.id))
      .where(and(...conditions))
      .orderBy(desc(groups.createdAt))
      .limit(take)
      .offset(skip);

    // Get member count for each group
    const groupsWithStats = await Promise.all(
      universityGroups.map(async (group) => {
        const [{ count: membersCount }] = await db
          .select({ count: sql`COUNT(*)::int` })
          .from(groupMembers)
          .where(eq(groupMembers.groupId, group.id));

        return {
          ...group,
          memberCount: membersCount,
        };
      })
    );

    return res.status(200).json({
      success: true,
      groups: groupsWithStats,
      pagination: getPaginationMeta(total, page, limit),
    });
  } catch (error) {
    console.error("Get university groups error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch groups",
    });
  }
};

// Get dashboard overview statistics
export const getDashboardStats = async (req, res) => {
  try {
    // Total universities
    const [{ count: totalUniversities }] = await db
      .select({ count: sql`COUNT(*)::int` })
      .from(universities);

    // Total users by role
    const userStats = await db
      .select({
        role: users.role,
        count: sql`COUNT(*)::int`,
      })
      .from(users)
      .groupBy(users.role);

    const stats = {
      students: 0,
      professors: 0,
      admins: 0,
      universalAdmins: 0,
      totalUsers: 0,
    };

    userStats.forEach((stat) => {
      if (stat.role === "student") stats.students = stat.count;
      if (stat.role === "professor") stats.professors = stat.count;
      if (stat.role === "admin") stats.admins = stat.count;
      if (stat.role === "UniversalAdmin") stats.universalAdmins = stat.count;
      stats.totalUsers += stat.count;
    });

    // Total posts
    const [{ count: totalPosts }] = await db
      .select({ count: sql`COUNT(*)::int` })
      .from(posts);

    // Total groups
    const [{ count: totalGroups }] = await db
      .select({ count: sql`COUNT(*)::int` })
      .from(groups);

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [{ count: recentUsers }] = await db
      .select({ count: sql`COUNT(*)::int` })
      .from(users)
      .where(sql`${users.createdAt} >= ${sevenDaysAgo}`);

    const [{ count: recentPosts }] = await db
      .select({ count: sql`COUNT(*)::int` })
      .from(posts)
      .where(sql`${posts.createdAt} >= ${sevenDaysAgo}`);

    const [{ count: recentGroups }] = await db
      .select({ count: sql`COUNT(*)::int` })
      .from(groups)
      .where(sql`${groups.createdAt} >= ${sevenDaysAgo}`);

    return res.status(200).json({
      success: true,
      stats: {
        universities: totalUniversities,
        users: stats,
        posts: totalPosts,
        groups: totalGroups,
        recentActivity: {
          users: recentUsers,
          posts: recentPosts,
          groups: recentGroups,
        },
      },
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard stats",
      error: error.message,
    });
  }
};

// Create new university
export const createUniversity = async (req, res) => {
  try {
    const { name, domain, city, state, logoUrl } = req.body;

    if (!name || !domain) {
      return res.status(400).json({
        success: false,
        message: "Name and domain are required",
      });
    }

    // Check if domain already exists
    const [existing] = await db
      .select()
      .from(universities)
      .where(eq(universities.domain, domain))
      .limit(1);

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "University with this domain already exists",
      });
    }

    const [newUniversity] = await db
      .insert(universities)
      .values({
        name,
        domain,
        city,
        state,
        logoUrl,
      })
      .returning();

    return res.status(201).json({
      success: true,
      message: "University created successfully",
      university: newUniversity,
    });
  } catch (error) {
    console.error("Create university error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create university",
    });
  }
};

// Update university
export const updateUniversity = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, domain, city, state, logoUrl } = req.body;

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (domain !== undefined) updates.domain = domain;
    if (city !== undefined) updates.city = city;
    if (state !== undefined) updates.state = state;
    if (logoUrl !== undefined) updates.logoUrl = logoUrl;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields to update",
      });
    }

    updates.updatedAt = new Date();

    const [updatedUniversity] = await db
      .update(universities)
      .set(updates)
      .where(eq(universities.id, id))
      .returning();

    if (!updatedUniversity) {
      return res.status(404).json({
        success: false,
        message: "University not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "University updated successfully",
      university: updatedUniversity,
    });
  } catch (error) {
    console.error("Update university error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update university",
    });
  }
};

// Delete university
export const deleteUniversity = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if university exists
    const [university] = await db
      .select()
      .from(universities)
      .where(eq(universities.id, id))
      .limit(1);

    if (!university) {
      return res.status(404).json({
        success: false,
        message: "University not found",
      });
    }

    // Get counts before deletion
    const [{ count: usersCount }] = await db
      .select({ count: sql`COUNT(*)::int` })
      .from(users)
      .where(eq(users.universityId, id));

    const [{ count: postsCount }] = await db
      .select({ count: sql`COUNT(*)::int` })
      .from(posts)
      .where(eq(posts.universityId, id));

    // Delete university (cascade will handle related data)
    await db.delete(universities).where(eq(universities.id, id));

    return res.status(200).json({
      success: true,
      message: "University deleted successfully",
      deleted: {
        users: usersCount,
        posts: postsCount,
      },
    });
  } catch (error) {
    console.error("Delete university error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete university",
    });
  }
};

// Get user details with activity
export const getUserDetails = async (req, res) => {
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
        },
      })
      .from(users)
      .leftJoin(universities, eq(users.universityId, universities.id))
      .where(eq(users.id, userId));

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get user's post count
    const [{ count: postsCount }] = await db
      .select({ count: sql`COUNT(*)::int` })
      .from(posts)
      .where(eq(posts.authorId, userId));

    // Get user's groups count
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
    console.error("Get user details error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user details",
    });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent deleting UniversalAdmin
    if (user.role === "UniversalAdmin") {
      return res.status(403).json({
        success: false,
        message: "Cannot delete Universal Admin",
      });
    }

    await db.delete(users).where(eq(users.id, userId));

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete user",
    });
  }
};