import jwt from "jsonwebtoken";
import { JWT_SECRET, JWT_EXPIRESIN } from "../config/env.js";

export const generateToken = (payload) => {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRESIN,
    });
};
