import {db} from "../config/db.js";
import {eq} from 'drizzle-orm';
import {users, universities, pendingAdminRequests}  from "../database/schema.js";
import {generateToken} from "../utils/jwt.js";
import bcrypt from 'bcrypt';
import {NODE_ENV} from "../config/env.js";
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

        res.cookie("access_token", token, {
            httpOnly: true,
            secure: NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

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
        return res.status(500).send({
            success: false,
            message: "Internal Server Error",
        });
    }
};

export const signIn = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).send({
                success: false,
                message: "All fields are required",
            });
        }

        const userResult = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

        if (userResult.length === 0) {
            return res.status(400).send({
                success: false,
                message: "Invalid credentials",
            });
        }

        const user = userResult[0];

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(400).send({
                success: false,
                message: "Invalid credentials",
            });
        }

        const [pendingRequest] = await db
            .select()
            .from(pendingAdminRequests)
            .where(
                eq(pendingAdminRequests.userId, user.id),
                eq(pendingAdminRequests.status, "pending")
            )
            .limit(1);

        const token = generateToken({
            id: user.id,
            email: user.email,
            role: user.role,
            universityId: user.universityId,
        });

        res.cookie("access_token", token, {
            httpOnly: true,
            secure: NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.status(200).send({
            success: true,
            message: "Login successful",
            user: {
                ...user,
                hasPendingAdminRequest: !!pendingRequest,
            },
        });

    } catch (error) {
        return res.status(500).send({
            success: false,
            message: "Internal Server Error",
        });
    }
};





export const signOut = async (req, res) => {
    try {
        const userId = req.user?.id;

        res.clearCookie("access_token", {
            httpOnly: true,
            secure: NODE_ENV === "production",
            sameSite: "strict",
        });

        if (userId) {
            await deleteCachedDataByPattern(`user:${userId}*`);
        }

        return res.status(200).send({
            success: true,
            message: "Logged out successfully",
        });
    } catch (error) {
        return res.status(500).send({
            success: false,
            message: "Internal Server Error",
        });
    }
};

export const getCurrentUser = async (req, res) => {
    try {
        const userId = req.user.id;

        const cacheKey = `user:${userId}`;

        const cachedData = await getCachedData(cacheKey);
        if (cachedData) {
            return res.status(200).send({
                success: true,
                user: cachedData,
                cached: true,
            });
        }

        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.id, userId));

        if (!user) {
            return res.status(404).send({
                success: false,
                message: "User not found",
            });
        }

        const { password: _, ...userWithoutPassword } = user;

        await setCachedData(cacheKey, userWithoutPassword, 3600);

        return res.status(200).send({
            success: true,
            user: userWithoutPassword,
            cached: false,
        });
    } catch (error) {
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
        return res.status(500).send({
            success: false,
            message: "Internal Server Error",
        });
    }
};

export const verifyEmail = (req, res) => res.send("verify email endpoint");
export const forgotPassword = (req, res) => res.send("forget Password endpoint");
export const resetPassword = (req, res) => res.send("reset Password endpoint");