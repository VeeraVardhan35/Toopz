import express from "express";
import {
  createGroup,
  getGroups,
  getGroupById,
  updateGroup,
  deleteGroup,
  addMember,
  removeMember,
  updateMemberRole,
  getGroupMembers,
  leaveGroup,
  getMyGroups,
  joinGroup
} from "../controllers/groups.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(authenticate);

router.post("/", createGroup);
router.get("/", getGroups);
router.get("/my-groups", getMyGroups);
router.get("/:id", getGroupById);
router.put("/:id", updateGroup);
router.delete("/:id", deleteGroup);

router.get("/:id/members", getGroupMembers);
router.post("/:id/join", joinGroup);
router.post("/:id/members", addMember);
router.delete("/:id/members/:userId", removeMember);
router.put("/:id/members/:userId/role", updateMemberRole);
router.post("/:id/leave", leaveGroup);

export default router;