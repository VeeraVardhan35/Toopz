import {Router} from 'express';
import upload from '../middleware/upload.js';
import {createPost, getAllPosts, getById, getAllPostsOfUser, updatePost, deletePost} from "../controllers/posts.controller.js";
const postRouter = Router();


postRouter.get('/', getAllPosts);
postRouter.post('/', upload.array("media", 5), createPost);
postRouter.get('/:id/', getById);
postRouter.get('/user/:id/', getAllPostsOfUser);
postRouter.put("/:id/", upload.array('media', 5),  updatePost);
postRouter.delete("/:id/", deletePost);


export default  postRouter;