import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  getGroupById,
  getGroupMembers,
  leaveGroup,
  removeMember,
  updateMemberRole,
  deleteGroup,
  joinGroup,
} from "../api/groups.api";
import { useAuth } from "../AuthContext";
import AddMemberModal from "../components/AddMemberModal";

export default function GroupDetails() {
  const { user } = useAuth();
  const groupId = window.location.pathname.split("/").pop();

  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("members");
  const [showAddMember, setShowAddMember] = useState(false);
  const [joining, setJoining] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);

  const DEFAULT_PROFILE_IMAGE =
    "https://cdn-icons-png.flaticon.com/512/847/847969.png";

  useEffect(() => {
    fetchGroupDetails();
    fetchMembers(1, false);
  }, [groupId]);

  const fetchGroupDetails = async () => {
    try {
      const response = await getGroupById(groupId);
      setGroup(response.group);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async (page = 1, append = false) => {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      
      const response = await getGroupMembers(groupId, page, 20);
      
      if (append) {
        setMembers(prev => [...prev, ...(response.members || [])]);
      } else {
        setMembers(response.members || []);
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
      fetchMembers(currentPage + 1, true);
    }
  };

  const handleNavigation = (path) => {
    window.location.href = path;
  };

  const handleJoinGroup = async () => {
    setJoining(true);
    try {
      await joinGroup(groupId);
      toast.success("Joined group successfully!");
      await fetchGroupDetails();
      await fetchMembers(1, false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to join group");
    } finally {
      setJoining(false);
    }
  };

  const handleDeleteGroup = async () => {
    if (
      !confirm(
        `Are you sure you want to delete "${group.name}"? This action cannot be undone and all members will be removed.`
      )
    )
      return;

    try {
      await deleteGroup(groupId);
      toast.success("Group deleted successfully!");
      handleNavigation("/groups");
    } catch (error) {
      toast.error("Failed to delete group");
    }
  };

  const handleLeaveGroup = async () => {
    if (!confirm("Are you sure you want to leave this group?")) return;

    try {
      await leaveGroup(groupId);
      toast.success("Left group successfully!");
      handleNavigation("/groups");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to leave group");
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!confirm("Are you sure you want to remove this member?")) return;

    try {
      await removeMember(groupId, userId);
      setMembers((prev) => prev.filter((m) => m.user.id !== userId));
      toast.success("Member removed successfully!");
    } catch (error) {
      toast.error("Failed to remove member");
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateMemberRole(groupId, userId, newRole);
      setMembers((prev) =>
        prev.map((m) => (m.user.id === userId ? { ...m, role: newRole } : m))
      );
      toast.success("Role updated successfully!");
    } catch (error) {
      toast.error("Failed to update role");
    }
  };

  const handleMemberAdded = async () => {
    await fetchMembers(1, false);
  };

  const isAdmin = group?.userRole === "admin" || group?.createdBy === user?.id;
  const isMember = group?.isMember;

  if (loading && !members.length) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-slate-400 text-lg">Loading...</div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-slate-400 text-xl mb-4">Group not found</div>
        <button
          onClick={() => handleNavigation("/groups")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
        >
          Back to Groups
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1216] p-6">
      <div className="panel-card overflow-hidden">
      {/* Header */}
      <div className="bg-slate-900/50 backdrop-blur-sm border-b border-slate-700/50">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <button
            onClick={() => handleNavigation("/groups")}
            className="text-slate-400 hover:text-white mb-6 flex items-center gap-2 font-semibold transition-colors"
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Groups
          </button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-3">
                {group.name}
              </h1>
              <div className="flex items-center gap-4 text-sm text-slate-400">
                <span className="font-semibold">{group.type}</span>
                <span>•</span>
                <span>{pagination?.totalItems || members.length} members</span>
                <span>•</span>
                <span>Created by {group.creator?.name || "Unknown"}</span>
              </div>
              {isMember && (
                <div className="mt-3">
                  <span className="inline-block px-4 py-1.5 bg-blue-600 text-white text-sm font-semibold rounded-full">
                    Your role: {group.userRole}
                  </span>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              {!isMember && (
                <button
                  onClick={handleJoinGroup}
                  disabled={joining}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-semibold transition-all disabled:bg-slate-700 disabled:cursor-not-allowed"
                >
                  {joining ? "Joining..." : "Join Group"}
                </button>
              )}
              {isAdmin && (
                <>
                  <button
                    onClick={() => handleNavigation(`/groups/${groupId}/edit`)}
                    className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 px-6 py-2.5 rounded-xl font-semibold transition-all"
                  >
                    Edit Group
                  </button>
                  <button
                    onClick={handleDeleteGroup}
                    className="bg-slate-800 hover:bg-red-600 text-red-400 hover:text-white border border-slate-700 px-6 py-2.5 rounded-xl font-semibold transition-all"
                  >
                    Delete Group
                  </button>
                </>
              )}
              {isMember && !isAdmin && (
                <button
                  onClick={handleLeaveGroup}
                  className="bg-slate-800 hover:bg-red-600 text-red-400 hover:text-white border border-slate-700 px-6 py-2.5 rounded-xl font-semibold transition-all"
                >
                  Leave Group
                </button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 border-b border-slate-700 mt-6">
            <button
              onClick={() => setActiveTab("members")}
              className={`px-6 py-3 font-semibold transition-all ${
                activeTab === "members"
                  ? "border-b-4 border-blue-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Members
            </button>
            <button
              onClick={() => setActiveTab("posts")}
              className={`px-6 py-3 font-semibold transition-all ${
                activeTab === "posts"
                  ? "border-b-4 border-blue-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Posts
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {activeTab === "members" && (
          <div className="bg-slate-800/70 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-700 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">
                Members ({pagination?.totalItems || members.length})
              </h2>
              {isAdmin && (
                <button
                  onClick={() => setShowAddMember(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
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
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Add Member
                </button>
              )}
            </div>
            <div className="divide-y divide-slate-700">
              {members.length === 0 ? (
                <div className="p-12 text-center text-slate-400">
                  No members yet
                </div>
              ) : (
                <>
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className="p-6 flex items-center justify-between hover:bg-slate-800/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={member.user?.profileUrl || DEFAULT_PROFILE_IMAGE}
                          alt="profile"
                          className="w-14 h-14 rounded-full object-cover border-2 border-slate-700"
                        />
                        <div>
                          <h3 className="font-bold text-white text-lg">
                            {member.user?.name}
                          </h3>
                          <p className="text-sm text-slate-400">
                            {member.user?.department} • {member.user?.batch}
                          </p>
                          <p className="text-sm font-semibold capitalize mt-1 text-blue-400">
                            {member.role}
                          </p>
                        </div>
                      </div>

                      {isAdmin && member.user?.id !== user?.id && (
                        <div className="flex items-center gap-3">
                          <select
                            value={member.role}
                            onChange={(e) =>
                              handleRoleChange(member.user.id, e.target.value)
                            }
                            className="bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
                          >
                            <option value="member">Member</option>
                            <option value="coordinator">Coordinator</option>
                            <option value="co-coordinator">Co-Coordinator</option>
                            <option value="captain">Captain</option>
                            <option value="Mentor">Mentor</option>
                            <option value="admin">Admin</option>
                          </select>
                          <button
                            onClick={() => handleRemoveMember(member.user.id)}
                            className="text-red-400 hover:text-red-300 font-semibold text-sm transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {/* Load More Button */}
                  {pagination && pagination.hasNextPage && (
                    <div className="p-6">
                      <button
                        onClick={handleLoadMore}
                        disabled={loadingMore}
                        className="w-full bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {loadingMore ? "Loading..." : `Load More Members (${pagination.currentPage}/${pagination.totalPages})`}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === "posts" && (
          <div className="bg-slate-800/70 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-12 text-center">
            <div className="text-slate-400 text-lg">
              Group posts feature coming soon...
            </div>
          </div>
        )}
      </div>

      {/* Add Member Modal */}
      {showAddMember && (
        <AddMemberModal
          groupId={groupId}
          onClose={() => setShowAddMember(false)}
          onMemberAdded={handleMemberAdded}
        />
      )}
      </div>
    </div>
  );
}
