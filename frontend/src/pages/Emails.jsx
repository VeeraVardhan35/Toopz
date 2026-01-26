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

  useEffect(() => {
    fetchEmails();
    fetchUnreadCount();
  }, [activeCategory]);

  const fetchEmails = async () => {
    try {
      setLoading(true);
      let response;

      if (activeCategory === "all") {
        response = await getAllEmails();
      } else if (activeCategory === "important") {
        response = await getAllEmails("important");
      } else {
        response = await getEmailsByType(activeCategory);
      }

      setEmails(response.emails || []);
    } catch (error) {
      console.error("Fetch emails error:", error);
    } finally {
      setLoading(false);
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
    fetchEmails();
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
      <EmailList
        emails={emails}
        selectedEmail={selectedEmail}
        onEmailClick={handleEmailClick}
        loading={loading}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onEmailUpdate={handleEmailUpdate}
      />

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