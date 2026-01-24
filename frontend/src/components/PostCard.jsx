import { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { axiosInstance } from "../api/axios.api";
import UpdatePost from "./UpdatePost";
import { useAuth } from "../AuthContext.jsx";

const PostCard = forwardRef((props, ref) => {
  // Get user from context - MUST be inside the component
  const { user: currentUser } = useAuth();
  
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentTexts, setCommentTexts] = useState({});
  const [showComments, setShowComments] = useState(() => {
    const saved = localStorage.getItem('showComments');
    return saved ? JSON.parse(saved) : {};
  });
  const [loadingComments, setLoadingComments] = useState({});
  const [editingPost, setEditingPost] = useState(null);
  
  const DEFAULT_PROFILE_IMAGE =
    "https://cdn-icons-png.flaticon.com/512/847/847969.png";

  useEffect(() => {
    localStorage.setItem('showComments', JSON.stringify(showComments));
  }, [showComments]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/posts", {
        withCredentials: true,
      });

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

  useImperativeHandle(ref, () => ({
    refreshPosts: fetchPosts
  }));

  useEffect(() => {
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
                likesCount: isLiked ? post.likesCount - 1 : post.likesCount + 1,
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

      const newComment = res.data.comment[0];

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

  const deletePost = async (postId) => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      await axiosInstance.delete(`/posts/${postId}`, {
        withCredentials: true,
      });

      setPosts((prev) => prev.filter((post) => post.id !== postId));
      alert("Post deleted successfully!");
    } catch (err) {
      console.error("Delete post error", err);
      alert("Failed to delete post");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-gray-600">Loading posts...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.length === 0 ? (
        <div className="flex justify-center items-center p-8 bg-white border border-gray-300 rounded-lg">
          <div className="text-gray-600">No posts available. Create your first post!</div>
        </div>
      ) : (
        posts.map((post) => (
          <div key={post.id} className="border-2 border-black rounded-lg p-4 bg-white">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <img
                  src={post.user?.profileUrl || DEFAULT_PROFILE_IMAGE}
                  alt="profile"
                  className="w-10 h-10 rounded-full object-cover border-2 border-black"
                />
                <div>
                  <span className="font-bold block text-black">
                    {post.user?.name || "Unknown User"}
                  </span>
                  <span className="text-xs text-gray-600">
                    {post.createdAt
                      ? new Date(post.createdAt).toLocaleDateString()
                      : ""}
                  </span>
                </div>
              </div>

              {currentUser?.id === post.user?.id && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingPost(post)}
                    className="bg-white text-black border-2 border-black px-3 py-1 rounded hover:bg-black hover:text-white text-sm font-semibold transition-all"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deletePost(post.id)}
                    className="bg-black text-white border-2 border-black px-3 py-1 rounded hover:bg-white hover:text-black text-sm font-semibold transition-all"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>

            <p className="mb-3 text-black">{post.content}</p>

            {post.media && (
              <>
                {post.media.type === "IMAGE" && (
                  <img
                    src={post.media.url}
                    alt="post media"
                    className="w-full rounded-lg mb-3 max-h-96 object-cover border-2 border-black"
                  />
                )}
                
                {post.media.type === "VIDEO" && (
                  <video
                    src={post.media.url}
                    controls
                    className="w-full rounded-lg mb-3 max-h-96 border-2 border-black"
                  >
                    Your browser does not support the video tag.
                  </video>
                )}
              </>
            )}

            <div className="flex gap-4 border-t-2 border-black pt-3">
              <button
                onClick={() => toggleLike(post.id, post.isLiked)}
                className={`font-semibold flex items-center gap-1 transition-all ${
                  post.isLiked
                    ? "text-black"
                    : "text-gray-600 hover:text-black"
                }`}
              >
                {post.isLiked ? "❤️" : "🤍"} Like ({post.likesCount})
              </button>

              <button
                onClick={() => toggleComments(post.id)}
                className={`font-semibold flex items-center gap-1 transition-all ${
                  showComments[post.id] 
                    ? "text-black" 
                    : "text-gray-600 hover:text-black"
                }`}
              >
                💬 Comment ({post.commentsCount || 0})
              </button>

              <button className="text-gray-600 font-semibold flex items-center gap-1 hover:text-black transition-all">
                ↗ Share
              </button>
            </div>

            {showComments[post.id] && (
              <div className="mt-4 border-t-2 border-black pt-4">
                <div className="flex gap-2 mb-4">
                  <img
                    src={currentUser?.profileUrl || DEFAULT_PROFILE_IMAGE}
                    alt="your profile"
                    className="w-8 h-8 rounded-full object-cover border-2 border-black"
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
                      className="flex-1 border-2 border-black rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                    />
                    <button
                      onClick={() => addComment(post.id)}
                      disabled={!commentTexts[post.id]?.trim()}
                      className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 disabled:bg-gray-400 font-semibold border-2 border-black"
                    >
                      Post
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {loadingComments[post.id] ? (
                    <div className="text-gray-600 text-center py-2">
                      Loading comments...
                    </div>
                  ) : post.comments && post.comments.length > 0 ? (
                    post.comments.map((comment) => (
                      <div key={comment.id} className="flex gap-2">
                        <img
                          src={comment.author?.profileUrl || DEFAULT_PROFILE_IMAGE}
                          alt="commenter"
                          className="w-8 h-8 rounded-full object-cover flex-shrink-0 border-2 border-black"
                        />
                        <div className="flex-1">
                          <div className="bg-gray-100 border-2 border-black rounded-lg px-3 py-2">
                            <div className="flex justify-between items-start gap-2">
                              <span className="font-bold text-sm text-black">
                                {comment.author?.name || "Unknown User"}
                              </span>
                              {(currentUser?.id === comment.author?.id ||
                                currentUser?.id === post.user?.id) && (
                                <button
                                  onClick={() => deleteComment(post.id, comment.id)}
                                  className="text-red text-xs hover:underline font-semibold"
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                            <p className="text-sm mt-1 break-words text-black">
                              {comment.content}
                            </p>
                          </div>
                          <span className="text-xs text-gray-600 mt-1 ml-3 block">
                            {comment.createdAt
                              ? new Date(comment.createdAt).toLocaleString()
                              : ""}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-600 text-center py-2">
                      No comments yet. Be the first to comment!
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))
      )}

      {editingPost && (
        <UpdatePostModal
          post={editingPost}
          onClose={() => setEditingPost(null)}
          onPostUpdated={fetchPosts}
        />
      )}
    </div>
  );
});

export default PostCard;