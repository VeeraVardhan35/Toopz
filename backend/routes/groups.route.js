import {Router} from 'express';
import {joinGroup, exitGroup, createGroup, getGroupMembers, addMember, removeMember, promote, updateGroup, getALLGroups, getAllPosts} from '../controllers/groups.controller.js';
import {authenticate} from "../middleware/auth.middleware.js";

export const groupsRoute = Router();

groupsRoute.post('/:id/join', authenticate,  joinGroup);
groupsRoute.delete('/:id/exit',authenticate,  exitGroup);
groupsRoute.post('/create/', authenticate, createGroup);
groupsRoute.get('/:id/members', getGroupMembers);
groupsRoute.post("/:id/add-member", addMember);
groupsRoute.post('/:id/remove-member"', removeMember);
groupsRoute.post("/:id/promote/:id", promote);
groupsRoute.put("/:id/", updateGroup);
groupsRoute.get("/all", getALLGroups);
groupsRoute.get("/:id/posts", getAllPosts);
