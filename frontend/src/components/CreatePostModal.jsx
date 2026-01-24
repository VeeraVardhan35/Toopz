import { useState } from "react";
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
      alert("Please write something!");
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

      console.log("Post created successfully:", res.data);
      alert("Post created successfully!");
      
      if (onPostCreated) {
        onPostCreated();
      }
      
      onClose();
    } catch (err) {
      console.error("Create post error:", err);
      alert("Failed to create post: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white border-4 border-black rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b-2 border-black px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-black">Create Post</h2>
          <button
            onClick={onClose}
            className="text-black hover:text-gray-700 text-2xl font-bold"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="flex gap-3 mb-4">
            <img
              src={user?.profileUrl || DEFAULT_PROFILE_IMAGE}
              alt="profile"
              className="w-10 h-10 rounded-full object-cover flex-shrink-0 border-2 border-black"
            />
            <div>
              <p className="font-bold text-black">{user?.name || "User"}</p>
              <p className="text-xs text-gray-600">
                {user?.department || "Public"} • {user?.batch || ""}
              </p>
            </div>
          </div>

          <textarea
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full border-2 border-black rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black resize-none text-black"
            rows="5"
            autoFocus
          />

          {mediaPreview && (
            <div className="mt-3 relative">
              {mediaType === "IMAGE" && (
                <img
                  src={mediaPreview}
                  alt="preview"
                  className="w-full rounded-lg max-h-96 object-cover border-2 border-black"
                />
              )}
              {mediaType === "VIDEO" && (
                <video
                  src={mediaPreview}
                  controls
                  className="w-full rounded-lg max-h-96 border-2 border-black"
                >
                  Your browser does not support the video tag.
                </video>
              )}
              <button
                type="button"
                onClick={removeMedia}
                className="absolute top-2 right-2 bg-black text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-800 transition-colors font-bold border-2 border-white"
              >
                ✕
              </button>
            </div>
          )}

          <div className="border-2 border-black rounded-lg p-3 mt-4 bg-white">
            <label className="cursor-pointer flex items-center justify-between hover:bg-gray-100 p-2 rounded transition-colors">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📷</span>
                <span className="font-semibold text-black">Add Photo/Video</span>
              </div>
              <span className="text-sm text-gray-600 font-semibold">Browse</span>
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
            className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 disabled:bg-gray-400 transition-colors mt-4 font-bold text-base border-2 border-black"
          >
            {loading ? "Posting..." : "Post"}
          </button>
        </form>
      </div>
    </div>
  );
}