export default function ConversationList({
  conversations,
  selectedConversation,
  onSelectConversation,
  loading,
}) {
  const DEFAULT_PROFILE_IMAGE =
    "https://cdn-icons-png.flaticon.com/512/847/847969.png";

  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) return "just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return date.toLocaleDateString();
  };

  const getConversationName = (conversation) => {
    if (conversation.type === "direct") {
      return conversation.otherUser?.name || "Unknown User";
    }
    return conversation.name || "Group Chat";
  };

  const getConversationAvatar = (conversation) => {
    if (conversation.type === "direct") {
      return conversation.otherUser?.profileUrl || DEFAULT_PROFILE_IMAGE;
    }
    return conversation.avatarUrl || DEFAULT_PROFILE_IMAGE;
  };

  const getLastMessagePreview = (lastMessage) => {
    if (!lastMessage) return "No messages yet";
    if (lastMessage.type === "image") return "📷 Image";
    if (lastMessage.type === "video") return "🎥 Video";
    if (lastMessage.type === "file") return "📎 File";
    return lastMessage.content || "";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-400">Loading conversations...</div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 text-center">
        <div className="text-gray-400">
          <p className="mb-2">No conversations yet</p>
          <p className="text-sm">Start chatting by clicking the + button</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {conversations.map((conversation) => (
        <div
          key={conversation.id}
          onClick={() => onSelectConversation(conversation)}
          className={`p-4 border-b border-gray-800 cursor-pointer hover:bg-[#252B36] transition-colors ${
            selectedConversation?.id === conversation.id ? "bg-[#252B36]" : ""
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="relative">
              <img
                src={getConversationAvatar(conversation)}
                alt={getConversationName(conversation)}
                className="w-12 h-12 rounded-full object-cover"
              />
              {conversation.unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {conversation.unreadCount > 9 ? "9+" : conversation.unreadCount}
                </span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3
                  className={`font-semibold truncate ${
                    conversation.unreadCount > 0 ? "text-white" : "text-gray-300"
                  }`}
                >
                  {getConversationName(conversation)}
                </h3>
                <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                  {formatTime(conversation.lastMessage?.createdAt)}
                </span>
              </div>

              <p
                className={`text-sm truncate ${
                  conversation.unreadCount > 0
                    ? "text-gray-300 font-medium"
                    : "text-gray-500"
                }`}
              >
                {getLastMessagePreview(conversation.lastMessage)}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}