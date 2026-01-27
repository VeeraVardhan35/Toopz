import { db } from "../config/db.js";
import {
  users,
  userProfiles,
  userFollows,
  posts,
  savedPosts,
  groupMembers,
  groups,
} from "../database/schema.js";
import { eq, and, desc, sql, count } from "drizzle-orm";
import cloudinary from "../config/cloudinary.js";

// Get user profile
export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    // Get user basic info
    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        department: users.department,
        batch: users.batch,
        profileUrl: users.profileUrl,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, userId));

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get extended profile info
    const [profile] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId));

    // Get followers count
    const [followersCount] = await db
      .select({ count: count() })
      .from(userFollows)
      .where(eq(userFollows.followingId, userId));

    // Get following count
    const [followingCount] = await db
      .select({ count: count() })
      .from(userFollows)
      .where(eq(userFollows.followerId, userId));

    // Get posts count
    const [postsCount] = await db
      .select({ count: count() })
      .from(posts)
      .where(eq(posts.authorId, userId));

    // Check if current user follows this user
    const [isFollowing] = await db
      .select()
      .from(userFollows)
      .where(
        and(
          eq(userFollows.followerId, currentUserId),
          eq(userFollows.followingId, userId)
        )
      );

    return res.status(200).json({
      success: true,
      profile: {
        ...user,
        bio: profile?.bio || null,
        title: profile?.title || null,
        coverUrl: profile?.coverUrl || null,
        location: profile?.location || null,
        website: profile?.website || null,
        linkedin: profile?.linkedin || null,
        twitter: profile?.twitter || null,
        github: profile?.github || null,
        followersCount: followersCount.count,
        followingCount: followingCount.count,
        postsCount: postsCount.count,
        isFollowing: !!isFollowing,
      },
    });
  } catch (error) {
    console.error("Get user profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
    });
  }
};

// Update user profile
export const updateUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    // Only allow users to update their own profile
    if (userId !== currentUserId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this profile",
      });
    }

    const { name, bio, title, location, website, linkedin, twitter, github } = req.body;
    const profileImage = req.files?.profileImage?.[0];
    const coverImage = req.files?.coverImage?.[0];

    // Upload images to cloudinary if provided
    let profileUrl = null;
    let coverUrl = null;

    if (profileImage) {
      const profileResult = await cloudinary.uploader.upload(profileImage.path, {
        folder: "profiles",
      });
      profileUrl = profileResult.secure_url;
    }

    if (coverImage) {
      const coverResult = await cloudinary.uploader.upload(coverImage.path, {
        folder: "covers",
      });
      coverUrl = coverResult.secure_url;
    }

    // Update basic user info
    if (name || profileUrl) {
      await db
        .update(users)
        .set({
          ...(name && { name }),
          ...(profileUrl && { profileUrl }),
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));
    }

    // Update or create extended profile
    const [existingProfile] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId));

    if (existingProfile) {
      // Update existing profile
      await db
        .update(userProfiles)
        .set({
          ...(bio !== undefined && { bio }),
          ...(title !== undefined && { title }),
          ...(coverUrl && { coverUrl }),
          ...(location !== undefined && { location }),
          ...(website !== undefined && { website }),
          ...(linkedin !== undefined && { linkedin }),
          ...(twitter !== undefined && { twitter }),
          ...(github !== undefined && { github }),
          updatedAt: new Date(),
        })
        .where(eq(userProfiles.userId, userId));
    } else {
      // Create new profile
      await db.insert(userProfiles).values({
        userId,
        bio,
        title,
        coverUrl,
        location,
        website,
        linkedin,
        twitter,
        github,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Update user profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
};

// Get user posts
export const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 20 } = req.query;

    const userPosts = await db
      .select({
        id: posts.id,
        content: posts.content,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        authorId: posts.authorId,
        authorName: users.name,
        authorProfileUrl: users.profileUrl,
        likesCount: sql`(
          SELECT COUNT(*)::int
          FROM ${postLikes}
          WHERE ${postLikes.postId} = ${posts.id}
        )`,
        commentsCount: sql`(
          SELECT COUNT(*)::int
          FROM ${postComments}
          WHERE ${postComments.postId} = ${posts.id}
        )`,
      })
      .from(posts)
      .leftJoin(users, eq(posts.authorId, users.id))
      .where(eq(posts.authorId, userId))
      .orderBy(desc(posts.createdAt))
      .limit(parseInt(limit));

    return res.status(200).json({
      success: true,
      posts: userPosts,
    });
  } catch (error) {
    console.error("Get user posts error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch posts",
    });
  }
};

// Get user groups
export const getUserGroups = async (req, res) => {
  try {
    const { userId } = req.params;

    const userGroups = await db
      .select({
        id: groups.id,
        name: groups.name,
        type: groups.type,
        createdAt: groups.createdAt,
        role: groupMembers.role,
        membersCount: sql`(
          SELECT COUNT(*)::int
          FROM ${groupMembers} gm
          WHERE gm.group_id = ${groups.id}
        )`,
      })
      .from(groupMembers)
      .leftJoin(groups, eq(groupMembers.groupId, groups.id))
      .where(eq(groupMembers.userId, userId))
      .orderBy(desc(groupMembers.joinedAt));

    return res.status(200).json({
      success: true,
      groups: userGroups,
    });
  } catch (error) {
    console.error("Get user groups error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch groups",
    });
  }
};

// Toggle follow
export const toggleFollow = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    // Prevent self-follow
    if (userId === currentUserId) {
      return res.status(400).json({
        success: false,
        message: "Cannot follow yourself",
      });
    }

    // Check if already following
    const [existingFollow] = await db
      .select()
      .from(userFollows)
      .where(
        and(
          eq(userFollows.followerId, currentUserId),
          eq(userFollows.followingId, userId)
        )
      );

    if (existingFollow) {
      // Unfollow
      await db
        .delete(userFollows)
        .where(
          and(
            eq(userFollows.followerId, currentUserId),
            eq(userFollows.followingId, userId)
          )
        );

      return res.status(200).json({
        success: true,
        message: "Unfollowed successfully",
        isFollowing: false,
      });
    } else {
      // Follow
      await db.insert(userFollows).values({
        followerId: currentUserId,
        followingId: userId,
      });

      return res.status(200).json({
        success: true,
        message: "Followed successfully",
        isFollowing: true,
      });
    }
  } catch (error) {
    console.error("Toggle follow error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to toggle follow",
    });
  }
};

// Get followers
export const getFollowers = async (req, res) => {
  try {
    const { userId } = req.params;

    const followers = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        profileUrl: users.profileUrl,
        role: users.role,
        department: users.department,
        followedAt: userFollows.createdAt,
      })
      .from(userFollows)
      .leftJoin(users, eq(userFollows.followerId, users.id))
      .where(eq(userFollows.followingId, userId))
      .orderBy(desc(userFollows.createdAt));

    return res.status(200).json({
      success: true,
      followers,
    });
  } catch (error) {
    console.error("Get followers error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch followers",
    });
  }
};

// Get following
export const getFollowing = async (req, res) => {
  try {
    const { userId } = req.params;

    const following = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        profileUrl: users.profileUrl,
        role: users.role,
        department: users.department,
        followedAt: userFollows.createdAt,
      })
      .from(userFollows)
      .leftJoin(users, eq(userFollows.followingId, users.id))
      .where(eq(userFollows.followerId, userId))
      .orderBy(desc(userFollows.createdAt));

    return res.status(200).json({
      success: true,
      following,
    });
  } catch (error) {
    console.error("Get following error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch following",
    });
  }
};

// Check follow status
export const checkFollowStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    const [isFollowing] = await db
      .select()
      .from(userFollows)
      .where(
        and(
          eq(userFollows.followerId, currentUserId),
          eq(userFollows.followingId, userId)
        )
      );

    return res.status(200).json({
      success: true,
      isFollowing: !!isFollowing,
    });
  } catch (error) {
    console.error("Check follow status error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to check follow status",
    });
  }
};

// Save/Unsave post
export const toggleSavePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    // Check if already saved
    const [existingSave] = await db
      .select()
      .from(savedPosts)
      .where(
        and(eq(savedPosts.userId, userId), eq(savedPosts.postId, postId))
      );

    if (existingSave) {
      // Unsave
      await db
        .delete(savedPosts)
        .where(
          and(eq(savedPosts.userId, userId), eq(savedPosts.postId, postId))
        );

      return res.status(200).json({
        success: true,
        message: "Post unsaved",
        isSaved: false,
      });
    } else {
      // Save
      await db.insert(savedPosts).values({
        userId,
        postId,
      });

      return res.status(200).json({
        success: true,
        message: "Post saved",
        isSaved: true,
      });
    }
  } catch (error) {
    console.error("Toggle save post error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save post",
    });
  }
};

// Get saved posts
export const getSavedPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    // Only allow users to see their own saved posts
    if (userId !== currentUserId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view saved posts",
      });
    }

    const saved = await db
      .select({
        id: posts.id,
        content: posts.content,
        createdAt: posts.createdAt,
        savedAt: savedPosts.createdAt,
        authorId: posts.authorId,
        authorName: users.name,
        authorProfileUrl: users.profileUrl,
      })
      .from(savedPosts)
      .leftJoin(posts, eq(savedPosts.postId, posts.id))
      .leftJoin(users, eq(posts.authorId, users.id))
      .where(eq(savedPosts.userId, userId))
      .orderBy(desc(savedPosts.createdAt));

    return res.status(200).json({
      success: true,
      savedPosts: saved,
    });
  } catch (error) {
    console.error("Get saved posts error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch saved posts",
    });
  }
};