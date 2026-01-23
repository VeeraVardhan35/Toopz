import {db} from '../config/db.js';
import {groupMembers, groups, universities, posts, postMedia} from "../database/schema.js";
import {eq, and} from "drizzle-orm";

export const joinGroup = async(req, res) => {
    try {
        const {id} = req.params;
        const {role} = req.body;
        const user = req.user;

        if(!role) return res.status(400).send({
            success : false,
            message : "Your role is not selected"
        })

        const group = await db.select().from(groups).where(eq(groups.id, id));
        if(group.length === 0){
            return res.status(400).send({
                sucess : false,
                message : "No group found"
            })
        }

        if(group[0].universityId !== user.universityId){
            return res.status(401).send({
                success : false,
                message : "You are not authorized"
            })
        }

        const isUserExists = await db.select().from(groupMembers)
            .where(and(eq(groupMembers.groupId, id), eq(groupMembers.userId, user.id)));

        if(isUserExists.length > 0){
            return res.status(400).send({
                success : false,
                message : "You are already a member of this group"
            })
        }
        const GroupMember = await db.insert(groupMembers).values({
            groupId : id,
            userId : user.id,
            role : role
        }).returning();

        return res.status(201).send({
            success : true,
            message : "joined successfully",
            GroupMember : GroupMember,
            group : group[0]
        });
    }
    catch(error) {
        console.log("error in joining group", error);
        return res.status(500).send({
            success : false,
            message : "internal server error"
        })
    }
}

export const exitGroup = async(req, res) => {
    try{
        const user = req.user;
        const {groupId} = req.params;

        const membership = await db.select().from(groupMembers).where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, user.id)));
        if(membership.length === 0) {
            return res.status(400).send({
                success : false,
                message : "You are not member of this group"
            })
        }

        const admins = await db.select().from(groupMembers)
            .where(and(eq(groupMembers.groupId, groupId),eq(groupMembers.role, 'admin')));

        if(admins.length <= 1) {
            res.status(400).send({
                success : false,
                message : "transfer ownership before leaving"
            });
        }

         await db.delete(groupMembers)
            .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, user.id)));

        res.status(200).send({
            success : true,
            message : "successfully left the group",

        });
    }
    catch(error) {
        console.error("error in leaving the group", error);
        res.status(500).send({
            success : false,
            message : "internal server error"
        });
    }
};


export const createGroup = async (req, res) => {
    try {
        const {universityId, name, type} = req.body;
        const user = req.user;
        // const user = await db.select().from(users).where(eq(users.id, id)).limit(1);
        // const validUser = user[0];
        if(!universityId || !name || !type){
            return res.status(400).send({
                success : false,
                message : "fill all the required fields"
            })
        }
        const university = await db.select().from(universities).where(eq(universities.id, universityId));
        if(university.length === 0) {
            return res.status(400).send({
                success : false,
                message : "University not found"
            })
        }
        if(user.universityId !== universityId) {
            return res.status(401).send({
                success : false,
                message : "you are not authorized"
            });
        }
        const saved = await db.insert(groups).values({
            universityId : universityId,
            name : name,
            type : type,
            createdBy : user.id
        }).returning();
        res.status(201).send({
            success : true,
            message : "group successfully created",
            saved : saved
        });
    }
    catch(error) {
        console.log("error in creating group", error);
        return res.status(500).send({
            success : false,
            message : "internal server error"
        })
    }
}
export const getGroupMembers = async(req, res) => {
    try {
        const {groupId} = req.params;
        const isGroupExists = await db.select().from(groups).where(eq(groups.id, groupId)).limit(1);
        if(isGroupExists.length === 0){
            return res.status(400).send({
                success : false,
                message : "group does not exists"
            });
        }
        const allGroupMembers = await db.select().from(groupMembers).where(eq(groups.id, groupId));
        return res.send({
            success : true,
            message : "successfully retrieved group members",
            groupMembers : allGroupMembers
        });
    }
    catch(error){
        console.log("error in retrieving groupMembers", error);
        return res.status(500).send({
            success : false,
            message : "internal server error"
        })
    }
};
export const addMember = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { userId, role = "MEMBER" } = req.body;
        const requester = req.user;

        // Check group exists
        const group = await db.select().from(groups).where(eq(groups.id, groupId)).limit(1);
        if (!group.length) return res.status(404).json({ success: false, message: "Group not found" });

        // Check requester role in group
        const requesterMembership = await db.select()
            .from(groupMembers)
            .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, requester.id)))
            .limit(1);

        if (requesterMembership.length === 0) {
            return res.status(403).json({ success: false, message: "Not authorized to add members" });
        }

        const existingMember = await db.select()
            .from(groupMembers)
            .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, userId)))
            .limit(1);

        if (existingMember.length) return res.status(400).json({ success: false, message: "User already a member" });

        const [member] = await db.insert(groupMembers).values({ groupId, userId, role }).returning();

        return res.status(201).json({ success: true, message: "Member added successfully", member });
    } catch (error) {
        console.error("Add member error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const removeMember = async (req, res) => {
    try {
        const { groupId, userId } = req.params;
        const requester = req.user;

        const requesterMembership = await db.select()
            .from(groupMembers)
            .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, requester.id)))
            .limit(1);

        if (!requesterMembership.length || !["admin","coordinator", "co-coordinator", "captain"].includes(requesterMembership[0].role)) {
            return res.status(403).json({ success: false, message: "Not authorized to remove members" });
        }

        if (requester.id === userId) return res.status(400).json({ success: false, message: "Use exit group to leave" });

        const member = await db.select()
            .from(groupMembers)
            .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, userId)))
            .limit(1);

        if (!member.length) return res.status(404).json({ success: false, message: "Member not found" });

        await db.delete(groupMembers).where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, userId)));

        return res.status(200).json({ success: true, message: "Member removed successfully" });
    } catch (error) {
        console.error("Remove member error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const promote = async (req, res) => {
    try {
        const { groupId, userId } = req.params;
        const { newRole } = req.body; // ADMIN / MODERATOR / MEMBER
        const requester = req.user;

        const requesterMembership = await db.select()
            .from(groupMembers)
            .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, requester.id)))
            .limit(1);

        if (!requesterMembership.length || requesterMembership[0].role !== "admin") {
            return res.status(403).json({ success: false, message: "Only ADMIN can promote/demote" });
        }

        const member = await db.select()
            .from(groupMembers)
            .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, userId)))
            .limit(1);

        if (!member.length) return res.status(404).json({ success: false, message: "Member not found" });

        const [updated] = await db.update(groupMembers)
            .set({ role: newRole })
            .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, userId)))
            .returning();

        return res.status(200).json({ success: true, message: "Member role updated", updated });
    } catch (error) {
        console.error("Promote/Demote error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const updateGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { name, type } = req.body;
        const requester = req.user;

        const requesterMembership = await db.select()
            .from(groupMembers)
            .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, requester.id)))
            .limit(1);

        if (!requesterMembership.length || !["admin","coordinator", "co-coordinator", "captain"].includes(requesterMembership[0].role)) {
            return res.status(403).json({ success: false, message: "Not authorized to update group" });
        }

        const updatedData = {};
        if (name) updatedData.name = name;
        if (type) updatedData.type = type;

        if (Object.keys(updatedData).length === 0)
            return res.status(400).json({ success: false, message: "Nothing to update" });

        const [updatedGroup] = await db.update(groups)
            .set(updatedData)
            .where(eq(groups.id, groupId))
            .returning();

        return res.status(200).json({ success: true, message: "Group updated", updatedGroup });
    } catch (error) {
        console.error("Update group error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const getALLGroups = async (req, res) => {
    try {
        const groupsList = await db.select().from(groups);
        return res.status(200).json({ success: true, groups: groupsList });
    } catch (error) {
        console.error("Get all groups error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const getAllPosts = async (req, res) => {
    try {
        const { groupId } = req.params;
        const postsList = await db.select()
            .from(posts)
            .leftJoin(postMedia, eq(posts.id, postMedia.postId))
            .where(eq(posts.groupId, groupId));

        return res.status(200).json({ success: true, posts: postsList });
    } catch (error) {
        console.error("Get group posts error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};



