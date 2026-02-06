import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../AuthContext";
import { getMessages, markAsRead } from "../api/messages.api";
import { getSocket } from "../config/socket.client";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

export default function ChatWindow({ conversation, onConversationUpdate }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typing, setTyping] = useState(null);
  const messagesEndRef = useRef(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasLoadedInitial, setHasLoadedInitial] = useState(false);

  const DEFAULT_PROFILE_IMAGE =
    "https://cdn-icons-png.flaticon.com/512/847/847969.png";

  useEffect(() => {
    if (conversation) {
      setMessages([]); // Clear messages when conversation changes
      setCurrentPage(1);
      setHasLoadedInitial(false);
      fetchMessages(1, false);
      joinConversation();
      markMessagesAsRead();
    }

    return () => {
      if (conversation) {
        leaveConversation();
      }
    };
  }, [conversation?.id]);

  useEffect(() => {
    const socket = getSocket();

    const handleNewMessage = (message) => {
      if (message.conversationId === conversation.id) {
        setMessages((prev) => {
          const exists = prev.some((m) => m.id === message.id);
          if (exists) {
            return prev;
          }
          return [...prev, message];
        });
        scrollToBottom();
        onConversationUpdate();
      }
    };

    const handleMessageSent = (message) => {
      setMessages((prev) => {
        const exists = prev.some((m) => m.id === message.id);
        if (exists) return prev;
        return [...prev, message];
      });
      scrollToBottom();
    };

    socket.on("new_message", handleNewMessage);
    socket.on("message_sent", handleMessageSent);

    socket.on("user_typing", ({ userId, userName }) => {
      if (userId !== user.id) {
        setTyping(userName);
      }
    });

    socket.on("user_stopped_typing", ({ userId }) => {
      if (userId !== user.id) {
        setTyping(null);
      }
    });

    socket.on("message_edited", (updatedMessage) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === updatedMessage.id ? { ...msg, ...updatedMessage } : msg
        )
      );
    });

    socket.on("message_deleted", ({ messageId }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? { ...msg, isDeleted: true, content: "This message was deleted" }
            : msg
        )
      );
    });

    socket.on("message_read", ({ messageId, readBy }) => {
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id === messageId) {
            const existingReadBy = msg.readBy || [];
            const alreadyRead = existingReadBy.some(r => r.userId === readBy.userId);
            
            if (!alreadyRead) {
              return {
                ...msg,
                readBy: [...existingReadBy, readBy],
                isRead: true,
              };
            }
          }
          return msg;
        })
      );
    });

    return () => {
      socket.off("new_message", handleNewMessage);
      socket.off("message_sent", handleMessageSent);
      socket.off("user_typing");
      socket.off("user_stopped_typing");
      socket.off("message_edited");
      socket.off("message_deleted");
      socket.off("message_read");
    };
  }, [conversation?.id, user.id]);

  const fetchMessages = async (page = 1, append = false) => {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      
      const response = await getMessages(conversation.id, page, 50);
      
      if (append) {
        setMessages(prev => [...(response.messages || []), ...prev]);
      } else {
        setMessages(response.messages || []);
      }
      
      setPagination(response.pagination);
      setCurrentPage(page);
      setHasLoadedInitial(true);
      
      if (page === 1) {
        scrollToBottom();
      }
    } catch (error) {
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (pagination && pagination.hasNextPage && !loadingMore) {
      fetchMessages(currentPage + 1, true);
    }
  };

  const joinConversation = () => {
    const socket = getSocket();
    socket.emit("join_conversation", conversation.id);
  };

  const leaveConversation = () => {
    const socket = getSocket();
    socket.emit("leave_conversation", conversation.id);
  };

  const markMessagesAsRead = async () => {
    try {
      await markAsRead(conversation.id);
      onConversationUpdate();
    } catch (error) {
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleSendMessage = (messageData) => {
    
    try {
      const socket = getSocket();
      
      if (!socket.connected) {
        toast.error("Connection lost. Please refresh the page.");
        return;
      }
      
      const payload = {
        conversationId: conversation.id,
        content: messageData.content,
        type: messageData.type || "text",
        fileUrl: messageData.fileUrl,
        fileName: messageData.fileName,
        fileSize: messageData.fileSize,
      };
      
      socket.emit("send_message", payload);
    } catch (error) {
      toast.error("Failed to send message. Please refresh the page.");
    }
  };

  const getConversationName = () => {
    if (conversation.type === "direct") {
      return conversation.otherUser?.name || "Unknown User";
    }
    return conversation.name || "Group Chat";
  };

  const getConversationAvatar = () => {
    if (conversation.type === "direct") {
      return conversation.otherUser?.profileUrl || DEFAULT_PROFILE_IMAGE;
    }
    return conversation.avatarUrl || DEFAULT_PROFILE_IMAGE;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 bg-[#252B36]">
        <div className="flex items-center gap-3">
          <img
            src={getConversationAvatar()}
            alt={getConversationName()}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="flex-1">
            <h2 className="text-white font-semibold">{getConversationName()}</h2>
            {typing ? (
              <p className="text-sm text-blue-400">{typing} is typing...</p>
            ) : (
              <p className="text-sm text-gray-400">
                {conversation.type === "group"
                  ? `${conversation.participants?.length || 0} members`
                  : "Active now"}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-[#2C3440]">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-400">Loading messages...</div>
          </div>
        ) : (
          <>
            {/* Load More Button at Top */}
            {hasLoadedInitial && pagination && pagination.hasNextPage && (
              <div className="mb-4 text-center">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  {loadingMore 
                    ? "Loading..." 
                    : `Load Earlier Messages (${pagination.currentPage}/${pagination.totalPages})`
                  }
                </button>
              </div>
            )}
            
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-gray-400">
                  <p className="text-lg mb-2">No messages yet</p>
                  <p className="text-sm">Start the conversation by sending a message</p>
                </div>
              </div>
            ) : (
              <>
                <MessageList messages={messages} currentUserId={user.id} />
                <div ref={messagesEndRef} />
              </>
            )}
          </>
        )}
      </div>

      {/* Message Input */}
      <MessageInput
        conversationId={conversation.id}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
}
