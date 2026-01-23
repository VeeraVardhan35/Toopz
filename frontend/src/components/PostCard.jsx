import { useState, useEffect } from "react";
import axios from "axios";

export default function PostCard() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    const DEFAULT_PROFILE_IMAGE =
        "https://cdn-icons-png.flaticon.com/512/847/847969.png";

    useEffect(() => {
        axios
            .get("http://localhost:5500/api/v1/posts")
            .then((res) => {
                const validPosts = res.data.posts.filter(
                    (item) => item.posts !== null
                );
                setPosts(validPosts);
            })
            .catch((err) => console.error("Error fetching posts:", err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <p className="p-4">Loading posts...</p>;
    if (posts.length === 0) return <p className="p-4">No posts available.</p>;

    return (
        <div className="space-y-4">
            {posts.map((item) => {
                const { posts: post, users: user, postMedia: media } = item;

                return (
                    <div
                        key={post.id}
                        className="p-4 space-y-4 border rounded-md bg-white"
                    >
                        {/* User Info */}
                        <div className="flex items-center gap-3">
                            <img
                                src={user?.profileUrl || DEFAULT_PROFILE_IMAGE}
                                alt="profile"
                                className="w-10 h-10 rounded-full object-cover"
                            />

                            <h5 className="font-semibold">
                                {user?.name || "Unknown User"}
                            </h5>
                        </div>

                        {/* Post Content */}
                        <p className="text-sm text-gray-800">{post.content}</p>

                        {/* Post Media */}
                        {media?.type === "IMAGE" && (
                            <img
                                src={media.url}
                                alt="Post media"
                                className="mt-2 max-h-60 w-full object-cover rounded-md"
                            />
                        )}

                        {/* Actions */}
                        <div className="flex gap-6 pt-2">
                            <button className="border px-4 py-1 rounded hover:bg-gray-100">
                                Like
                            </button>
                            <button className="border px-4 py-1 rounded hover:bg-gray-100">
                                Comment
                            </button>
                            <button className="border px-4 py-1 rounded hover:bg-gray-100">
                                Share
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
