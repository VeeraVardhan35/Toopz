import {db} from "../config/db.js";
import {eq} from 'drizzle-orm';
import {users, universities}  from "../database/schema.js";
import {generateToken} from "../utils/jwt.js";
import bcrypt from 'bcrypt';
import {NODE_ENV} from "../config/env.js";

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

        // ✅ Create token
        const token = generateToken({
            id: user.id,
            email: user.email,
            role: user.role,
            universityId: user.universityId,
        });

        // ✅ Set cookie HERE
        res.cookie("access_token", token, {
            httpOnly: true,
            secure: NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.status(201).send({
            success: true,
            message: "Signup successful",
            user,
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
            user,
        });

    } catch (error) {
        console.log("error in signing in", error);
        return res.status(500).send({
            success: false,
            message: "Internal Server Error",
        });
    }
};

export const signOut = (req, res) => {
    res.clearCookie("access_token", {
        httpOnly: true,
        secure: NODE_ENV === "production",
        sameSite: "strict",
    });

    return res.status(200).send({
        success: true,
        message: "Logged out successfully",
    });
};

export const verifyEmail = (req, res) => res.send("verify email endpoint");
export const forgotPassword = (req, res) => res.send("forget Password endpoint");
export const resetPassword = (req, res) => res.send("reset Password endpoint");