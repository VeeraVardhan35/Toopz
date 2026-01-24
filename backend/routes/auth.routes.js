import Router from 'express';
import {signUp, signIn, signOut, verifyEmail, forgotPassword, resetPassword} from "../controllers/auth.controller.js";
import {authenticate} from "../middleware/auth.middleware.js";
import { db } from '../config/db.js';
import { users } from '../database/schema.js';
import {eq} from 'drizzle-orm';

const authRouter = Router();

authRouter.post('/sign-up', signUp);
authRouter.post('/sign-in', signIn);
authRouter.post('/sign-out', signOut);
authRouter.post('/verify', verifyEmail);
authRouter.post('/forgot-password', forgotPassword);
authRouter.post('/reset-password', resetPassword);
authRouter.get("/check", authenticate, async (req, res) => {
    try {
        const user = await db.select().from(users).where(eq(users.id, req.user.id));
        res.status(200).send({
            message : "user is authenticated",
            user : user[0]
        })
    }
    catch(err){
        res.status(500).send({
            message:"internal server error",
            error : err.message
        })
    }
});

export default  authRouter;