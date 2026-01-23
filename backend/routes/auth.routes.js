import Router from 'express';
import {signUp, signIn, signOut, verifyEmail, forgotPassword, resetPassword} from "../controllers/auth.controller.js";
import {authenticate} from "../middleware/auth.middleware.js";

const authRouter = Router();

authRouter.post('/sign-up', signUp);
authRouter.post('/sign-in', signIn);
authRouter.post('/sign-out', signOut);
authRouter.post('/verify', verifyEmail);
authRouter.post('/forgot-password', forgotPassword);
authRouter.post('/reset-password', resetPassword);
authRouter.get("/check", authenticate, (req, res) => {
    try {
        res.status(200).send({
            message : "user is authenticated",
            user : req.user
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