import { useEffect, useState } from "react";
import { axiosInstance } from "../api/axios.api";

export default function PostCard() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentTexts, setCommentTexts] = useState({});
  const [showComments, setShowComments] = useState(() => {
    // Load from localStorage on initial render
    const saved = localStorage.getItem('showComments');
    return saved ? JSON.parse(saved) : {};
  });
  const [loadingComments, setLoadingComments] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  
  const DEFAULT_PROFILE_IMAGE =
    "https://cdn-icons-png.flaticon.com/512/847/847969.png";

  // Save showComments to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('showComments', JSON.stringify(showComments));
  }, [showComments]);

  // Fetch current user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await axiosInstance.get("/auth/me", {
          withCredentials: true,
        });
        setCurrentUser(res.data.user);
      } catch (err) {
        console.error("Fetch current user error", err);
      }
    };
    fetchCurrentUser();
  }, []);

  // Fetch all posts with comment counts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axiosInstance.get("/posts", {
          withCredentials: true,
        });

        // Fetch comment counts for each post
        const postsWithCommentCounts = await Promise.all(
          res.data.posts.map(async (item) => {
            try {
              const commentsRes = await axiosInstance.get(
                `/posts/${item.posts.id}/comments`,
                { withCredentials: true }
              );
              
              return {
                id: item.posts.id,
                content: item.posts.content,
                createdAt: item.posts.createdAt,
                user: item.users,
                media: item.postMedia,
                likesCount: item.likesCount || 0,
                isLiked: Boolean(item.isLiked),
                comments: commentsRes.data.comments || [],
                commentsCount: commentsRes.data.count || 0,
              };
            } catch (err) {
              console.error(`Error fetching comments for post ${item.posts.id}`, err);
              return {
                id: item.posts.id,
                content: item.posts.content,
                createdAt: item.posts.createdAt,
                user: item.users,
                media: item.postMedia,
                likesCount: item.likesCount || 0,
                isLiked: Boolean(item.isLiked),
                comments: [],
                commentsCount: 0,
              };
            }
          })
        );

        setPosts(postsWithCommentCounts);
      } catch (err) {
        console.error("Fetch posts error", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const toggleLike = async (postId, isLiked) => {
    try {
      if (isLiked) {
        await axiosInstance.delete(`/posts/${postId}/like`, {
          withCredentials: true,
        });
      } else {
        await axiosInstance.post(`/posts/${postId}/like`, null, {
          withCredentials: true,
        });
      }

      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
                ...post,
                isLiked: !isLiked,
                likesCount: isLiked
                  ? post.likesCount - 1
                  : post.likesCount + 1,
              }
            : post
        )
      );
    } catch (err) {
      console.error("Like error", err);
    }
  };

  const fetchComments = async (postId) => {
    try {
      setLoadingComments((prev) => ({ ...prev, [postId]: true }));

      const res = await axiosInstance.get(`/posts/${postId}/comments`, {
        withCredentials: true,
      });

      console.log("Comments fetched:", res.data.comments);

      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
                ...post,
                comments: res.data.comments || [],
                commentsCount: res.data.count || 0,
              }
            : post
        )
      );
    } catch (err) {
      console.error("Fetch comments error", err);
    } finally {
      setLoadingComments((prev) => ({ ...prev, [postId]: false }));
    }
  };

  const toggleComments = async (postId) => {
    const isCurrentlyShowing = showComments[postId];

    setShowComments((prev) => ({ ...prev, [postId]: !isCurrentlyShowing }));

    // Refresh comments when showing
    if (!isCurrentlyShowing) {
      await fetchComments(postId);
    }
  };

  const addComment = async (postId) => {
    const content = commentTexts[postId]?.trim();

    if (!content) return;

    try {
      const res = await axiosInstance.post(
        `/posts/${postId}/comment`,
        { content },
        { withCredentials: true }
      );

      console.log("Comment added:", res.data);

      const newComment = res.data.comment[0];

      // Add the new comment to the post
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
                ...post,
                comments: [newComment, ...(post.comments || [])],
                commentsCount: (post.commentsCount || 0) + 1,
              }
            : post
        )
      );

      // Clear the input
      setCommentTexts((prev) => ({ ...prev, [postId]: "" }));
    } catch (err) {
      console.error("Add comment error", err);
    }
  };

  const deleteComment = async (postId, commentId) => {
    try {
      await axiosInstance.delete(`/posts/${postId}/comments/${commentId}`, {
        withCredentials: true,
      });

      // Remove the comment from the post
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
                ...post,
                comments: post.comments.filter((c) => c.id !== commentId),
                commentsCount: Math.max(0, (post.commentsCount || 0) - 1),
              }
            : post
        )
      );
    } catch (err) {
      console.error("Delete comment error", err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-gray-500">Loading posts...</div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-gray-500">No posts available.</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 max-w-2xl mx-auto">
      {posts.map((post) => (
        <div key={post.id} className="border rounded-lg p-4 shadow bg-white">
          {/* User */}
          <div className="flex items-center gap-2 mb-3">
            <img
              src={post.user?.profileUrl || DEFAULT_PROFILE_IMAGE}
              alt="profile"
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <span className="font-semibold block">
                {post.user?.name || "Unknown User"}
              </span>
              <span className="text-xs text-gray-500">
                {post.createdAt
                  ? new Date(post.createdAt).toLocaleDateString()
                  : ""}
              </span>
            </div>
          </div>

          {/* Content */}
          <p className="mb-3">{post.content}</p>

          {/* Media */}
          {post.media?.type === "IMAGE" && (
            <img
              src={post.media.url}
              alt="post media"
              className="w-full rounded-lg mb-3 max-h-96 object-cover"
            />
          )}

          {/* Actions */}
          <div className="flex gap-4 border-t pt-3">
            <button
              onClick={() => toggleLike(post.id, post.isLiked)}
              className={
                post.isLiked
                  ? "text-red-500 font-medium flex items-center gap-1 transition-colors"
                  : "text-gray-500 font-medium flex items-center gap-1 hover:text-red-500 transition-colors"
              }
            >
              {post.isLiked ? "❤️" : "🤍"} Like ({post.likesCount})
            </button>

            <button
              onClick={() => toggleComments(post.id)}
              className={`font-medium flex items-center gap-1 transition-colors ${
                showComments[post.id] 
                  ? "text-blue-500" 
                  : "text-gray-500 hover:text-blue-500"
              }`}
            >
              💬 Comment ({post.commentsCount || 0})
            </button>

            <button className="text-gray-500 font-medium flex items-center gap-1 hover:text-green-500 transition-colors">
              ↗ Share
            </button>
          </div>

          {/* Comments Section */}
          {showComments[post.id] && (
            <div className="mt-4 border-t pt-4">
              {/* Comment Input */}
              <div className="flex gap-2 mb-4">
                <img
                  src={currentUser?.profileUrl || DEFAULT_PROFILE_IMAGE}
                  alt="your profile"
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    placeholder="Write a comment..."
                    value={commentTexts[post.id] || ""}
                    onChange={(e) =>
                      setCommentTexts((prev) => ({
                        ...prev,
                        [post.id]: e.target.value,
                      }))
                    }
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        addComment(post.id);
                      }
                    }}
                    className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={() => addComment(post.id)}
                    disabled={!commentTexts[post.id]?.trim()}
                    className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    Post
                  </button>
                </div>
              </div>

              {/* Comments List */}
              <div className="space-y-3">
                {loadingComments[post.id] ? (
                  <div className="text-gray-500 text-center py-2">
                    Loading comments...
                  </div>
                ) : post.comments && post.comments.length > 0 ? (
                  post.comments.map((comment) => (
                    <div key={comment.id} className="flex gap-2">
                      <img
                        src={
                          comment.author?.profileUrl || DEFAULT_PROFILE_IMAGE
                        }
                        alt="commenter"
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="flex-1">
                        <div className="bg-gray-100 rounded-lg px-3 py-2">
                          <div className="flex justify-between items-start gap-2">
                            <span className="font-semibold text-sm">
                              {comment.author?.name || "Unknown User"}
                            </span>
                            {(currentUser?.id === comment.author?.id ||
                              currentUser?.id === post.user?.id) && (
                              <button
                                onClick={() =>
                                  deleteComment(post.id, comment.id)
                                }
                                className="text-red-500 text-xs hover:text-red-700 transition-colors flex-shrink-0"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                          <p className="text-sm mt-1 break-words">
                            {comment.content}
                          </p>
                        </div>
                        <span className="text-xs text-gray-500 mt-1 ml-3 block">
                          {comment.createdAt
                            ? new Date(comment.createdAt).toLocaleString()
                            : ""}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 text-center py-2">
                    No comments yet. Be the first to comment!
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}