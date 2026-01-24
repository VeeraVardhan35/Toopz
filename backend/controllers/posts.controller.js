import {db} from '../config/db.js';
import {users, universities, posts, postMedia, postLikes, postComments} from "../database/schema.js";
import {eq, and, sql, desc} from 'drizzle-orm';
import cloudinary from "../config/cloudinary.js";
import {mapCloudinaryTypeToEnum} from "../utils/mapCloudinary.js";
import {extractPublicId} from "../utils/extractPublicId.js";
import {mapEnumToCloudinaryResourceType} from "../utils/enumToCloudinary.js";

export const createPost = async (req, res) => {
    try {
        const { universityId, authorId, groupId, content } = req.body;
        const files = req.files;

        if (!universityId || !authorId || !content) {
            return res.status(400).send({ success: false, message: "Fill all the required fields" });
        }

        const Universities = await db.select().from(universities).where(eq(universities.id, universityId)).limit(1);
        if (Universities.length === 0) return res.status(400).send({ success: false, message: "University does not exist" });

        const Users = await db.select().from(users).where(eq(users.id, authorId)).limit(1);
        if (Users.length === 0) return res.status(400).send({ success: false, message: "User does not exist" });

        const [newPost] = await db.insert(posts).values({
            universityId,
            authorId,
            groupId: groupId || null,
            content,
            updatedAt : sql`now()`
        }).returning();

        // Insert media
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

        return res.status(201).send({
            success: true,
            message: "Post created Successfully",
            post: newPost,
            media: newMedia
        });

    } catch (error) {
        console.log("error in creating post", error);
        return res.status(500).send({ success: false, message: "Internal Server Error" });
    }
};

export const getAllPosts = async (req, res) => {
    try {
        const userId = req.user?.id ?? null;
        
        // DEBUG: Log the user ID
        console.log("🔍 User ID from req.user:", userId);
        console.log("🔍 Full req.user:", req.user);

        // Get all posts with users
        const postsWithUsers = await db
            .select()
            .from(posts)
            .leftJoin(users, eq(posts.authorId, users.id))
            .orderBy(desc(posts.createdAt));

        const postIds = postsWithUsers.map(row => row.posts.id);

        // Batch fetch all media
        const allMedia = await db
            .select()
            .from(postMedia)
            .where(sql`${postMedia.postId} IN ${postIds}`);

        const mediaMap = new Map();
        allMedia.forEach(media => {
            if (!mediaMap.has(media.postId)) {
                mediaMap.set(media.postId, media);
            }
        });

        // Batch fetch all likes
        const allLikes = await db
            .select()
            .from(postLikes)
            .where(sql`${postLikes.postId} IN ${postIds}`);

        // DEBUG: Log all likes
        console.log("🔍 All likes:", allLikes);

        const likesCountMap = new Map();
        const userLikesSet = new Set();

        allLikes.forEach(like => {
            likesCountMap.set(
                like.postId, 
                (likesCountMap.get(like.postId) || 0) + 1
            );
            
            if (userId && like.userId === userId) {
                console.log(`✅ User ${userId} liked post ${like.postId}`);
                userLikesSet.add(like.postId);
            }
        });

        // DEBUG: Log which posts user liked
        console.log("🔍 Posts user liked:", Array.from(userLikesSet));

        const result = postsWithUsers.map(row => ({
            users: row.users,
            posts: row.posts,
            postMedia: mediaMap.get(row.posts.id) || null,
            likesCount: likesCountMap.get(row.posts.id) || 0,
            isLiked: userId ? userLikesSet.has(row.posts.id) : false,
        }));

        // DEBUG: Log final result for first post
        console.log("🔍 First post result:", result[0]);

        return res.status(200).send({
            success: true,
            posts: result,
        });
    } catch (error) {
        console.log("error in getting posts", error);
        return res.status(500).send({
            success: false,
            message: "internal server error",
        });
    }
};


export const getById = async (req, res) => {
    try {
        const {id} = req.params;
        const post = await db.select().from(posts).leftJoin(postMedia, (eq(posts.id, postMedia.postId))).where(eq(posts.id, id));
        return res.status(200).send({
            success : true,
            message : "post successfully retrieved",
            post : post[0]
        });
    }
    catch(error) {
        console.log("error in retrieving posts", error);
        return res.status(500).send({
            success : false,
            message : "internal server error"
        })
    }
}

export const getAllPostsOfUser = async (req, res) => {
    try {
        const {id} = req.params;
        const post = await db.select([
            posts.id,
            posts.content,
            posts.createdAt,
            posts.updatedAt,
            postMedia.type,
            postMedia.url
        ]).from(users).leftJoin(posts, eq(users.id, posts.authorId)).leftJoin(postMedia, eq(posts.id, postMedia.postId))
            .where(eq(id, users.id));
        return res.status(200).send({
            success : true,
            message : "posts successfully retrieved",
            posts : post
        });
    }
    catch(error) {
        console.log("error in retrieving posts", error);
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

        if(updated.length === 0) {
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
                    upload.resource_type,
                    file.mimetype
                );

                const [mediaRow] = await db.insert(postMedia).values({
                    postId: updatedPost[0].id,
                    type: mediaType,
                    url: upload.secure_url,
                }).returning();

                newMedia.push(mediaRow);
            }
        }


        return res.status(200).send({
            success : true,
            message : "updated Successfully",
            updatedPosts : updatedPost,
            updatedMedia : newMedia
        });
    }
    catch(error) {
        console.log("error in retrieving posts", error);
        return res.status(500).send({
            success : false,
            message : "internal server error"
        });
    }

};

export const deletePost = async (req, res) => {
    const { id } = req.params;

    try {
        await db.transaction(async (tx) => {
            // 1️⃣ Check post exists
            const [post] = await tx
                .select()
                .from(posts)
                .where(eq(posts.id, id));

            if (!post) {
                throw new Error("POST_NOT_FOUND");
            }

            // 2️⃣ Get all media
            const media = await tx
                .select()
                .from(postMedia)
                .where(eq(postMedia.postId, id));

            // 3️⃣ Delete from Cloudinary

            for (const m of media) {
                const publicId = extractPublicId(m.url);

                const resourceType = mapEnumToCloudinaryResourceType(m.type);

                await cloudinary.uploader.destroy(publicId, {
                    resource_type: resourceType
                });
            }


            // 4️⃣ Delete media rows
            await tx.delete(postMedia).where(eq(postMedia.postId, id));

            // 5️⃣ Delete post
            await tx.delete(posts).where(eq(posts.id, id));
        });

        return res.status(200).json({
            success: true,
            message: "Post deleted successfully",
        });

    } catch (error) {
        console.error("Delete post error:", error);

        if (error.message === "POST_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Post not found",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

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
        return res.status(200).send({
            success : true,
            message : "successfully liked the post",
            postLike : postLike,
            
        })
    }
    catch(err) {
        console.log("error in liking post", err);
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
        return res.status(200).send({
            success : true,
            message : "successfully deleted the like"
        })
    }
    catch(err) {
        console.log("error is unliking the post", err);
        return res.status(500).send({
            success : false,
            message : "internal server error"
        })
    }
}


export const getAllLikes = async (req, res) => {
    const {id} = req.params;
    try {
        const post = await db.select().from(posts).where(eq(posts.id, id));
        if(post.length === 0){
            return res.status(400).send({
                success : false,
                message : "post does not exist"
            })
        }

        const likes = await db.select().from(postLikes).where(eq(postLikes.postId, id));
        res.status(200).send({
            success : true,
            message : "successfully retrieved all the likes of the post",
            likes : likes,
            count : likes.length
        });

    }
    catch(err) {
        console.log("error in getting all the likes", err);
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

        // Fetch the author info
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

        // Return comment with author info
        const commentWithAuthor = {
            ...comment[0],
            author: user[0]
        };

        return res.status(200).send({
            success : true,
            message : "successfully commented",
            comment : [commentWithAuthor]
        });
    }
     catch(err) {
        console.log("error in commenting the post", err);
        res.status(500).send({
            success : false,
            message : "internal server error"
        });
    }
}

export const deleteComment = async (req, res) => {
    const {id, commentId} = req.params;
    try {
        // Check if post exists
        const post = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
        if(post.length === 0){
            return res.status(400).send({
                success : false,
                message : "post does not exist"
            })
        }

        // Check if comment exists and get its details
        const comment = await db.select().from(postComments).where(eq(postComments.id, commentId)).limit(1);
        if(comment.length === 0) {
            return res.status(400).send({
                success : false,
                message : "comment does not exist"
            })
        }

        // Authorization: Only comment author or post author can delete
        const isCommentAuthor = comment[0].authorId === req.user.id;
        const isPostAuthor = post[0].authorId === req.user.id;

        if (!isCommentAuthor && !isPostAuthor) {
            return res.status(403).send({
                success: false,
                message: "You are not authorized to delete this comment"
            });
        }

        // Delete the comment
        await db.delete(postComments).where(eq(postComments.id, commentId));
        
        return res.status(200).send({
            success : true,
            message : "successfully deleted the comment"
        })
    }
    catch(err) {
        console.log("error in deleting the comment", err);
        res.status(500).send({
            success : false,
            message : "internal server error"
        });
    }
}

export const getAllComments = async(req, res) => {
    const {id} = req.params;
    try {
        const post = await db.select().from(posts).where(eq(posts.id, id));
        if(post.length === 0){
            return res.status(400).send({
                success : false,
                message : "post does not exist"
            })
        }
        
        // Join with users table to get author info
        const commentsData = await db
            .select()
            .from(postComments)
            .leftJoin(users, eq(postComments.authorId, users.id))
            .where(eq(postComments.postId, id))
            .orderBy(desc(postComments.createdAt));

        console.log("🔍 Comments data:", commentsData);
        console.log("🔍 First comment:", commentsData[0]);

        // Format the response to match frontend expectations
        // The key name depends on your schema definition
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

        console.log("🔍 Formatted comments:", comments);
        
        return res.status(200).send({
            success : true,
            message : "successfully retrieved all the comments",
            comments : comments,
            count : comments.length
        });
    }
    catch(err) {
        console.log("error in getting comments", err);
        res.status(500).send({
            success : false,
            message : "internal server error"
        });
    }
}