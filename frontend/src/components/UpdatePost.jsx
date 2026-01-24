import { useState } from "react";
import { axiosInstance } from "../api/axios.api";

export default function UpdatePostModal({ post, onClose, onPostUpdated }) {
  const [content, setContent] = useState(post.content);
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(post.media?.url || null);
  const [mediaType, setMediaType] = useState(post.media?.type || null);
  const [loading, setLoading] = useState(false);

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
        formData.append("files", mediaFile);
      }

      const res = await axiosInstance.put(`/posts/${post.id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });

      console.log("Post updated:", res.data);

      if (onPostUpdated) {
        onPostUpdated();
      }

      alert("Post updated successfully!");
      onClose();
    } catch (err) {
      console.error("Update post error:", err);
      alert("Failed to update post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Edit Post</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <textarea
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 resize-none"
            rows="4"
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

          <div className="flex justify-between items-center mt-4">
            <label className="cursor-pointer text-gray-600 hover:text-blue-500 flex items-center gap-1">
              <span>📷</span>
              <span className="text-sm">Change Photo/Video</span>
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !content.trim()}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Updating..." : "Update"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}