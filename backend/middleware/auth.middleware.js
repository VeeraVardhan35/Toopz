import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env.js";

export const authenticate = (req, res, next) => {
    try {
        // 1️⃣ Read token from cookie
        const token = req.cookies?.access_token;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        // 2️⃣ Verify token
        const decoded = jwt.verify(token, JWT_SECRET);

        // 3️⃣ Attach user info to request
        req.user = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role,
            universityId: decoded.universityId,
        };

        next();
    } catch (error) {
        console.log("error in auth Middleware", error);
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token",
        });
    }
};
