import { useState, useRef } from "react";
import PostCard from "./PostCard.jsx";
import CreatePostModal from "./CreatePostModal.jsx";

export default function MainFeed() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const postCardRef = useRef();

  const handlePostCreated = () => {
    if (postCardRef.current && postCardRef.current.refreshPosts) {
      postCardRef.current.refreshPosts();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-[#1b2027] p-4 rounded-2xl border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
        <h2 className="text-2xl font-bold text-slate-100">Main Feed</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-[#2b69ff] text-white px-6 py-2 rounded-xl hover:bg-[#2458d6] transition-colors font-medium flex items-center gap-2 shadow"
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
