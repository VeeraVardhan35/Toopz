import express from "express";
import {
  getAllUniversities,
  getUniversityById,
  getUniversityUsers,
  getUniversityPosts,
  getUniversityGroups,
  getDashboardStats,
  createUniversity,
  updateUniversity,
  deleteUniversity,
  getUserDetails,
  deleteUser,
} from "../controllers/universal-admin.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { checkUniversalAdmin } from "../middleware/universal-admin.middleware.js";
import { redisCache } from "../middleware/redis-cache.middleware.js";

const router = express.Router();

router.use(authenticate);
router.use(checkUniversalAdmin);

router.get("/stats", redisCache(180), getDashboardStats);

router.get("/universities", redisCache(300), getAllUniversities);
router.get("/universities/:id", redisCache(300), getUniversityById);
router.post("/universities", createUniversity);
router.put("/universities/:id", updateUniversity);
router.delete("/universities/:id", deleteUniversity);

router.get("/universities/:id/users", redisCache(180), getUniversityUsers);
router.get("/universities/:id/posts", redisCache(180), getUniversityPosts);
router.get("/universities/:id/groups", redisCache(180), getUniversityGroups);

router.get("/users/:userId", redisCache(300), getUserDetails);
router.delete("/users/:userId", deleteUser);

export default router;