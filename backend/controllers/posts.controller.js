import {db} from '../config/db.js';
import {users, universities, posts, postMedia} from "../database/schema.js";
import {eq, sql} from 'drizzle-orm';
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
        const rows = await db.select().from(posts).leftJoin(postMedia, eq(posts.id, postMedia.postId));
        // const media = await db.select().from(postMedia);
        return res.status(200).send({
            success : true,
            message : "Successfully retrieved all the posts",
            posts : rows
        });
    }
    catch(error){
        console.log("error in getting posts", error);
        return res.status(500).send({
            success : false,
            message : "internal server error"
        })
    }
}

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