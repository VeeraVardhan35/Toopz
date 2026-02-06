import { useState } from "react";
import toast from "react-hot-toast";
import { deleteMessage, editMessage } from "../api/messages.api";

export default function MessageList({ messages, currentUserId }) {
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editContent, setEditContent] = useState("");

  const DEFAULT_PROFILE_IMAGE =
    "https://cdn-icons-png.flaticon.com/512/847/847969.png";

  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDeleteMessage = async (messageId) => {
    if (!confirm("Are you sure you want to delete this message?")) return;
    try {
      await deleteMessage(messageId);
    } catch (error) {
      toast.error("Failed to delete message");
    }
  };

  const handleEditMessage = (message) => {
    setEditingMessageId(message.id);
    setEditContent(message.content);
  };

  const handleSaveEdit = async (messageId) => {
    if (!editContent.trim()) return;
    try {
      await editMessage(messageId, editContent);
      setEditingMessageId(null);
      setEditContent("");
    } catch (error) {
      toast.error("Failed to edit message");
    }
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditContent("");
  };

  const renderMessageContent = (message) => {
    if (message.isDeleted) {
      return (
        <p className="text-gray-500 italic text-sm">This message was deleted</p>
      );
    }

    if (editingMessageId === message.id) {
      return (
        <div className="flex gap-2">
          <input
            type="text"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") handleSaveEdit(message.id);
            }}
            className="flex-1 bg-[#1E2329] text-white px-3 py-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          <button
            onClick={() => handleSaveEdit(message.id)}
            className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 text-sm"
          >
            Save
          </button>
          <button
            onClick={handleCancelEdit}
            className="bg-gray-600 text-white px-3 py-1 rounded-lg hover:bg-gray-700 text-sm"
          >
            Cancel
          </button>
        </div>
      );
    }

    return (
      <>
        {message.type === "text" && (
          <p className="text-white break-words">{message.content}</p>
        )}

        {message.type === "image" && message.fileUrl && (
          <div>
            {message.content && <p className="text-white mb-2">{message.content}</p>}
            <img
              src={message.fileUrl}
              alt="attachment"
              className="max-w-sm rounded-lg cursor-pointer"
              onClick={() => window.open(message.fileUrl, "_blank")}
            />
          </div>
        )}

        {message.type === "video" && message.fileUrl && (
          <div>
            {message.content && <p className="text-white mb-2">{message.content}</p>}
            <video
              src={message.fileUrl}
              controls
              className="max-w-sm rounded-lg"
            />
          </div>
        )}

        {message.type === "file" && message.fileUrl && (
          <a
            href={message.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-[#1E2329] p-3 rounded-lg hover:bg-[#252B36] transition-colors"
          >
            <svg
              className="w-6 h-6 text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
              />
            </svg>
            <div className="flex-1">
              <p className="text-white font-medium">{message.fileName}</p>
              <p className="text-xs text-gray-400">
                {(message.fileSize / 1024).toFixed(2)} KB
              </p>
            </div>
          </a>
        )}

        {message.isEdited && (
          <p className="text-xs text-gray-500 mt-1">(edited)</p>
        )}
      </>
    );
  };

  const groupMessagesByDate = (messages) => {
    const groups = {};
    messages.forEach((message) => {
      const date = new Date(message.createdAt).toLocaleDateString();
      if (!groups[date]) groups[date] = [];
      groups[date].push(message);
    });
    return groups;
  };

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="space-y-4">
      {Object.entries(messageGroups).map(([date, dateMessages]) => (
        <div key={date}>
          {/* Date Divider */}
          <div className="flex items-center gap-4 my-4">
            <div className="flex-1 border-t border-gray-700"></div>
            <span className="text-xs text-gray-500 font-medium">{date}</span>
            <div className="flex-1 border-t border-gray-700"></div>
          </div>

          {/* Messages */}
          {dateMessages.map((message) => {
            const isOwnMessage = message.sender?.id === currentUserId;

            return (
              <div
                key={message.id}
                className={`flex gap-3 mb-4 ${
                  isOwnMessage ? "flex-row-reverse" : "flex-row"
                }`}
              >
                {!isOwnMessage && (
                  <img
                    src={message.sender?.profileUrl || DEFAULT_PROFILE_IMAGE}
                    alt={message.sender?.name}
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                  />
                )}

                <div className={`max-w-md ${isOwnMessage ? "items-end" : "items-start"}`}>
                  {!isOwnMessage && (
                    <p className="text-xs text-gray-400 mb-1">{message.sender?.name}</p>
                  )}

                  <div className="relative group">
                    <div
                      className={`p-3 rounded-2xl ${
                        isOwnMessage
                          ? "bg-blue-600 text-white rounded-tr-none"
                          : "bg-[#252B36] text-white rounded-tl-none"
                      }`}
                    >
                      {renderMessageContent(message)}
                      
                      {/* WhatsApp-style timestamp and read receipt in message bubble */}
                      <div className="flex items-center justify-end gap-1 mt-1 -mb-1">
                        <span className={`text-xs ${isOwnMessage ? 'opacity-70' : 'text-gray-400'}`}>
                          {formatTime(message.createdAt)}
                        </span>
                        
                        {/* Read Receipt Checkmarks for own messages */}
                        {isOwnMessage && !message.isDeleted && (
                          <div className="flex items-center">
                            {message.readBy && message.readBy.length > 0 ? (
                              <div 
                                className="flex items-center" 
                                title={`Read by ${message.readBy.map(r => r.userName).join(', ')}`}
                              >
                                <svg className="w-4 h-4 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                </svg>
                                <svg className="w-4 h-4 text-blue-300 -ml-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            ) : (
                              <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {isOwnMessage && !message.isDeleted && (
                      <div className="absolute top-0 right-full mr-2 hidden group-hover:flex gap-1">
                        <button
                          onClick={() => handleEditMessage(message)}
                          className="bg-gray-700 hover:bg-gray-600 text-white p-1 rounded-full transition-colors"
                          title="Edit"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteMessage(message.id)}
                          className="bg-red-600 hover:bg-red-700 text-white p-1 rounded-full transition-colors"
                          title="Delete"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {isOwnMessage && <div className="w-8"></div>}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
