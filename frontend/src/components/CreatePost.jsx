import { useState } from "react";
import { axiosInstance } from "../api/axios.api";

export default function CreatePost({ currentUser, onPostCreated }) {
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
      formData.append("universityId", currentUser.universityId);
      formData.append("authorId", currentUser.id);

      if (mediaFile) {
        formData.append("files", mediaFile);
      }

      const res = await axiosInstance.post("/posts", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });

      console.log("Post created:", res.data);

      setContent("");
      setMediaFile(null);
      setMediaPreview(null);
      setMediaType(null);

      if (onPostCreated) {
        onPostCreated();
      }

      alert("Post created successfully!");
    } catch (err) {
      console.error("Create post error:", err);
      alert("Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border rounded-lg p-4 shadow bg-white mb-4">
      <div className="flex gap-3">
        <img
          src={currentUser?.profileUrl || DEFAULT_PROFILE_IMAGE}
          alt="profile"
          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
        />
        <form onSubmit={handleSubmit} className="flex-1">
          <textarea
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 resize-none"
            rows="3"
          />

          {mediaPreview && (
            <div className="mt-3 relative">
              {mediaType === "IMAGE" && (
                <img
                  src={mediaPreview}
                  alt="preview"
                  className="w-full rounded-lg max-h-96 object-cover"
                />
              )}
              {mediaType === "VIDEO" && (
                <video
                  src={mediaPreview}
                  controls
                  className="w-full rounded-lg max-h-96"
                />
              )}
              <button
                type="button"
                onClick={removeMedia}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600"
              >
                ✕
              </button>
            </div>
          )}

          <div className="flex justify-between items-center mt-3">
            <div className="flex gap-2">
              <label className="cursor-pointer text-gray-600 hover:text-blue-500 flex items-center gap-1">
                <span>📷</span>
                <span className="text-sm">Photo/Video</span>
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
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Posting..." : "Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}