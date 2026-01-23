import Router from 'express';
import {signUp, signIn, signOut, verifyEmail, forgotPassword, resetPassword} from "../controllers/auth.controller.js";

const authRouter = Router();

authRouter.post('/sign-up', signUp);
authRouter.post('/sign-in', signIn);
authRouter.post('/sign-out', signOut);
authRouter.post('/verify', verifyEmail);
authRouter.post('/forgot-password', forgotPassword);
authRouter.post('/reset-password', resetPassword);

export default  authRouter;