import {db} from "../config/db.js";
import {eq} from 'drizzle-orm';
import {users, universities}  from "../database/schema.js";
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
            profileUrl
        } = req.body;

        if (!role || (role === 'universalAdmin' && (!name || !email || !password))) {
            return res.status(400).send({
                success: false,
                message: "Fill all the required fields",
            });
        }
        else if (!role || (role === 'admin' && (!name || !email || !password || !universityId))) {
            return res.status(400).send({
                success: false,
                message: "Fill all the required fields",
            });
        }
        else if (!role || ( role === 'professor' && (!name || !email || !password || !universityId || !role || !department))) {
            return res.status(400).send({
                success: false,
                message: "Fill all the required fields",
            });
        }
        else if(!name || !email || !password || !universityId || !role || !department || !batch) {
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

        const isUniversityExists = await db
            .select()
            .from(universities)
            .where(eq(universities.id, universityId))
            .limit(1);

        if (!isUniversityExists.length) {
            return res.status(400).send({
                success: false,
                message: "University does not exist",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const [user] = await db.insert(users).values({
            name,
            email,
            password: hashedPassword,
            universityId,
            role,
            department,
            batch,
            profileUrl: profileUrl || null,
        }).returning();

        // Create token
        const token = generateToken({
            id: user.id,
            email: user.email,
            role: user.role,
            universityId: user.universityId,
        });

        // Set cookie
        res.cookie("access_token", token, {
            httpOnly: true,
            secure: NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        // Cache user data (without password)
        const { password: _, ...userWithoutPassword } = user;
        await setCachedData(`user:${user.id}`, userWithoutPassword, 3600);
        await setCachedData(`user:email:${user.email}`, userWithoutPassword, 3600);

        return res.status(201).send({
            success: true,
            message: "Signup successful",
            user: userWithoutPassword,
        });

    } catch (error) {
        console.log("error in signing up", error);
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

        // Try to get user from cache first
        let user = await getCachedData(`user:email:${email}`);
        
        if (!user) {
            // If not in cache, fetch from database
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

            user = userResult[0];
            
            // Cache the user data
            const { password: _, ...userWithoutPassword } = user;
            await setCachedData(`user:${user.id}`, userWithoutPassword, 3600);
            await setCachedData(`user:email:${user.email}`, userWithoutPassword, 3600);
        } else {
            // If from cache, we need to fetch the password from DB for comparison
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
            user = userResult[0];
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(400).send({
                success: false,
                message: "Invalid credentials",
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

        // Return user without password
        const { password: _, ...userWithoutPassword } = user;

        return res.status(200).send({
            success: true,
            message: "Login successful",
            user: userWithoutPassword,
        });

    } catch (error) {
        console.log("error in signing in", error);
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

        // Optionally clear user cache on sign out
        if (userId) {
            await deleteCachedDataByPattern(`user:${userId}*`);
        }

        return res.status(200).send({
            success: true,
            message: "Logged out successfully",
        });
    } catch (error) {
        console.log("error in signing out", error);
        return res.status(500).send({
            success: false,
            message: "Internal Server Error",
        });
    }
};

// Get current user with caching
export const getCurrentUser = async (req, res) => {
    try {
        const userId = req.user.id;

        // Create cache key
        const cacheKey = `user:${userId}`;
        
        // Check cache
        const cachedData = await getCachedData(cacheKey);
        if (cachedData) {
            return res.status(200).send({
                success: true,
                user: cachedData,
                cached: true,
            });
        }

        // Fetch from database if not in cache
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

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;

        // Cache the result for 1 hour
        await setCachedData(cacheKey, userWithoutPassword, 3600);

        return res.status(200).send({
            success: true,
            user: userWithoutPassword,
            cached: false,
        });
    } catch (error) {
        console.log("error in getting current user", error);
        return res.status(500).send({
            success: false,
            message: "Internal Server Error",
        });
    }
};

// Update user profile
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

        // Remove password from response
        const { password: _, ...userWithoutPassword } = updatedUser;

        // Invalidate cache
        await deleteCachedDataByPattern(`user:${userId}*`);
        await deleteCachedDataByPattern(`user:email:${updatedUser.email}*`);

        return res.status(200).send({
            success: true,
            message: "Profile updated successfully",
            user: userWithoutPassword,
        });
    } catch (error) {
        console.log("error in updating user profile", error);
        return res.status(500).send({
            success: false,
            message: "Internal Server Error",
        });
    }
};

export const verifyEmail = (req, res) => res.send("verify email endpoint");
export const forgotPassword = (req, res) => res.send("forget Password endpoint");
export const resetPassword = (req, res) => res.send("reset Password endpoint");