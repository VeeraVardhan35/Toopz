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

export const getAllUniversities = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = "" } = req.query;
    const { limit: take, offset: skip } = paginate(page, limit);

    let conditions = [];
    if (search) {
      conditions.push(ilike(universities.name, `%${search}%`));
    }

    const [{ count: total }] = await db
      .select({ count: sql`COUNT(*)::int` })
      .from(universities)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

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

    const universitiesWithStats = await Promise.all(
      allUniversities.map(async (university) => {
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

        const [{ count: postsCount }] = await db
          .select({ count: sql`COUNT(*)::int` })
          .from(posts)
          .where(eq(posts.universityId, university.id));

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
    console.error("❌ Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch university",
    });
  }
};

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

    const [{ count: total }] = await db
      .select({ count: sql`COUNT(*)::int` })
      .from(users)
      .where(and(...conditions));

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
    console.error("❌ Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch posts",
    });
  }
};

export const getUniversityGroups = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20, type } = req.query;
    const { limit: take, offset: skip } = paginate(page, limit);

    let conditions = [eq(groups.universityId, id)];

    if (type) {
      conditions.push(eq(groups.type, type));
    }

    const [{ count: total }] = await db
      .select({ count: sql`COUNT(*)::int` })
      .from(groups)
      .where(and(...conditions));

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
    console.error("❌ Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard stats",
      error: error.message,
    });
  }
};

export const createUniversity = async (req, res) => {
  try {
    const { name, domain, city, state, logoUrl } = req.body;

    if (!name || !domain) {
      return res.status(400).json({
        success: false,
        message: "Name and domain are required",
      });
    }

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
    console.error("❌ Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update university",
    });
  }
};

export const deleteUniversity = async (req, res) => {
  try {
    const { id } = req.params;

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

    const [{ count: usersCount }] = await db
      .select({ count: sql`COUNT(*)::int` })
      .from(users)
      .where(eq(users.universityId, id));

    const [{ count: postsCount }] = await db
      .select({ count: sql`COUNT(*)::int` })
      .from(posts)
      .where(eq(posts.universityId, id));

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
    console.error("❌ Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user details",
    });
  }
};

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
    console.error("❌ Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete user",
    });
  }
};
