import { useState, useRef } from "react";
import PostCard from "./PostCard.jsx";
import CreatePostModal from "./CreatePostModal.jsx";

export default function MainFeed() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const postCardRef = useRef();

  const handlePostCreated = () => {
    // Trigger refresh in PostCard
    if (postCardRef.current && postCardRef.current.refreshPosts) {
      postCardRef.current.refreshPosts();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow">
        <h2 className="text-2xl font-bold text-gray-800">Main Feed</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors font-medium flex items-center gap-2"
        >
          <span>➕</span>
          Create Post
        </button>
      </div>

      <PostCard ref={postCardRef} />

      {showCreateModal && (
        <CreatePostModal 
          onClose={() => setShowCreateModal(false)}
          onPostCreated={handlePostCreated}
        />
      )}
    </div>
  );
}