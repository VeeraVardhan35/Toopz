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
        console.error("❌ Error:", error);
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
        console.error("❌ Error:", error);
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
        console.error("❌ Error:", error);
