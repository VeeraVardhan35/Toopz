import { useState, useEffect } from "react";
import { getAllEmails, getEmailsByType, getUnreadCount } from "../api/emails.api";
import EmailSidebar from "../components/EmailSidebar";
import EmailList from "../components/EmailList";
import EmailDetail from "../components/EmailDetail";
import ComposeEmail from "../components/ComposeEmail";

export default function Emails() {
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [showCompose, setShowCompose] = useState(false);
  const [loading, setLoading] = useState(true);
  const [unreadCounts, setUnreadCounts] = useState({
    total: 0,
    important: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    setCurrentPage(1); // Reset to page 1 when category changes
    fetchEmails(1, false);
    fetchUnreadCount();
  }, [activeCategory]);

  const fetchEmails = async (page = 1, append = false) => {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      
      let response;

      if (activeCategory === "all") {
        response = await getAllEmails(null, page, 20);
      } else if (activeCategory === "important") {
        response = await getAllEmails("important", page, 20);
      } else if (activeCategory === "unread") {
        response = await getAllEmails("unread", page, 20);
      } else {
        response = await getEmailsByType(activeCategory, page, 20);
      }

      if (append) {
        setEmails(prev => [...prev, ...(response.emails || [])]);
      } else {
        setEmails(response.emails || []);
      }
      
      setPagination(response.pagination);
      setCurrentPage(page);
    } catch (error) {
      console.error("Fetch emails error:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (pagination && pagination.hasNextPage && !loadingMore) {
      fetchEmails(currentPage + 1, true);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await getUnreadCount();
      setUnreadCounts({
        total: response.unreadCount,
        important: response.importantUnreadCount,
      });
    } catch (error) {
      console.error("Fetch unread count error:", error);
    }
  };

  const handleEmailClick = (email) => {
    setSelectedEmail(email);
  };

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    setSelectedEmail(null);
  };

  const handleEmailUpdate = () => {
    fetchEmails(1, false); // Refresh from beginning
    fetchUnreadCount();
  };

  return (
    <div className="flex h-screen bg-[#2C3440] overflow-hidden">
      {/* Sidebar */}
      <EmailSidebar
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
        onComposeClick={() => setShowCompose(true)}
        unreadCounts={unreadCounts}
      />

      {/* Email List */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <EmailList
          emails={emails}
          selectedEmail={selectedEmail}
          onEmailClick={handleEmailClick}
          loading={loading}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onEmailUpdate={handleEmailUpdate}
        />
        
        {/* Pagination Controls */}
        {!loading && pagination && pagination.totalPages > 1 && (
          <div className="p-4 bg-[#252B36] border-t border-gray-700">
            <div className="flex items-center justify-between text-sm text-gray-400">
              <div>
                Page {pagination.currentPage} of {pagination.totalPages} 
                ({pagination.totalItems} emails)
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => fetchEmails(currentPage - 1, false)}
                  disabled={!pagination.hasPrevPage || loadingMore}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {pagination.hasNextPage && (
                  <button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {loadingMore ? "Loading..." : "Load More"}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Email Detail */}
      <EmailDetail
        email={selectedEmail}
        onEmailUpdate={handleEmailUpdate}
        onClose={() => setSelectedEmail(null)}
      />

      {/* Compose Modal */}
      {showCompose && (
        <ComposeEmail
          onClose={() => setShowCompose(false)}
          onEmailSent={handleEmailUpdate}
        />
      )}
    </div>
  );
}