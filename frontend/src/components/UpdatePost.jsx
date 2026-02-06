import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";
import { axiosInstance } from "../api/axios.api";

export default function UpdatePostModal({ post, onClose, onPostUpdated }) {
  const initialContent = post?.content ?? "";
  const [content, setContent] = useState(initialContent);
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(post.media?.url || null);
  const [mediaType, setMediaType] = useState(post.media?.type || null);
  const [loading, setLoading] = useState(false);

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

    if (!String(content).trim()) {
      toast.error("Please write something!");
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


      if (onPostUpdated) {
        onPostUpdated();
      }

      toast.success("Post updated successfully!");
      onClose();
    } catch (err) {
      toast.error("Failed to update post");
    } finally {
      setLoading(false);
    }
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4">
      <div className="bg-[#1b2027] border border-white/10 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl text-slate-100">
        <div className="sticky top-0 bg-[#1b2027] border-b border-white/10 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-slate-100">Edit Post</h2>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white text-2xl"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <textarea
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full border border-white/10 bg-[#14181d] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#2b69ff]/60 resize-none text-slate-100"
            rows="4"
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
                />
              )}
              <button
                type="button"
                onClick={removeMedia}
                className="absolute top-2 right-2 bg-red-500/70 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-500"
              >
                ✕
              </button>
            </div>
          )}

          <div className="flex justify-between items-center mt-4">
            <label className="cursor-pointer text-slate-400 hover:text-slate-200 flex items-center gap-1">
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
                className="px-6 py-2 border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !String(content).trim()}
                className="bg-[#2b69ff] text-white px-6 py-2 rounded-lg hover:bg-[#2458d6] disabled:bg-white/10 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Updating..." : "Update"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
