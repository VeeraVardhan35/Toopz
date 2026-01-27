import { useEffect, useState, forwardRef, useImperativeHandle } from "react";
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
  
  // Pagination states
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
      console.error("Fetch posts error", err);
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
      console.error("Like error", err);
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
      console.error("Fetch comments error", err);
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
      console.error("Add comment error", err);
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
      console.error("Delete comment error", err);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      await deletePost(postId);
      setPosts((prev) => prev.filter((post) => post.posts.id !== postId));
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
        <>
          {posts.map((post) => (
            <div key={post.posts.id} className="border-2 border-black rounded-lg p-4 bg-white">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <img
                    src={post.users?.profileUrl || DEFAULT_PROFILE_IMAGE}
                    alt="profile"
                    className="w-10 h-10 rounded-full object-cover border-2 border-black"
                  />
                  <div>
                    <span className="font-bold block text-black">
                      {post.users?.name || "Unknown User"}
                    </span>
                    <span className="text-xs text-gray-600">
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
                      className="bg-white text-black border-2 border-black px-3 py-1 rounded hover:bg-black hover:text-white text-sm font-semibold transition-all"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeletePost(post.posts.id)}
                      className="bg-black text-white border-2 border-black px-3 py-1 rounded hover:bg-white hover:text-black text-sm font-semibold transition-all"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>

              <p className="mb-3 text-black">{post.posts.content}</p>

              {post.postMedia && (
                <>
                  {post.postMedia.type === "IMAGE" && (
                    <img
                      src={post.postMedia.url}
                      alt="post media"
                      className="w-full rounded-lg mb-3 max-h-96 object-cover border-2 border-black"
                    />
                  )}
                  
                  {post.postMedia.type === "VIDEO" && (
                    <video
                      src={post.postMedia.url}
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
                  onClick={() => toggleLike(post.posts.id, post.isLiked)}
                  className={`font-semibold flex items-center gap-1 transition-all ${
                    post.isLiked
                      ? "text-black"
                      : "text-gray-600 hover:text-black"
                  }`}
                >
                  {post.isLiked ? "❤️" : "🤍"} Like ({post.likesCount})
                </button>

                <button
                  onClick={() => toggleComments(post.posts.id)}
                  className={`font-semibold flex items-center gap-1 transition-all ${
                    showComments[post.posts.id] 
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

              {showComments[post.posts.id] && (
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
                        className="flex-1 border-2 border-black rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                      />
                      <button
                        onClick={() => addComment(post.posts.id)}
                        disabled={!commentTexts[post.posts.id]?.trim()}
                        className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 disabled:bg-gray-400 font-semibold border-2 border-black"
                      >
                        Post
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {loadingComments[post.posts.id] && (!post.comments || post.comments.length === 0) ? (
                      <div className="text-gray-600 text-center py-2">
                        Loading comments...
                      </div>
                    ) : post.comments && post.comments.length > 0 ? (
                      <>
                        {post.comments.map((comment) => (
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
                                    currentUser?.id === post.users?.id) && (
                                    <button
                                      onClick={() => handleDeleteComment(post.posts.id, comment.id)}
                                      className="text-red-600 text-xs hover:underline font-semibold"
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
                        ))}
                        
                        {/* Load More Comments Button */}
                        {commentsPagination[post.posts.id]?.hasNextPage && (
                          <div className="pt-2">
                            <button
                              onClick={() => handleLoadMoreComments(post.posts.id)}
                              disabled={loadingMoreComments[post.posts.id]}
                              className="w-full bg-gray-100 border-2 border-black hover:bg-gray-200 text-black py-2 rounded-lg font-semibold transition-all disabled:opacity-50"
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
                      <div className="text-gray-600 text-center py-2">
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
                className="w-full bg-white border-2 border-black hover:bg-black hover:text-white text-black py-3 rounded-lg font-semibold transition-all disabled:opacity-50"
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