import { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";
import {
  getEmailById,
  markAsRead,
  toggleStar,
  replyToEmail,
  deleteEmail,
} from "../api/emails.api";

export default function EmailDetail({ email, onEmailUpdate, onClose }) {
  const { user } = useAuth();
  const [emailDetail, setEmailDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  const DEFAULT_PROFILE_IMAGE =
    "https://cdn-icons-png.flaticon.com/512/847/847969.png";

  useEffect(() => {
    if (!email) return;

    fetchEmailDetail();

    if (!email.isRead) {
      handleMarkAsRead();
    }
  }, [email]);

  const fetchEmailDetail = async () => {
    if (!email?.id) return;

    try {
      setLoading(true);
      const response = await getEmailById(email.id);
      setEmailDetail(response.email);
    } catch (error) {
      console.error("Fetch email detail error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async () => {
    try {
      await markAsRead(email.id);
      onEmailUpdate();
    } catch (error) {
      console.error("Mark as read error:", error);
    }
  };

  const handleToggleStar = async () => {
    try {
      setEmailDetail((prev) => ({
        ...prev,
        isStarred: !prev.isStarred,
      }));
      await toggleStar(email.id);
      onEmailUpdate();
    } catch (error) {
      console.error("Toggle star error:", error);
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) return;

    try {
      setSendingReply(true);
      await replyToEmail(email.id, replyText);
      setReplyText("");
      fetchEmailDetail();
      onEmailUpdate();
    } catch (error) {
      console.error("Send reply error:", error);
      alert("Failed to send reply");
    } finally {
      setSendingReply(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this email?")) return;

    try {
      await deleteEmail(email.id);
      onEmailUpdate();
      onClose();
    } catch (error) {
      console.error("Delete email error:", error);
      alert("Failed to delete email");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!email) {
    return (
      <div className="flex-1 bg-[#2C3440] flex items-center justify-center text-gray-400">
        Select an email to read
      </div>
    );
  }

  if (loading || !emailDetail) {
    return (
      <div className="flex-1 bg-[#2C3440] flex items-center justify-center text-gray-400">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#2C3440] flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex justify-between mb-4">
          <div className="flex items-center gap-3">
            <img
              src={emailDetail.sender?.profileUrl || DEFAULT_PROFILE_IMAGE}
              className="w-12 h-12 rounded-full"
            />
            <div>
              <h2 className="text-white font-semibold">
                {emailDetail.sender?.name}
              </h2>
              <p className="text-gray-400 text-sm">
                {emailDetail.sender?.email}
              </p>
            </div>
          </div>

          <button
            onClick={handleDelete}
            className="text-red-400 hover:text-red-500"
          >
            🗑
          </button>
        </div>

        <h3 className="text-white text-2xl font-bold">
          {emailDetail.subject}
        </h3>
        <p className="text-gray-400 text-sm">
          {formatDate(emailDetail.createdAt)}
        </p>

        <div className="flex gap-4 mt-4">
          <button
            onClick={handleToggleStar}
            className="text-gray-300 hover:text-white"
          >
            {emailDetail.isStarred ? "⭐" : "☆"}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="bg-[#252B36] p-6 rounded-lg text-gray-300">
          {emailDetail.content}
        </div>

        {/* Attachments */}
        {emailDetail.attachments?.length > 0 && (
          <div className="mt-6">
            <h4 className="text-white mb-3">Attachments</h4>
            <div className="space-y-2">
              {emailDetail.attachments.map((attachment) => (
                <a
                  key={attachment.id}
                  href={attachment.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-[#252B36] rounded-lg hover:bg-[#1E2329]"
                >
                  <span className="text-gray-400">📎</span>
                  <div className="flex-1">
                    <p className="text-white">
                      {attachment.fileName}
                    </p>
                    <p className="text-xs text-gray-400">
                      {(attachment.fileSize / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Replies */}
        {emailDetail.replies?.length > 0 && (
          <div className="mt-6">
            <h4 className="text-white mb-3">
              Replies ({emailDetail.replies.length})
            </h4>
            <div className="space-y-4">
              {emailDetail.replies.map((reply) => (
                <div
                  key={reply.id}
                  className="bg-[#252B36] p-4 rounded-lg"
                >
                  <p className="text-sm text-white font-semibold">
                    {reply.sender?.name}
                  </p>
                  <p className="text-xs text-gray-400 mb-2">
                    {formatDate(reply.createdAt)}
                  </p>
                  <p className="text-gray-300">{reply.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Reply */}
      <div className="p-4 border-t border-gray-700 bg-[#252B36]">
        <div className="flex gap-3">
          <input
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !sendingReply) {
                handleSendReply();
              }
            }}
            placeholder="Reply"
            className="flex-1 bg-[#2C3440] text-white px-4 py-2 rounded-lg"
          />
          <button
            onClick={handleSendReply}
            disabled={sendingReply}
            className="bg-blue-500 px-6 rounded-lg text-white"
          >
            {sendingReply ? "..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
