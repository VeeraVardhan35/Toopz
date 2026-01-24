import {Router} from 'express';
import upload from '../middleware/upload.js';
import {
    createPost,
    getAllPosts,
    getById,
    getAllPostsOfUser,
    updatePost,
    deletePost,
    likePost,
    unlikePost,
    getAllLikes,
    commentPost,
    deleteComment,
    getAllComments
} from "../controllers/posts.controller.js";
import {authenticate} from "../middleware/auth.middleware.js";
const postRouter = Router();


postRouter.get('/', authenticate,  getAllPosts);
postRouter.post('/', upload.array("media", 5), createPost);
postRouter.get('/:id/', getById);
postRouter.get('/user/:id/', getAllPostsOfUser);
postRouter.put("/:id/", upload.array('media', 5),  updatePost);
postRouter.delete("/:id/", deletePost);
postRouter.post('/:id/like', authenticate, likePost);
postRouter.delete("/:id/like", authenticate, unlikePost);
postRouter.get('/:id/like', authenticate, getAllLikes);
postRouter.post('/:id/comment', authenticate, commentPost);
postRouter.delete('/:id/comment/:commentId', authenticate,  deleteComment);
postRouter.get('/:id/comments', authenticate, getAllComments);


export default  postRouter;