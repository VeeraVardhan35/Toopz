import { db } from "../config/db.js";
import {
  pendingUniversityRequests,
  universities,
  users,
} from "../database/schema.js";
import { and, desc, eq, sql } from "drizzle-orm";
import { deleteCachedDataByPattern } from "../config/redis.js";

const getPagination = (page = 1, limit = 20) => {
  const take = Math.max(parseInt(limit, 10), 1);
  const skip = (Math.max(parseInt(page, 10), 1) - 1) * take;
  return { take, skip };
};

const getPaginationMeta = (total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  return {
    total,
    page: Number(page),
    limit: Number(limit),
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
};

export const submitUniversityRequest = async (req, res) => {
  try {
    const requesterId = req.user.id;
    const { name, domain, city, state, logoUrl, requestMessage } = req.body;

    if (!name || !domain) {
      return res.status(400).json({
        success: false,
        message: "University name and domain are required",
      });
    }

    const [existingUniversity] = await db
      .select()
      .from(universities)
      .where(eq(universities.domain, domain))
      .limit(1);

    if (existingUniversity) {
      return res.status(400).json({
        success: false,
        message: "University with this domain already exists",
      });
    }

    const [existingRequest] = await db
      .select()
      .from(pendingUniversityRequests)
      .where(
        and(
          eq(pendingUniversityRequests.domain, domain),
          eq(pendingUniversityRequests.status, "pending")
        )
      )
      .limit(1);

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: "A pending request for this domain already exists",
      });
    }

    const [newRequest] = await db
      .insert(pendingUniversityRequests)
      .values({
        requesterId,
        name,
        domain,
        city: city || null,
        state: state || null,
        logoUrl: logoUrl || null,
        requestMessage: requestMessage || null,
      })
      .returning();

    await deleteCachedDataByPattern("cache:*university-requests*");

    return res.status(201).json({
      success: true,
      message: "University registration request submitted",
      request: newRequest,
    });
  } catch (error) {
    console.error("❌ Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to upload logo",
    });
  }
};

export const getMyUniversityRequests = async (req, res) => {
  try {
    const requesterId = req.user.id;
    const { page = 1, limit = 20 } = req.query;
    const { take, skip } = getPagination(page, limit);

    const [{ count: total }] = await db
      .select({ count: sql`COUNT(*)::int` })
      .from(pendingUniversityRequests)
      .where(eq(pendingUniversityRequests.requesterId, requesterId));

    const requests = await db
      .select()
      .from(pendingUniversityRequests)
      .where(eq(pendingUniversityRequests.requesterId, requesterId))
      .orderBy(desc(pendingUniversityRequests.createdAt))
      .limit(take)
      .offset(skip);

    return res.status(200).json({
      success: true,
      requests,
      pagination: getPaginationMeta(total, page, limit),
    });
  } catch (error) {
    console.error("❌ Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch requests",
    });
  }
};



export const approveUniversityRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { responseMessage } = req.body;

    const [request] = await db
      .select()
      .from(pendingUniversityRequests)
      .where(eq(pendingUniversityRequests.id, requestId))
      .limit(1);

    if (!request || request.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Invalid request",
      });
    }

    const [existingUniversity] = await db
      .select()
      .from(universities)
      .where(eq(universities.domain, request.domain))
      .limit(1);

    if (existingUniversity) {
      return res.status(400).json({
        success: false,
        message: "University with this domain already exists",
      });
    }

    const [newUniversity] = await db
      .insert(universities)
      .values({
        name: request.name,
        domain: request.domain,
        city: request.city,
        state: request.state,
        logoUrl: request.logoUrl,
      })
      .returning();

    await db
      .update(pendingUniversityRequests)
      .set({
        status: "approved",
        responseMessage: responseMessage || "University approved.",
        reviewedBy: req.user.id,
        reviewedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(pendingUniversityRequests.id, requestId));

    await db
      .update(users)
      .set({
        universityId: newUniversity.id,
        role: "admin",
        updatedAt: new Date(),
      })
      .where(eq(users.id, request.requesterId));

    await deleteCachedDataByPattern("cache:*university-requests*");

    return res.status(200).json({
      success: true,
      message: "University request approved",
      university: newUniversity,
    });
  } catch (error) {
    console.error("❌ Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to reject request",
    });
  }
};
