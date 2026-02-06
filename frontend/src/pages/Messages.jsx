import { useState, useEffect } from "react";
import toast from "react-hot-toast";
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
  
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    if (user && !socketInitialized) {
      try {
        initializeSocket(user.id);
        setSocketInitialized(true);
      } catch (error) {
      }
      fetchConversations();
    }

    return () => {
      if (socketInitialized) {
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
      
      const response = await getConversations(page, 20);
      
      if (append) {
        setConversations(prev => [...prev, ...(response.conversations || [])]);
      } else {
        setConversations(response.conversations || []);
      }
      
      setPagination(response.pagination);
      setCurrentPage(page);
    } catch (error) {
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
    setSelectedConversation(conversation);
  };

  const handleStartChat = async (selection) => {
    try {
      
      let response;
      if (selection.type === "user") {
        response = await getOrCreateConversation(selection.id);
      } else if (selection.type === "group") {
        response = await createGroupConversation(selection.id);
      } else {
        throw new Error("Invalid selection type");
      }
      
      setSelectedConversation(response.conversation);
      setShowSearch(false);
      fetchConversations(1, false); // Refresh from beginning
    } catch (error) {
      toast.error("Failed to start chat. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1216]">
      <div className="h-screen px-4 py-6">
        <div className="mx-auto max-w-7xl h-full grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6">
          {/* Conversation List */}
          <div className="panel-card flex flex-col overflow-hidden min-h-0">
            {/* Header */}
            <div className="p-4 border-b border-white/10 bg-[#14181d]">
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
                    className="w-full bg-white/5 hover:bg-white/10 text-white py-2 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {loadingMore ? "Loading..." : "Load More Conversations"}
                  </button>
                </div>
              )}
              
              {/* Pagination Info */}
              {pagination && (
                <div className="p-2 text-center text-xs text-slate-400">
                  Page {pagination.currentPage} of {pagination.totalPages} 
                  ({pagination.totalItems} total)
                </div>
              )}
            </div>
          </div>

          {/* Chat Window */}
          <div className="panel-card overflow-hidden min-h-0">
            {selectedConversation ? (
              socketInitialized ? (
                <ChatWindow
                  conversation={selectedConversation}
                  onConversationUpdate={() => fetchConversations(1, false)}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-slate-400">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p>Connecting...</p>
                  </div>
                </div>
              )
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-slate-400">
                  <svg
                    className="w-24 h-24 mx-auto mb-4 text-slate-400"
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
      </div>
    </div>
  );
}
