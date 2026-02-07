import { useState, useEffect } from "react";
import { getAllEmails, getEmailsByType, getUnreadCount, searchEmails } from "../api/emails.api";
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
  
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    if (searchQuery.trim()) return;
    setCurrentPage(1); // Reset to page 1 when category changes
    fetchEmails(1, false);
    fetchUnreadCount();
  }, [activeCategory]);

  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) {
      fetchEmails(1, false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const response = await searchEmails(q, 1, 20);
        setEmails(response.emails || []);
        setPagination(response.pagination || null);
        setCurrentPage(1);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

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
    <div className="min-h-screen bg-[#0f1216]">
      <div className="h-screen px-4 py-6">
        <div className="mx-auto max-w-7xl h-full grid grid-cols-1 lg:grid-cols-[260px_380px_1fr] xl:grid-cols-[280px_420px_1fr] gap-6">
          {/* Sidebar */}
          <div className="panel-card p-3 min-h-0">
            <EmailSidebar
              activeCategory={activeCategory}
              onCategoryChange={handleCategoryChange}
              onComposeClick={() => setShowCompose(true)}
              unreadCounts={unreadCounts}
            />
          </div>

          {/* Email List */}
          <div className="panel-card flex flex-col overflow-hidden min-h-0">
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
              <div className="p-4 bg-[#14181d] border-t border-white/10">
                <div className="flex items-center justify-between text-sm text-slate-400">
                  <div>
                    Page {pagination.currentPage} of {pagination.totalPages} 
                    ({pagination.totalItems} emails)
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => fetchEmails(currentPage - 1, false)}
                      disabled={!pagination.hasPrevPage || loadingMore}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    
                    {pagination.hasNextPage && (
                      <button
                        onClick={handleLoadMore}
                        disabled={loadingMore}
                        className="px-4 py-2 bg-[#2b69ff] hover:bg-[#2458d6] rounded-lg transition-colors disabled:opacity-50"
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
          <div className="panel-card overflow-hidden min-h-0">
            <EmailDetail
              email={selectedEmail}
              onEmailUpdate={handleEmailUpdate}
              onClose={() => setSelectedEmail(null)}
            />
          </div>
        </div>
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <ComposeEmail
          onClose={() => setShowCompose(false)}
          onEmailSent={handleEmailUpdate}
        />
      )}
    </div>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> 2cd663c (Ready for Deployment with reduced errors)
