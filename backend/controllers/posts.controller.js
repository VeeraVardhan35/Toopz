import {db} from '../config/db.js';
import {users, universities, posts, postMedia, postLikes, postComments} from "../database/schema.js";
import {eq, and, sql, desc} from 'drizzle-orm';
import cloudinary from "../config/cloudinary.js";
import {mapCloudinaryTypeToEnum} from "../utils/mapCloudinary.js";
import {extractPublicId} from "../utils/extractPublicId.js";
import {mapEnumToCloudinaryResourceType} from "../utils/enumToCloudinary.js";
import { getCachedData, setCachedData, deleteCachedDataByPattern } from "../config/redis.js";

export const createPost = async (req, res) => {
    try {
        const { content, groupId } = req.body;
        const files = req.files;

        const authorId = req.user.id;
        const universityId = req.user.universityId;

        if (!content) {
            return res.status(400).send({ 
                success: false, 
                message: "Content is required" 
            });
        }

        if (!universityId) {
            return res.status(400).send({ 
                success: false, 
                message: "University ID not found in user profile" 
            });
        }

        const Universities = await db.select().from(universities)
            .where(eq(universities.id, universityId))
            .limit(1);
        
        if (Universities.length === 0) {
            return res.status(400).send({ 
                success: false, 
                message: "University does not exist" 
            });
        }

        const [newPost] = await db.insert(posts).values({
            universityId,
            authorId,
            groupId: groupId || null,
            content,
            updatedAt: sql`now()`
        }).returning();

        const newMedia = [];
        if (files && files.length > 0) {
            for (const file of files) {
                const upload = await cloudinary.uploader.upload(file.path, {
                    resource_type: "auto",
                    folder: "posts"
                });

                const [mediaRow] = await db.insert(postMedia).values({
                    postId: newPost.id,
                    type: upload.resource_type.toUpperCase(),
                    url: upload.secure_url,
                }).returning();

                newMedia.push({
                    id: mediaRow.id,
                    type: upload.resource_type.toUpperCase(),
                    url: upload.secure_url
                });
            }
        }

        await deleteCachedDataByPattern(`posts:*`);
        await deleteCachedDataByPattern(`userposts:${authorId}:*`);

        return res.status(201).send({
            success: true,
            message: "Post created successfully",
            post: newPost,
            media: newMedia
        });

    } catch (error) {
        return res.status(500).send({ 
            success: false, 
            message: "Internal Server Error" 
        });
    }
};

export const getAllPosts = async (req, res) => {
    try {
        const userId = req.user?.id ?? null;
        const { page = 1, limit = 10 } = req.query;
        
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const offset = (pageNum - 1) * limitNum;

        const cacheKey = `posts:page:${pageNum}:limit:${limitNum}:user:${userId}`;
        
        const cachedData = await getCachedData(cacheKey);
        if (cachedData) {
            return res.status(200).send({
                success: true,
                ...cachedData,
                cached: true,
            });
        }

        const [{ count: totalCount }] = await db
            .select({ count: sql`COUNT(*)::int` })
            .from(posts);

        const postsWithUsers = await db
            .select()
            .from(posts)
            .leftJoin(users, eq(posts.authorId, users.id))
            .orderBy(desc(posts.createdAt))
            .limit(limitNum)
            .offset(offset);

        const postIds = postsWithUsers.map(row => row.posts.id);

        let allMedia = [];
        if (postIds.length > 0) {
            allMedia = await db
                .select()
                .from(postMedia)
                .where(sql`${postMedia.postId} IN (${sql.join(postIds, sql`, `)})`);
        }

        const mediaMap = new Map();
        allMedia.forEach(media => {
            if (!mediaMap.has(media.postId)) {
                mediaMap.set(media.postId, media);
            }
        });

        let allLikes = [];
        if (postIds.length > 0) {
            allLikes = await db
                .select()
                .from(postLikes)
                .where(sql`${postLikes.postId} IN (${sql.join(postIds, sql`, `)})`);
        }

        const likesCountMap = new Map();
        const userLikesSet = new Set();

        allLikes.forEach(like => {
            likesCountMap.set(
                like.postId, 
                (likesCountMap.get(like.postId) || 0) + 1
            );
            
            if (userId && like.userId === userId) {
                userLikesSet.add(like.postId);
            }
        });

        const result = postsWithUsers.map(row => ({
            users: row.users,
            posts: row.posts,
            postMedia: mediaMap.get(row.posts.id) || null,
            likesCount: likesCountMap.get(row.posts.id) || 0,
            isLiked: userId ? userLikesSet.has(row.posts.id) : false,
        }));

        const response = {
            posts: result,
            pagination: {
                currentPage: pageNum,
                totalPages: Math.ceil(totalCount / limitNum),
                totalItems: totalCount,
                itemsPerPage: limitNum,
                hasNextPage: pageNum < Math.ceil(totalCount / limitNum),
                hasPrevPage: pageNum > 1,
            },
        };

        await setCachedData(cacheKey, response, 120);

        return res.status(200).send({
            success: true,
            ...response,
            cached: false,
        });
    } catch (error) {
        return res.status(500).send({
            success: false,
            message: "internal server error",
        });
    }
};


export const getById = async (req, res) => {
    try {
        const {id} = req.params;
        const userId = req.user?.id ?? null;

        const cacheKey = `post:${id}:user:${userId}`;
        
        const cachedData = await getCachedData(cacheKey);
        if (cachedData) {
            return res.status(200).send({
                success: true,
                ...cachedData,
                cached: true,
            });
        }

        const post = await db
            .select()
            .from(posts)
            .leftJoin(postMedia, eq(posts.id, postMedia.postId))
            .where(eq(posts.id, id));

        if (post.length === 0) {
            return res.status(404).send({
                success: false,
                message: "Post not found"
            });
        }

        const response = { post: post[0] };

        await setCachedData(cacheKey, response, 300);

        return res.status(200).send({
            success: true,
            ...response,
            cached: false,
        });
    }
    catch(error) {
        return res.status(500).send({
            success : false,
            message : "internal server error"
        })
    }
}

export const getAllPostsOfUser = async (req, res) => {
    try {
        const {id} = req.params;
        const { page = 1, limit = 10 } = req.query;
        
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const offset = (pageNum - 1) * limitNum;

        const cacheKey = `userposts:${id}:page:${pageNum}:limit:${limitNum}`;
        
        const cachedData = await getCachedData(cacheKey);
        if (cachedData) {
            return res.status(200).send({
                success: true,
                ...cachedData,
                cached: true,
            });
        }

        const [{ count: totalCount }] = await db
            .select({ count: sql`COUNT(*)::int` })
            .from(posts)
            .where(eq(posts.authorId, id));

        const post = await db.select([
            posts.id,
            posts.content,
            posts.createdAt,
            posts.updatedAt,
            postMedia.type,
            postMedia.url
        ]).from(users)
            .leftJoin(posts, eq(users.id, posts.authorId))
            .leftJoin(postMedia, eq(posts.id, postMedia.postId))
            .where(eq(id, users.id))
            .limit(limitNum)
            .offset(offset);

        const response = {
            posts: post,
            pagination: {
                currentPage: pageNum,
                totalPages: Math.ceil(totalCount / limitNum),
                totalItems: totalCount,
                itemsPerPage: limitNum,
                hasNextPage: pageNum < Math.ceil(totalCount / limitNum),
                hasPrevPage: pageNum > 1,
            },
        };

        await setCachedData(cacheKey, response, 300);

        return res.status(200).send({
            success: true,
            ...response,
            cached: false,
        });
    }
    catch(error) {
        return res.status(500).send({
            success : false,
            message : "internal server error"
        });
    }
}

export const updatePost = async (req, res) => {
    try {
        const {id} = req.params;
        const {universityId, authorId, groupId, content} = req.body;
        const files = req.files;

        const updated = {};
        if(universityId !== undefined) updated.universityId = universityId;
        if(authorId !== undefined) updated.authorId = authorId;
        if(content !== undefined) updated.content = content;
        if(groupId !== undefined) updated.groupId = groupId;

        if(Object.keys(updated).length === 0) {
            return res.status(400).send({
                success : false,
                message : "Nothing to update"
            })
        }

        const updatedPost = await db.update(posts).set(updated).where(eq(posts.id, id)).returning();

        const newMedia = [];

        if (files && files.length > 0) {
            for (const file of files) {
                const upload = await cloudinary.uploader.upload(file.path, {
                    resource_type: "auto",
                    folder: "posts",
                });

                const mediaType = mapCloudinaryTypeToEnum(
                    upload.resource_type
                );
                const [mediaRow] = await db
                    .insert(postMedia)
                    .values({
                        postId: id,
                        type: mediaType,
                        url: upload.secure_url,
                    })
                    .returning();

                newMedia.push({
                    id: mediaRow.id,
                    type: mediaType,
                    url: upload.secure_url,
                });
            }
        }

        await deleteCachedDataByPattern(`posts:*`);
        await deleteCachedDataByPattern(`post:${id}:*`);
        await deleteCachedDataByPattern(`userposts:${authorId}:*`);

        return res.status(200).send({
            success : true,
            message : "Post updated successfully",
            post : updatedPost[0],
            media : newMedia
        })
    }
    catch(error) {
        return res.status(500).send({
            success : false,
            message : "Internal Server Error"
        })
    }
}

export const deletePost = async (req, res) => {
    const {id} = req.params;
    try {
        const post = await db.select().from(posts).where(eq(posts.id, id));
        if(post.length === 0){
            return res.status(400).send({
                success : false,
                message : "post does not exist"
            });
        }

        const authorId = post[0].authorId;

        const media = await db.select().from(postMedia).where(eq(postMedia.postId, id));

        for (const mediaRow of media) {
            const publicId = extractPublicId(mediaRow.url);
            const resourceType = mapEnumToCloudinaryResourceType(mediaRow.type);
            await cloudinary.uploader.destroy(publicId, {
                resource_type: resourceType,
            });
        }

        await db.delete(postMedia).where(eq(postMedia.postId, id));
        await db.delete(posts).where(eq(posts.id, id));

        await deleteCachedDataByPattern(`posts:*`);
        await deleteCachedDataByPattern(`post:${id}:*`);
        await deleteCachedDataByPattern(`userposts:${authorId}:*`);

        return res.status(200).send({
            success : true,
            message : "successfully deleted the post"
        })
    }
    catch(err) {
        return res.status(500).send({
            success : false,
            message : "internal server error"
        })
    }
}

export const likePost = async (req, res) => {
    const {id} = req.params;
    try {
        const post = await db.select().from(posts).where(eq(posts.id, id));
        if(post.length === 0){
            return res.status(400).send({
                success : false,
                message : "post does not exist"
            });
        }

        const isExists = await db.select().from(postLikes).where(and(eq(postLikes.postId, id), eq(postLikes.userId, req.user.id)));
        if(isExists.length >= 1) return;
        
        const postLike = await db.insert(postLikes).values({
            postId : id,
            userId : req.user.id
        }).returning();

        await deleteCachedDataByPattern(`posts:*`);
        await deleteCachedDataByPattern(`post:${id}:*`);

        return res.status(200).send({
            success : true,
            message : "successfully liked the post",
            postLike : postLike,
        })
    }
    catch(err) {
        return res.status(500).send({
            success : false,
            message : "internal server error"
        })
    }
}

export const unlikePost = async (req, res) => {
    const {id} = req.params;
    try {
        const post = await db.select().from(posts).where(eq(posts.id, id));
        if(post.length === 0){
            return res.status(400).send({
                success : false,
                message : "post does not exist"
            })
        }
        const like = await db.select().from(postLikes).where(and(eq(postLikes.postId, id), eq(postLikes.userId, req.user.id)));
        if(like.length === 0){
            return res.status(400).send({
                success : false,
                message : "like does not exist"
            })
        }
        await db.delete(postLikes).where(and(eq(postLikes.postId, id), eq(postLikes.userId, req.user.id)));

        await deleteCachedDataByPattern(`posts:*`);
        await deleteCachedDataByPattern(`post:${id}:*`);

        return res.status(200).send({
            success : true,
            message : "successfully deleted the like"
        })
    }
    catch(err) {
        return res.status(500).send({
            success : false,
            message : "internal server error"
        })
    }
}


export const getAllLikes = async (req, res) => {
    const {id} = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    try {
        const post = await db.select().from(posts).where(eq(posts.id, id));
        if(post.length === 0){
            return res.status(400).send({
                success : false,
                message : "post does not exist"
            })
        }

        const cacheKey = `postlikes:${id}:page:${pageNum}:limit:${limitNum}`;
        
        const cachedData = await getCachedData(cacheKey);
        if (cachedData) {
            return res.status(200).send({
                success: true,
                ...cachedData,
                cached: true,
            });
        }

        const [{ count: totalCount }] = await db
            .select({ count: sql`COUNT(*)::int` })
            .from(postLikes)
            .where(eq(postLikes.postId, id));

        const likes = await db
            .select()
            .from(postLikes)
            .where(eq(postLikes.postId, id))
            .limit(limitNum)
            .offset(offset);

        const response = {
            likes,
            count: totalCount,
            pagination: {
                currentPage: pageNum,
                totalPages: Math.ceil(totalCount / limitNum),
                totalItems: totalCount,
                itemsPerPage: limitNum,
                hasNextPage: pageNum < Math.ceil(totalCount / limitNum),
                hasPrevPage: pageNum > 1,
            },
        };

        await setCachedData(cacheKey, response, 120);

        res.status(200).send({
            success : true,
            message : "successfully retrieved all the likes of the post",
            ...response,
            cached: false,
        });

    }
    catch(err) {
        res.status(500).send({
            success : false,
            message : "internal server error"
        });
    }
}

export const commentPost = async (req, res) => {
    const {id} = req.params;
    const {content} = req.body;
    try {
        if(!content) return res.status(400).send({
            success : false,
            message : "Fill all the required fields"
        })

        const post = await db.select().from(posts).where(eq(posts.id, id));
        if(post.length === 0){
            return res.status(400).send({
                success : false,
                message : "post does not exist"
            })
        }

        const comment = await db.insert(postComments).values({
            postId : id,
            authorId : req.user.id,
            content : content
        }).returning();

        const user = await db
            .select({
                id: users.id,
                name: users.name,
                email: users.email,
                profileUrl: users.profileUrl
            })
            .from(users)
            .where(eq(users.id, req.user.id))
            .limit(1);

        const commentWithAuthor = {
            ...comment[0],
            author: user[0]
        };

        await deleteCachedDataByPattern(`postcomments:${id}:*`);

        return res.status(200).send({
            success : true,
            message : "successfully commented",
            comment : [commentWithAuthor]
        });
    }
     catch(err) {
        res.status(500).send({
            success : false,
            message : "internal server error"
        });
    }
}

export const deleteComment = async (req, res) => {
    const {id, commentId} = req.params;
    try {
        const post = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
        if(post.length === 0){
            return res.status(400).send({
                success : false,
                message : "post does not exist"
            })
        }

        const comment = await db.select().from(postComments).where(eq(postComments.id, commentId)).limit(1);
        if(comment.length === 0) {
            return res.status(400).send({
                success : false,
                message : "comment does not exist"
            })
        }

        const isCommentAuthor = comment[0].authorId === req.user.id;
        const isPostAuthor = post[0].authorId === req.user.id;

        if (!isCommentAuthor && !isPostAuthor) {
            return res.status(403).send({
                success: false,
                message: "You are not authorized to delete this comment"
            });
        }

        await db.delete(postComments).where(eq(postComments.id, commentId));

        await deleteCachedDataByPattern(`postcomments:${id}:*`);
        
        return res.status(200).send({
            success : true,
            message : "successfully deleted the comment"
        })
    }
    catch(err) {
        res.status(500).send({
            success : false,
            message : "internal server error"
        });
    }
}

export const getAllComments = async(req, res) => {
    const {id} = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    try {
        const post = await db.select().from(posts).where(eq(posts.id, id));
        if(post.length === 0){
            return res.status(400).send({
                success : false,
                message : "post does not exist"
            })
        }

        const cacheKey = `postcomments:${id}:page:${pageNum}:limit:${limitNum}`;
        
        const cachedData = await getCachedData(cacheKey);
        if (cachedData) {
            return res.status(200).send({
                success: true,
                ...cachedData,
                cached: true,
            });
        }

        const [{ count: totalCount }] = await db
            .select({ count: sql`COUNT(*)::int` })
            .from(postComments)
            .where(eq(postComments.postId, id));
        
        const commentsData = await db
            .select()
            .from(postComments)
            .leftJoin(users, eq(postComments.authorId, users.id))
            .where(eq(postComments.postId, id))
            .orderBy(desc(postComments.createdAt))
            .limit(limitNum)
            .offset(offset);

        const comments = commentsData.map(row => ({
            id: row.postComments?.id || row.post_comments?.id,
            postId: row.postComments?.postId || row.post_comments?.postId,
            content: row.postComments?.content || row.post_comments?.content,
            createdAt: row.postComments?.createdAt || row.post_comments?.createdAt,
            updatedAt: row.postComments?.updatedAt || row.post_comments?.updatedAt,
            author: {
                id: row.users?.id,
                name: row.users?.name,
                email: row.users?.email,
                profileUrl: row.users?.profileUrl
            }
        }));

        const response = {
            comments,
            count: totalCount,
            pagination: {
                currentPage: pageNum,
                totalPages: Math.ceil(totalCount / limitNum),
                totalItems: totalCount,
                itemsPerPage: limitNum,
                hasNextPage: pageNum < Math.ceil(totalCount / limitNum),
                hasPrevPage: pageNum > 1,
            },
        };

        await setCachedData(cacheKey, response, 120);
        
        return res.status(200).send({
            success : true,
            message : "successfully retrieved all the comments",
            ...response,
            cached: false,
        });
    }
    catch(err) {
        res.status(500).send({
            success : false,
            message : "internal server error"
        });
    }
}