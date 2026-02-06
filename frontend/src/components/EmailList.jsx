import { useState } from "react";
import { toggleStar } from "../api/emails.api";

export default function EmailList({
  emails,
  selectedEmail,
  onEmailClick,
  loading,
  searchQuery,
  setSearchQuery,
  onEmailUpdate,
}) {
  const DEFAULT_PROFILE_IMAGE =
    "https://cdn-icons-png.flaticon.com/512/847/847969.png";

  const handleToggleStar = async (e, emailId) => {
    e.stopPropagation();
    try {
      await toggleStar(emailId);
      onEmailUpdate();
    } catch (error) {
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 24) {
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      return date.toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
      });
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      Academic: "bg-green-500",
      Clubs: "bg-blue-500",
      "Lost & Found": "bg-yellow-500",
      "Optional / Misc": "bg-purple-500",
      General: "bg-gray-500",
    };
    return colors[type] || "bg-gray-500";
  };

  return (
    <div className="w-96 bg-[#1E2329] flex flex-col">
      {/* Search Bar */}
      <div className="p-4 border-b border-gray-700">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search"
            className="w-full bg-[#2C3440] text-white px-4 py-2 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <svg
            className="w-5 h-5 text-gray-400 absolute left-3 top-2.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <button className="absolute right-3 top-2.5">
            <svg
              className="w-5 h-5 text-gray-400 hover:text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Email List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-400">Loading...</div>
          </div>
        ) : emails.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-400">No emails found</div>
          </div>
        ) : (
          emails.map((email) => (
            <div
                key={email.id}
                onClick={() => onEmailClick(email)}
                className={`p-4 border-b border-gray-700 cursor-pointer hover:bg-[#252B36] transition-colors relative ${
                    selectedEmail?.id === email.id ? "bg-[#252B36]" : ""
                } ${!email.isRead ? "bg-[#252B36]/30" : ""}`}
                >
                {/* New Replies Badge */}
                {email.replyCount > 0 && !email.isRead && (
                    <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {email.replyCount} new
                    </div>
                )}
              <div className="flex items-start gap-3">
                {/* Profile Image */}
                <img
                  src={email.sender?.profileUrl || DEFAULT_PROFILE_IMAGE}
                  alt={email.sender?.name}
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                />

                {/* Email Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3
                      className={`font-semibold truncate ${
                        email.isRead ? "text-gray-300" : "text-white"
                      }`}
                    >
                      {email.sender?.name}
                    </h3>
                    {!email.isRead && (
                      <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 ml-2"></span>
                    )}
                  </div>

                  <p
                    className={`text-sm truncate mb-2 ${
                      email.isRead ? "text-gray-400" : "text-gray-200"
                    }`}
                  >
                    {email.subject}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {email.replyCount > 0 && (
                        <div className="flex items-center gap-1 text-xs text-blue-400 mt-1">
                            <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                            />
                            </svg>
                            <span>{email.replyCount} {email.replyCount === 1 ? "reply" : "replies"}</span>
                        </div>
                        )}
                      {email.type !== "General" && (
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full text-white ${getTypeColor(
                            email.type
                          )}`}
                        >
                          {email.type}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleToggleStar(e, email.id)}
                        className="hover:scale-110 transition-transform"
                      >
                        {email.isStarred ? (
                          <svg
                            className="w-4 h-4 text-yellow-400 fill-current"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                        ) : (
                          <svg
                            className="w-4 h-4 text-gray-400 hover:text-yellow-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                            />
                          </svg>
                        )}
                      </button>
                      <span className="text-xs text-gray-500">
                        {formatTime(email.createdAt)}
                      </span>
                    </div>
                  </div>

                  {email.replyCount > 0 && (
                    <div className="mt-2 text-xs text-gray-400">
                      {email.replyCount} {email.replyCount === 1 ? "reply" : "replies"}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}