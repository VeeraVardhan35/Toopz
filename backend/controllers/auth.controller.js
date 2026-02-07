import {db} from "../config/db.js";
import {eq} from 'drizzle-orm';
import {users, universities, pendingAdminRequests}  from "../database/schema.js";
import {generateToken} from "../utils/jwt.js";
import bcrypt from 'bcrypt';
import {NODE_ENV, COOKIE_SECURE, COOKIE_SAMESITE} from "../config/env.js";
import { getCachedData, setCachedData, deleteCachedDataByPattern } from "../config/redis.js";

export const signUp = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            universityId,
            role,
            department,
            batch,
            profileUrl,
            requestMessage // New: For admin requests
        } = req.body;

        const requiresUniversity = role === "student" || role === "professor";
        if (!name || !email || !password || !role || (requiresUniversity && !universityId)) {
            return res.status(400).send({
                success: false,
                message: "Fill all the required fields",
            });
        }



        const isEmailExists = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

        if (isEmailExists.length > 0) {
            return res.status(400).send({
                success: false,
                message: "User already exists",
            });
        }

        if (universityId) {
            const [university] = await db
                .select()
                .from(universities)
                .where(eq(universities.id, universityId))
                .limit(1);

            if (!university) {
                return res.status(400).send({
                    success: false,
                    message: "University does not exist",
                });
            }
        }


        const hashedPassword = await bcrypt.hash(password, 12);

        let finalRole = role;
        let shouldCreateRequest = false;

        if (role === "admin" && universityId) {
            finalRole = "student"; // Temporarily set as student
            shouldCreateRequest = true;
        }

        const [user] = await db.insert(users).values({
            name,
            email,
            password: hashedPassword,
            universityId : universityId || null,
            role: finalRole,
            department: department || null,
            batch: batch || null,
            profileUrl: profileUrl || null,
        }).returning();

        if (shouldCreateRequest) {
            await db.insert(pendingAdminRequests).values({
                universityId,
                userId: user.id,
                requestedRole: "admin",
                status: "pending",
                requestMessage: requestMessage || "I would like to become an admin for this university.",
            });
        }

        const token = generateToken({
            id: user.id,
            email: user.email,
            role: user.role,
            universityId: user.universityId,
        });

        const cookieOptions = {
            httpOnly: true,
            secure: NODE_ENV === "production" && COOKIE_SECURE !== "false",
            sameSite: COOKIE_SAMESITE || (NODE_ENV === "production" ? "strict" : "lax"),
            maxAge: 7 * 24 * 60 * 60 * 1000,
        };

        res.cookie("access_token", token, cookieOptions);

        const message = shouldCreateRequest
            ? "Signup successful! Your admin request has been submitted and is pending approval."
            : "Signup successful";

        return res.status(201).send({
            success: true,
            message,
            user: {
                ...user,
                pendingAdminRequest: shouldCreateRequest,
            },
        });

    } catch (error) {
        console.error("❌ Error:", error);

        return res.status(200).send({
            success: true,
            message: "Login successful",
            user: {
                ...user,
                hasPendingAdminRequest: !!pendingRequest,
            },
        });

    } catch (error) {
        console.error("❌ Error:", error);
        });

        if (userId) {
            await deleteCachedDataByPattern(`user:${userId}*`);
        }

        return res.status(200).send({
            success: true,
            message: "Logged out successfully",
        });
    } catch (error) {
        console.error("❌ Error:", error);
        return res.status(500).send({
            success: false,
            message: "Internal Server Error",
        });
    }
};

export const updateUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, department, batch, profileUrl } = req.body;

        const updated = {};
        if (name !== undefined) updated.name = name;
        if (department !== undefined) updated.department = department;
        if (batch !== undefined) updated.batch = batch;
        if (profileUrl !== undefined) updated.profileUrl = profileUrl;

        if (Object.keys(updated).length === 0) {
            return res.status(400).send({
                success: false,
                message: "Nothing to update",
            });
        }

        const [updatedUser] = await db
            .update(users)
            .set(updated)
            .where(eq(users.id, userId))
            .returning();

        const { password: _, ...userWithoutPassword } = updatedUser;

        await deleteCachedDataByPattern(`user:${userId}*`);
        await deleteCachedDataByPattern(`user:email:${updatedUser.email}*`);

        return res.status(200).send({
            success: true,
            message: "Profile updated successfully",
            user: userWithoutPassword,
        });
    } catch (error) {
        console.error("❌ Error:", error);
