import { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";
import { getConversations, getOrCreateConversation, createGroupConversation } from "../api/messages.api";
import { initializeSocket, disconnectSocket } from "../config/socket.client";
import ConversationList from "../components/ConversationList";
import ChatWindow from "../components/ChatWindow";
import SearchUsers from "../components/SearchUsers";

export default function Messages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const [socketInitialized, setSocketInitialized] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    if (user && !socketInitialized) {
      console.log("🔌 Initializing socket for user:", user.id);
      try {
        initializeSocket(user.id);
        setSocketInitialized(true);
        console.log("✅ Socket initialized successfully");
      } catch (error) {
        console.error("❌ Socket initialization error:", error);
      }
      fetchConversations();
    }

    return () => {
      if (socketInitialized) {
        console.log("🔌 Disconnecting socket on unmount");
        disconnectSocket();
        setSocketInitialized(false);
      }
    };
  }, [user]);

  const fetchConversations = async (page = 1, append = false) => {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      
      console.log("📥 Fetching conversations page:", page);
      const response = await getConversations(page, 20);
      console.log("✅ Fetched conversations:", response.conversations?.length || 0);
      
      if (append) {
        setConversations(prev => [...prev, ...(response.conversations || [])]);
      } else {
        setConversations(response.conversations || []);
      }
      
      setPagination(response.pagination);
      setCurrentPage(page);
    } catch (error) {
      console.error("❌ Fetch conversations error:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (pagination && pagination.hasNextPage && !loadingMore) {
      fetchConversations(currentPage + 1, true);
    }
  };

  const handleSelectConversation = (conversation) => {
    console.log("📱 Selected conversation:", conversation);
    setSelectedConversation(conversation);
  };

  const handleStartChat = async (selection) => {
    try {
      console.log("💬 Starting chat with:", selection);
      
      let response;
      if (selection.type === "user") {
        // Direct conversation with a user
        response = await getOrCreateConversation(selection.id);
      } else if (selection.type === "group") {
        // Group conversation
        response = await createGroupConversation(selection.id);
      } else {
        throw new Error("Invalid selection type");
      }
      
      console.log("✅ Conversation created/found:", response.conversation);
      setSelectedConversation(response.conversation);
      setShowSearch(false);
      fetchConversations(1, false); // Refresh from beginning
    } catch (error) {
      console.error("❌ Start chat error:", error);
      alert("Failed to start chat. Please try again.");
    }
  };

  return (
    <div className="flex h-screen bg-[#2C3440]">
      {/* Conversation List */}
      <div className="w-96 border-r border-gray-700 flex flex-col bg-[#1E2329]">
        {/* Header */}
        <div className="p-4 border-b border-gray-700 bg-[#252B36]">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-2xl font-bold text-white">Messages</h1>
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full transition-colors"
              title="New chat"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </button>
          </div>

          {showSearch && (
            <SearchUsers
              onSelectUser={handleStartChat}
              onClose={() => setShowSearch(false)}
            />
          )}
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          <ConversationList
            conversations={conversations}
            selectedConversation={selectedConversation}
            onSelectConversation={handleSelectConversation}
            loading={loading}
          />
          
          {/* Load More Button */}
          {pagination && pagination.hasNextPage && (
            <div className="p-4">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="w-full bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {loadingMore ? "Loading..." : "Load More Conversations"}
              </button>
            </div>
          )}
          
          {/* Pagination Info */}
          {pagination && (
            <div className="p-2 text-center text-xs text-gray-500">
              Page {pagination.currentPage} of {pagination.totalPages} 
              ({pagination.totalItems} total)
            </div>
          )}
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1">
        {selectedConversation ? (
          socketInitialized ? (
            <ChatWindow
              conversation={selectedConversation}
              onConversationUpdate={() => fetchConversations(1, false)}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-400">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p>Connecting...</p>
              </div>
            </div>
          )
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-400">
              <svg
                className="w-24 h-24 mx-auto mb-4 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <p className="text-xl font-semibold mb-2">No conversation selected</p>
              <p className="text-sm">
                Choose a conversation from the list or start a new one
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}