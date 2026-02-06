import { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import toast from "react-hot-toast";
import { getAllPosts, likePost, unlikePost, getPostComments, commentOnPost, deleteComment, deletePost } from "../api/post.api";
import UpdatePost from "./UpdatePost";
import { useAuth } from "../AuthContext.jsx";

const PostCard = forwardRef((props, ref) => {
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
  
  const [postsPagination, setPostsPagination] = useState(null);
  const [currentPostsPage, setCurrentPostsPage] = useState(1);
  const [loadingMorePosts, setLoadingMorePosts] = useState(false);
  const [commentsPagination, setCommentsPagination] = useState({});
  const [commentsPages, setCommentsPages] = useState({});
  const [loadingMoreComments, setLoadingMoreComments] = useState({});
  
  const DEFAULT_PROFILE_IMAGE =
    "https://cdn-icons-png.flaticon.com/512/847/847969.png";

  useEffect(() => {
    localStorage.setItem('showComments', JSON.stringify(showComments));
  }, [showComments]);

  const fetchPosts = async (page = 1, append = false) => {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMorePosts(true);
      }

      const res = await getAllPosts(page, 10);

      if (append) {
        setPosts(prev => [...prev, ...(res.posts || [])]);
      } else {
        setPosts(res.posts || []);
      }
      
      setPostsPagination(res.pagination);
      setCurrentPostsPage(page);
    } catch (err) {
    } finally {
      setLoading(false);
      setLoadingMorePosts(false);
    }
  };

  const handleLoadMorePosts = () => {
    if (postsPagination && postsPagination.hasNextPage && !loadingMorePosts) {
      fetchPosts(currentPostsPage + 1, true);
    }
  };

  useImperativeHandle(ref, () => ({
    refreshPosts: () => fetchPosts(1, false)
  }));

  useEffect(() => {
    fetchPosts(1, false);
  }, []);

  const toggleLike = async (postId, isLiked) => {
    try {
      if (isLiked) {
        await unlikePost(postId);
      } else {
        await likePost(postId);
      }

      setPosts((prev) =>
        prev.map((post) =>
          post.posts.id === postId
            ? {
                ...post,
                isLiked: !isLiked,
                likesCount: isLiked ? post.likesCount - 1 : post.likesCount + 1,
              }
            : post
        )
      );
    } catch (err) {
    }
  };

  const fetchComments = async (postId, page = 1, append = false) => {
    try {
      if (page === 1) {
        setLoadingComments((prev) => ({ ...prev, [postId]: true }));
      } else {
        setLoadingMoreComments((prev) => ({ ...prev, [postId]: true }));
      }

      const res = await getPostComments(postId, page, 20);

      setPosts((prev) =>
        prev.map((post) =>
          post.posts.id === postId
            ? {
                ...post,
                comments: append 
                  ? [...(post.comments || []), ...(res.comments || [])]
                  : res.comments || [],
                commentsCount: res.count || 0,
              }
            : post
        )
      );
      
      setCommentsPagination(prev => ({
        ...prev,
        [postId]: res.pagination
      }));
      
      setCommentsPages(prev => ({
        ...prev,
        [postId]: page
      }));
    } catch (err) {
    } finally {
      setLoadingComments((prev) => ({ ...prev, [postId]: false }));
      setLoadingMoreComments((prev) => ({ ...prev, [postId]: false }));
    }
  };

  const handleLoadMoreComments = (postId) => {
    const currentPage = commentsPages[postId] || 1;
    const pagination = commentsPagination[postId];
    
    if (pagination && pagination.hasNextPage && !loadingMoreComments[postId]) {
      fetchComments(postId, currentPage + 1, true);
    }
  };

  const toggleComments = async (postId) => {
    const isCurrentlyShowing = showComments[postId];
    setShowComments((prev) => ({ ...prev, [postId]: !isCurrentlyShowing }));
    
    if (!isCurrentlyShowing) {
      await fetchComments(postId, 1, false);
    }
  };

  const addComment = async (postId) => {
    const content = commentTexts[postId]?.trim();
    if (!content) return;

    try {
      const res = await commentOnPost(postId, content);
      const newComment = res.comment[0];

      setPosts((prev) =>
        prev.map((post) =>
          post.posts.id === postId
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
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    try {
      await deleteComment(postId, commentId);

      setPosts((prev) =>
        prev.map((post) =>
          post.posts.id === postId
            ? {
                ...post,
                comments: post.comments.filter((c) => c.id !== commentId),
                commentsCount: Math.max(0, (post.commentsCount || 0) - 1),
              }
            : post
        )
      );
    } catch (err) {
    }
  };

  const handleDeletePost = async (postId) => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      await deletePost(postId);
      setPosts((prev) => prev.filter((post) => post.posts.id !== postId));
      toast.success("Post deleted successfully!");
    } catch (err) {
      toast.error("Failed to delete post");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-slate-400">Loading posts...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.length === 0 ? (
        <div className="flex justify-center items-center p-8 bg-[#1b2027] border border-white/10 rounded-2xl">
          <div className="text-slate-400">No posts available. Create your first post!</div>
        </div>
      ) : (
        <>
          {posts.map((post) => (
            <div key={post.posts.id} className="border border-white/10 rounded-2xl p-4 bg-[#1b2027]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <img
                    src={post.users?.profileUrl || DEFAULT_PROFILE_IMAGE}
                    alt="profile"
                    className="w-10 h-10 rounded-full object-cover border border-white/15"
                  />
                  <div>
                    <span className="font-bold block text-slate-100">
                      {post.users?.name || "Unknown User"}
                    </span>
                    <span className="text-xs text-slate-400">
                      {post.posts.createdAt
                        ? new Date(post.posts.createdAt).toLocaleDateString()
                        : ""}
                    </span>
                  </div>
                </div>

                {currentUser?.id === post.users?.id && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingPost(post)}
                      className="bg-white/5 text-slate-100 border border-white/10 px-3 py-1 rounded-lg hover:bg-white/10 text-sm font-semibold transition-all"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeletePost(post.posts.id)}
                      className="bg-red-500/20 text-red-200 border border-red-400/30 px-3 py-1 rounded-lg hover:bg-red-500/30 text-sm font-semibold transition-all"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>

              <p className="mb-3 text-slate-100">{post.posts.content}</p>

              {post.postMedia && (
                <>
                  {post.postMedia.type === "IMAGE" && (
                    <img
                      src={post.postMedia.url}
                      alt="post media"
                      className="w-full rounded-xl mb-3 max-h-96 object-cover border border-white/10"
                    />
                  )}
                  
                  {post.postMedia.type === "VIDEO" && (
                    <video
                      src={post.postMedia.url}
                      controls
                      className="w-full rounded-xl mb-3 max-h-96 border border-white/10"
                    >
                      Your browser does not support the video tag.
                    </video>
                  )}
                </>
              )}

              <div className="flex gap-4 border-t border-white/10 pt-3">
                <button
                  onClick={() => toggleLike(post.posts.id, post.isLiked)}
                  className={`font-semibold flex items-center gap-1 transition-all ${
                    post.isLiked
                      ? "text-slate-100"
                      : "text-slate-400 hover:text-slate-100"
                  }`}
                >
                  {post.isLiked ? "❤️" : "🤍"} Like ({post.likesCount})
                </button>

                <button
                  onClick={() => toggleComments(post.posts.id)}
                  className={`font-semibold flex items-center gap-1 transition-all ${
                    showComments[post.posts.id] 
                      ? "text-slate-100" 
                      : "text-slate-400 hover:text-slate-100"
                  }`}
                >
                  💬 Comment ({post.commentsCount || 0})
                </button>

                <button
                  onClick={() => toast("Coming soon")}
                  className="text-slate-400 font-semibold flex items-center gap-1 hover:text-slate-100 transition-all"
                >
                  ↗ Share
                </button>
              </div>

              {showComments[post.posts.id] && (
                <div className="mt-4 border-t border-white/10 pt-4">
                  <div className="flex gap-2 mb-4">
                    <img
                      src={currentUser?.profileUrl || DEFAULT_PROFILE_IMAGE}
                      alt="your profile"
                      className="w-8 h-8 rounded-full object-cover border border-white/15"
                    />
                    <div className="flex-1 flex gap-2">
                      <input
                        type="text"
                        placeholder="Write a comment..."
                        value={commentTexts[post.posts.id] || ""}
                        onChange={(e) =>
                          setCommentTexts((prev) => ({
                            ...prev,
                            [post.posts.id]: e.target.value,
                          }))
                        }
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            addComment(post.posts.id);
                          }
                        }}
                        className="flex-1 border border-white/10 rounded-lg px-4 py-2 bg-[#14181d] text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#2b69ff]/60"
                      />
                      <button
                        onClick={() => addComment(post.posts.id)}
                        disabled={!commentTexts[post.posts.id]?.trim()}
                        className="bg-[#2b69ff] text-white px-4 py-2 rounded-lg hover:bg-[#2458d6] disabled:bg-white/10 font-semibold border border-white/10"
                      >
                        Post
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {loadingComments[post.posts.id] && (!post.comments || post.comments.length === 0) ? (
                      <div className="text-slate-400 text-center py-2">
                        Loading comments...
                      </div>
                    ) : post.comments && post.comments.length > 0 ? (
                      <>
                        {post.comments.map((comment) => (
                          <div key={comment.id} className="flex gap-2">
                            <img
                              src={comment.author?.profileUrl || DEFAULT_PROFILE_IMAGE}
                              alt="commenter"
                              className="w-8 h-8 rounded-full object-cover flex-shrink-0 border border-white/15"
                            />
                            <div className="flex-1">
                              <div className="bg-[#14181d] border border-white/10 rounded-lg px-3 py-2">
                                <div className="flex justify-between items-start gap-2">
                                  <span className="font-bold text-sm text-slate-100">
                                    {comment.author?.name || "Unknown User"}
                                  </span>
                                  {(currentUser?.id === comment.author?.id ||
                                    currentUser?.id === post.users?.id) && (
                                    <button
                                      onClick={() => handleDeleteComment(post.posts.id, comment.id)}
                                      className="text-red-300 text-xs hover:underline font-semibold"
                                    >
                                      Delete
                                    </button>
                                  )}
                                </div>
                                <p className="text-sm mt-1 break-words text-slate-100">
                                  {comment.content}
                                </p>
                              </div>
                              <span className="text-xs text-slate-400 mt-1 ml-3 block">
                                {comment.createdAt
                                  ? new Date(comment.createdAt).toLocaleString()
                                  : ""}
                              </span>
                            </div>
                          </div>
                        ))}
                        
                        {/* Load More Comments Button */}
                        {commentsPagination[post.posts.id]?.hasNextPage && (
                          <div className="pt-2">
                            <button
                              onClick={() => handleLoadMoreComments(post.posts.id)}
                              disabled={loadingMoreComments[post.posts.id]}
                              className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-slate-100 py-2 rounded-lg font-semibold transition-all disabled:opacity-50"
                            >
                              {loadingMoreComments[post.posts.id] 
                                ? "Loading..." 
                                : `Load More Comments (${commentsPagination[post.posts.id].currentPage}/${commentsPagination[post.posts.id].totalPages})`
                              }
                            </button>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-slate-400 text-center py-2">
                        No comments yet. Be the first to comment!
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {/* Load More Posts Button */}
          {postsPagination && postsPagination.hasNextPage && (
            <div className="pt-4">
              <button
                onClick={handleLoadMorePosts}
                disabled={loadingMorePosts}
                className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-slate-100 py-3 rounded-lg font-semibold transition-all disabled:opacity-50"
              >
                {loadingMorePosts 
                  ? "Loading..." 
                  : `Load More Posts (${postsPagination.currentPage}/${postsPagination.totalPages})`
                }
              </button>
            </div>
          )}
        </>
      )}

      {editingPost && (
        <UpdatePost
          post={editingPost}
          onClose={() => setEditingPost(null)}
          onPostUpdated={() => fetchPosts(1, false)}
        />
      )}
    </div>
  );
});

export default PostCard;
