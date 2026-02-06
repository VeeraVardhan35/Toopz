import { db } from "../config/db.js";
import {
    pendingAdminRequests,
    users,
    universities,
} from "../database/schema.js";
import { eq, and, sql, desc } from "drizzle-orm";

/* =========================
   Pagination helpers
========================= */
const getPagination = (page = 1, limit = 20) => {
    const take = Math.max(parseInt(limit), 1);
    const skip = (Math.max(parseInt(page), 1) - 1) * take;
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

/* =========================
   Submit admin request
========================= */
export const submitAdminRequest = async (req, res) => {
    try {
        const userId = req.user.id;
        const { universityId, requestMessage } = req.body;

        if (!universityId) {
            return res.status(400).json({
                success: false,
                message: "University ID is required",
            });
        }

        const [university] = await db
            .select()
            .from(universities)
            .where(eq(universities.id, universityId))
            .limit(1);

        if (!university) {
            return res.status(404).json({
                success: false,
                message: "University not found",
            });
        }

        const [existingRequest] = await db
            .select()
            .from(pendingAdminRequests)
            .where(
                and(
                    eq(pendingAdminRequests.userId, userId),
                    eq(pendingAdminRequests.universityId, universityId),
                    eq(pendingAdminRequests.status, "pending")
                )
            )
            .limit(1);

        if (existingRequest) {
            return res.status(400).json({
                success: false,
                message: "You already have a pending request for this university",
            });
        }

        const [newRequest] = await db
            .insert(pendingAdminRequests)
            .values({
                universityId,
                userId,
                requestedRole: "admin",
                status: "pending",
                requestMessage: requestMessage || null,
            })
            .returning();

        return res.status(201).json({
            success: true,
            message: "Admin request submitted successfully",
            request: newRequest,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to submit request",
        });
    }
};

/* =========================
   Get all pending requests
========================= */
export const getAllPendingRequests = async (req, res) => {
    try {
        const { page = 1, limit = 20, status = "pending" } = req.query;
        const { take, skip } = getPagination(page, limit);

        const conditions = [];
        if (status) {
            conditions.push(eq(pendingAdminRequests.status, status));
        }

        const [{ count: total }] = await db
            .select({ count: sql`COUNT(*)::int` })
            .from(pendingAdminRequests)
            .where(conditions.length ? and(...conditions) : undefined);

        const requests = await db
            .select({
                id: pendingAdminRequests.id,
                status: pendingAdminRequests.status,
                requestedRole: pendingAdminRequests.requestedRole,
                requestMessage: pendingAdminRequests.requestMessage,
                responseMessage: pendingAdminRequests.responseMessage,
                createdAt: pendingAdminRequests.createdAt,
                reviewedAt: pendingAdminRequests.reviewedAt,
                user: {
                    id: users.id,
                    name: users.name,
                    email: users.email,
                    profileUrl: users.profileUrl,
                },
                university: {
                    id: universities.id,
                    name: universities.name,
                    domain: universities.domain,
                },
            })
            .from(pendingAdminRequests)
            .leftJoin(users, eq(pendingAdminRequests.userId, users.id))
            .leftJoin(universities, eq(pendingAdminRequests.universityId, universities.id))
            .where(conditions.length ? and(...conditions) : undefined)
            .orderBy(desc(pendingAdminRequests.createdAt))
            .limit(take)
            .offset(skip);

        return res.status(200).json({
            success: true,
            requests,
            pagination: getPaginationMeta(total, page, limit),
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch requests",
        });
    }
};

/* =========================
   Get my requests
========================= */
export const getMyRequests = async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 20 } = req.query;
        const { take, skip } = getPagination(page, limit);

        const [{ count: total }] = await db
            .select({ count: sql`COUNT(*)::int` })
            .from(pendingAdminRequests)
            .where(eq(pendingAdminRequests.userId, userId));

        const requests = await db
            .select({
                id: pendingAdminRequests.id,
                status: pendingAdminRequests.status,
                requestedRole: pendingAdminRequests.requestedRole,
                requestMessage: pendingAdminRequests.requestMessage,
                responseMessage: pendingAdminRequests.responseMessage,
                createdAt: pendingAdminRequests.createdAt,
                reviewedAt: pendingAdminRequests.reviewedAt,
                university: {
                    id: universities.id,
                    name: universities.name,
                    domain: universities.domain,
                },
            })
            .from(pendingAdminRequests)
            .leftJoin(universities, eq(pendingAdminRequests.universityId, universities.id))
            .where(eq(pendingAdminRequests.userId, userId))
            .orderBy(desc(pendingAdminRequests.createdAt))
            .limit(take)
            .offset(skip);

        return res.status(200).json({
            success: true,
            requests,
            pagination: getPaginationMeta(total, page, limit),
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch your requests",
        });
    }
};

/* =========================
   Approve / Reject / Count
========================= */

export const approveAdminRequest = async (req, res) => {
    try {
        const { requestId } = req.params;

        const [request] = await db
            .select()
            .from(pendingAdminRequests)
            .where(eq(pendingAdminRequests.id, requestId))
            .limit(1);

        if (!request || request.status !== "pending") {
            return res.status(400).json({
                success: false,
                message: "Invalid request",
            });
        }

        await db.update(pendingAdminRequests).set({
            status: "approved",
            reviewedBy: req.user.id,
            reviewedAt: new Date(),
            updatedAt: new Date(),
        }).where(eq(pendingAdminRequests.id, requestId));

        await db.update(users).set({
            role: "admin",
            updatedAt: new Date(),
        }).where(eq(users.id, request.userId));

        return res.status(200).json({
            success: true,
            message: "Admin request approved",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to approve request",
        });
    }
};

export const rejectAdminRequest = async (req, res) => {
    try {
        const { requestId } = req.params;

        await db.update(pendingAdminRequests).set({
            status: "rejected",
            reviewedBy: req.user.id,
            reviewedAt: new Date(),
            updatedAt: new Date(),
        }).where(eq(pendingAdminRequests.id, requestId));

        return res.status(200).json({
            success: true,
            message: "Admin request rejected",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to reject request",
        });
    }
};

export const getPendingRequestsCount = async (req, res) => {
    try {
        const [{ count }] = await db
            .select({ count: sql`COUNT(*)::int` })
            .from(pendingAdminRequests)
            .where(eq(pendingAdminRequests.status, "pending"));

        return res.status(200).json({
            success: true,
            count,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to get count",
        });
    }
};


export const getRequestById = async (req, res) => {
    try {
        const { requestId } = req.params;

        const [request] = await db
            .select({
                id: pendingAdminRequests.id,
                status: pendingAdminRequests.status,
                requestedRole: pendingAdminRequests.requestedRole,
                requestMessage: pendingAdminRequests.requestMessage,
                responseMessage: pendingAdminRequests.responseMessage,
                createdAt: pendingAdminRequests.createdAt,
                reviewedAt: pendingAdminRequests.reviewedAt,
                user: {
                    id: users.id,
                    name: users.name,
                    email: users.email,
                    profileUrl: users.profileUrl,
                },
                university: {
                    id: universities.id,
                    name: universities.name,
                    domain: universities.domain,
                },
            })
            .from(pendingAdminRequests)
            .leftJoin(users, eq(pendingAdminRequests.userId, users.id))
            .leftJoin(universities, eq(pendingAdminRequests.universityId, universities.id))
            .where(eq(pendingAdminRequests.id, requestId))
            .limit(1);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: "Admin request not found",
            });
        }

        return res.status(200).json({
            success: true,
            request,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch request",
        });
    }
};
