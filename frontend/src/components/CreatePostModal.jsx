import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";
import { axiosInstance } from "../api/axios.api";
import { useAuth } from "../AuthContext.jsx";

export default function CreatePostModal({ onClose, onPostCreated }) {
  const { user } = useAuth(); // Get user from context
  const [content, setContent] = useState("");
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [loading, setLoading] = useState(false);

  const DEFAULT_PROFILE_IMAGE =
    "https://cdn-icons-png.flaticon.com/512/847/847969.png";

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMediaFile(file);

      if (file.type.startsWith("image/")) {
        setMediaType("IMAGE");
      } else if (file.type.startsWith("video/")) {
        setMediaType("VIDEO");
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    setMediaType(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim()) {
      toast.error("Please write something!");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("content", content);

      if (mediaFile) {
        formData.append("media", mediaFile);
      }

      const res = await axiosInstance.post("/posts", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });

      toast.success("Post created successfully!");
      
      if (onPostCreated) {
        onPostCreated();
      }
      
      onClose();
    } catch (err) {
      toast.error(
        "Failed to create post: " + (err.response?.data?.message || err.message)
      );
    } finally {
      setLoading(false);
    }
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4">
      <div className="bg-[#1b2027] border border-white/10 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl text-slate-100">
        <div className="sticky top-0 bg-[#1b2027] border-b border-white/10 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-100">Create Post</h2>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white text-2xl font-bold"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="flex gap-3 mb-4">
            <img
              src={user?.profileUrl || DEFAULT_PROFILE_IMAGE}
              alt="profile"
              className="w-10 h-10 rounded-full object-cover flex-shrink-0 border border-white/10"
            />
            <div>
              <p className="font-bold text-slate-100">{user?.name || "User"}</p>
              <p className="text-xs text-slate-400">
                {user?.department || "Public"} • {user?.batch || ""}
              </p>
            </div>
          </div>

          <textarea
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full border border-white/10 bg-[#14181d] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#2b69ff]/60 resize-none text-slate-100"
            rows="5"
            autoFocus
          />

          {mediaPreview && (
            <div className="mt-3 relative">
              {mediaType === "IMAGE" && (
                <img
                  src={mediaPreview}
                  alt="preview"
                  className="w-full rounded-xl max-h-96 object-cover border border-white/10"
                />
              )}
              {mediaType === "VIDEO" && (
                <video
                  src={mediaPreview}
                  controls
                  className="w-full rounded-xl max-h-96 border border-white/10"
                >
                  Your browser does not support the video tag.
                </video>
              )}
              <button
                type="button"
                onClick={removeMedia}
                className="absolute top-2 right-2 bg-white/10 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-white/20 transition-colors font-bold border border-white/10"
              >
                ✕
              </button>
            </div>
          )}

          <div className="border border-white/10 rounded-lg p-3 mt-4 bg-[#14181d]">
            <label className="cursor-pointer flex items-center justify-between hover:bg-white/5 p-2 rounded transition-colors">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📷</span>
                <span className="font-semibold text-slate-100">Add Photo/Video</span>
              </div>
              <span className="text-sm text-slate-400 font-semibold">Browse</span>
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || !content.trim()}
            className="w-full bg-[#2b69ff] text-white py-3 rounded-lg hover:bg-[#2458d6] disabled:bg-white/10 transition-colors mt-4 font-bold text-base border border-white/10"
          >
            {loading ? "Posting..." : "Post"}
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
}
