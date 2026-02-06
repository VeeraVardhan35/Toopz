import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { composeEmail, getAllUsers, getGroupsForEmail } from "../api/emails.api";
import { useAuth } from "../AuthContext";
import { getAllGroups } from "../api/groups.api";

export default function ComposeEmail({ onClose, onEmailSent }) {
  const { user } = useAuth();
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState("General");
  const [recipients, setRecipients] = useState([]);
  const [groupRecipients, setGroupRecipients] = useState([]);
  const [isImportant, setIsImportant] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [fetchingUsers, setFetchingUsers] = useState(false);
  const [showUserList, setShowUserList] = useState(false);
  const [showGroupList, setShowGroupList] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [recipientType, setRecipientType] = useState("users"); // "users" or "groups"

  const emailTypes = [
    "General",
    "Academic",
    "Clubs",
    "Lost & Found",
    "Optional / Misc",
  ];

  const DEFAULT_PROFILE_IMAGE =
    "https://cdn-icons-png.flaticon.com/512/847/847969.png";

  useEffect(() => {
    fetchUsers();
    fetchGroups();
  }, []);

  const fetchUsers = async () => {
    try {
      setFetchingUsers(true);
      const response = await getAllUsers();
      const allUsers = (response.users || []).filter((u) => u.id !== user?.id);
      setUsers(allUsers);
    } catch (error) {
      setError("Failed to load users");
    } finally {
      setFetchingUsers(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await getAllGroups();
      setGroups(response.groups || []);
    } catch (error) {
    }
  };

  const filteredUsers = users.filter((u) => {
    if (recipients.find((r) => r.id === u.id)) return false;
    
    const search = searchQuery.toLowerCase();
    return (
      u.name.toLowerCase().includes(search) ||
      u.email.toLowerCase().includes(search) ||
      u.department?.toLowerCase().includes(search) ||
      u.batch?.toLowerCase().includes(search)
    );
  });

  const filteredGroups = groups.filter((g) => {
    if (groupRecipients.find((gr) => gr.id === g.id)) return false;
    
    const search = searchQuery.toLowerCase();
    return (
      g.name.toLowerCase().includes(search) ||
      g.type?.toLowerCase().includes(search)
    );
  });

  const handleAddRecipient = (selectedUser) => {
    setRecipients([...recipients, selectedUser]);
    setSearchQuery("");
    setShowUserList(false);
  };

  const handleAddGroupRecipient = (group) => {
    setGroupRecipients([...groupRecipients, group]);
    setSearchQuery("");
    setShowGroupList(false);
  };

  const handleRemoveRecipient = (userId) => {
    setRecipients(recipients.filter((r) => r.id !== userId));
  };

  const handleRemoveGroupRecipient = (groupId) => {
    setGroupRecipients(groupRecipients.filter((g) => g.id !== groupId));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setAttachments([...attachments, ...files]);
  };

  const handleRemoveAttachment = (index) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    if (recipientType === "users") {
      setShowUserList(e.target.value.length > 0);
    } else {
      setShowGroupList(e.target.value.length > 0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!subject.trim() || !content.trim()) {
      setError("Subject and content are required");
      return;
    }

    if (recipients.length === 0 && groupRecipients.length === 0) {
      setError("At least one recipient or group is required");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("subject", subject);
      formData.append("content", content);
      formData.append("type", type);
      formData.append("isImportant", isImportant);

      if (recipients.length > 0) {
        formData.append(
          "recipients",
          JSON.stringify(recipients.map((r) => r.id))
        );
      }

      if (groupRecipients.length > 0) {
        formData.append(
          "groupRecipients",
          JSON.stringify(groupRecipients.map((g) => g.id))
        );
      }

      attachments.forEach((file) => {
        formData.append("attachments", file);
      });

      await composeEmail(formData);
      toast.success("Email sent successfully!");
      onEmailSent();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setShowUserList(false);
          setShowGroupList(false);
        }
      }}
    >
      <div className="bg-[#252B36] rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-gray-700">
        {/* Header */}
        <div className="border-b border-gray-700 p-6 flex items-center justify-between sticky top-0 bg-[#252B36] z-10">
          <div>
            <h2 className="text-2xl font-bold text-white">Compose Email</h2>
            {fetchingUsers && (
              <p className="text-sm text-gray-400 mt-1">Loading users...</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-3xl font-bold transition-colors"
            disabled={loading}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/50 text-red-400 rounded-lg font-medium">
              {error}
            </div>
          )}

          {/* Recipient Type Toggle */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setRecipientType("users");
                setSearchQuery("");
                setShowUserList(false);
                setShowGroupList(false);
              }}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                recipientType === "users"
                  ? "bg-blue-500 text-white"
                  : "bg-[#2C3440] text-gray-400 hover:bg-[#1E2329]"
              }`}
            >
              👤 Individual Users
            </button>
            <button
              type="button"
              onClick={() => {
                setRecipientType("groups");
                setSearchQuery("");
                setShowUserList(false);
                setShowGroupList(false);
              }}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                recipientType === "groups"
                  ? "bg-blue-500 text-white"
                  : "bg-[#2C3440] text-gray-400 hover:bg-[#1E2329]"
              }`}
            >
              👥 Groups
            </button>
          </div>

          {/* Individual Recipients */}
          {recipientType === "users" && (
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-300">
                To (Users): * 
                <span className="text-gray-500 font-normal ml-2">
                  ({users.length} users in your university)
                </span>
              </label>
              
              {/* Selected Recipients */}
              {recipients.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3 p-3 bg-[#2C3440] rounded-lg">
                  {recipients.map((recipient) => (
                    <div
                      key={recipient.id}
                      className="flex items-center gap-2 bg-blue-500/20 text-blue-300 px-3 py-1.5 rounded-full border border-blue-500/30"
                    >
                      <img
                        src={recipient.profileUrl || DEFAULT_PROFILE_IMAGE}
                        alt={recipient.name}
                        className="w-5 h-5 rounded-full"
                      />
                      <span className="text-sm font-medium">{recipient.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveRecipient(recipient.id)}
                        className="hover:text-red-400 text-lg leading-none"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Search Input */}
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => searchQuery && setShowUserList(true)}
                  placeholder="Type name, email, department, or batch..."
                  className="w-full p-3 bg-[#2C3440] border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pl-10"
                />
                <svg
                  className="w-5 h-5 text-gray-400 absolute left-3 top-3.5"
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

                {/* User Suggestions Dropdown */}
                {showUserList && searchQuery && (
                  <div className="absolute z-30 w-full mt-2 bg-[#1E2329] border border-gray-700 rounded-lg shadow-2xl max-h-64 overflow-y-auto">
                    {filteredUsers.length === 0 ? (
                      <div className="p-4 text-center text-gray-400">
                        No users found matching "{searchQuery}"
                      </div>
                    ) : (
                      <>
                        <div className="p-2 text-xs text-gray-400 border-b border-gray-700">
                          {filteredUsers.length} result(s)
                        </div>
                        {filteredUsers.slice(0, 10).map((u) => (
                          <button
                            key={u.id}
                            type="button"
                            onClick={() => handleAddRecipient(u)}
                            className="w-full p-3 hover:bg-[#252B36] flex items-center gap-3 text-left transition-colors border-b border-gray-800 last:border-b-0"
                          >
                            <img
                              src={u.profileUrl || DEFAULT_PROFILE_IMAGE}
                              alt={u.name}
                              className="w-10 h-10 rounded-full flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-white font-semibold truncate">
                                {u.name}
                              </p>
                              <p className="text-xs text-gray-400 truncate">
                                {u.email}
                              </p>
                              <p className="text-xs text-gray-500">
                                {u.department} • {u.batch}
                              </p>
                            </div>
                            <svg
                              className="w-5 h-5 text-blue-400 flex-shrink-0"
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
                        ))}
                        {filteredUsers.length > 10 && (
                          <div className="p-2 text-xs text-center text-gray-500">
                            + {filteredUsers.length - 10} more users
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Quick Add Suggestions (when not searching) */}
              {!searchQuery && recipients.length === 0 && users.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-gray-400 mb-2">Suggestions:</p>
                  <div className="flex flex-wrap gap-2">
                    {users.slice(0, 5).map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => handleAddRecipient(u)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-[#2C3440] hover:bg-[#1E2329] rounded-full transition-colors text-sm"
                      >
                        <img
                          src={u.profileUrl || DEFAULT_PROFILE_IMAGE}
                          alt={u.name}
                          className="w-5 h-5 rounded-full"
                        />
                        <span className="text-gray-300">{u.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Group Recipients */}
          {recipientType === "groups" && (
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-300">
                To (Groups): *
                <span className="text-gray-500 font-normal ml-2">
                  ({groups.length} groups available)
                </span>
              </label>

              {/* Selected Groups */}
              {groupRecipients.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3 p-3 bg-[#2C3440] rounded-lg">
                  {groupRecipients.map((group) => (
                    <div
                      key={group.id}
                      className="flex items-center gap-2 bg-green-500/20 text-green-300 px-3 py-1.5 rounded-full border border-green-500/30"
                    >
                      <span className="text-lg">👥</span>
                      <span className="text-sm font-medium">{group.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveGroupRecipient(group.id)}
                        className="hover:text-red-400 text-lg leading-none"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Search Input */}
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => searchQuery && setShowGroupList(true)}
                  placeholder="Type group name or type..."
                  className="w-full p-3 bg-[#2C3440] border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pl-10"
                />
                <svg
                  className="w-5 h-5 text-gray-400 absolute left-3 top-3.5"
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

                {/* Group Suggestions Dropdown */}
                {showGroupList && searchQuery && (
                  <div className="absolute z-30 w-full mt-2 bg-[#1E2329] border border-gray-700 rounded-lg shadow-2xl max-h-64 overflow-y-auto">
                    {filteredGroups.length === 0 ? (
                      <div className="p-4 text-center text-gray-400">
                        No groups found matching "{searchQuery}"
                      </div>
                    ) : (
                      <>
                        <div className="p-2 text-xs text-gray-400 border-b border-gray-700">
                          {filteredGroups.length} result(s)
                        </div>
                        {filteredGroups.map((g) => (
                          <button
                            key={g.id}
                            type="button"
                            onClick={() => handleAddGroupRecipient(g)}
                            className="w-full p-3 hover:bg-[#252B36] flex items-center gap-3 text-left transition-colors border-b border-gray-800 last:border-b-0"
                          >
                            <span className="text-2xl">👥</span>
                            <div className="flex-1">
                              <p className="text-white font-semibold">{g.name}</p>
                              <p className="text-xs text-gray-400">{g.type}</p>
                            </div>
                            <svg
                              className="w-5 h-5 text-green-400 flex-shrink-0"
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
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Quick Add Groups */}
              {!searchQuery && groupRecipients.length === 0 && groups.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-gray-400 mb-2">Your groups:</p>
                  <div className="flex flex-wrap gap-2">
                    {groups.slice(0, 5).map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => handleAddGroupRecipient(g)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-[#2C3440] hover:bg-[#1E2329] rounded-full transition-colors text-sm"
                      >
                        <span className="text-lg">👥</span>
                        <span className="text-gray-300">{g.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Type & Important */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-300">
                Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full p-3 bg-[#2C3440] border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {emailTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isImportant}
                  onChange={(e) => setIsImportant(e.target.checked)}
                  className="w-5 h-5 text-blue-500 bg-[#2C3440] border-gray-700 rounded focus:ring-blue-500"
                />
                <span className="text-gray-300 font-medium">
                  Mark as Important
                </span>
              </label>
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-300">
              Subject *
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject"
              className="w-full p-3 bg-[#2C3440] border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-300">
              Message *
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your message..."
              rows="8"
              className="w-full p-3 bg-[#2C3440] border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              required
            />
          </div>

          {/* Attachments */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-300">
              Attachments
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              multiple
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#2C3440] border border-gray-700 text-white rounded-lg cursor-pointer hover:bg-[#1E2329] transition-colors"
            >
              <svg
                className="w-5 h-5"
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
              Attach Files
            </label>

            {attachments.length > 0 && (
              <div className="mt-3 space-y-2">
                {attachments.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-[#2C3440] rounded"
                  >
                    <span className="text-gray-300 text-sm truncate">
                      {file.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(index)}
                      className="text-red-400 hover:text-red-300 ml-2"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="bg-[#2C3440] p-4 rounded-lg border border-gray-700">
            <p className="text-gray-300 text-sm">
              <span className="font-semibold">Recipients:</span>{" "}
              {recipients.length} user(s), {groupRecipients.length} group(s)
            </p>
            {attachments.length > 0 && (
              <p className="text-gray-300 text-sm mt-1">
                <span className="font-semibold">Attachments:</span>{" "}
                {attachments.length} file(s)
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-[#2C3440] hover:bg-[#1E2329] text-white rounded-lg font-semibold transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Email"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
