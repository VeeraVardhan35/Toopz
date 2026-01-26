import { useState } from "react";
import { deleteGroup, joinGroup } from "../api/groups.api";

export default function GroupCard({ group, currentUserId, onDelete, onUpdate }) {
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [joining, setJoining] = useState(false);

  const isCreator = group.creator?.id === currentUserId || group.createdBy === currentUserId;
  const isMember = group.role || group.isMember;

  const handleNavigation = (path) => {
    window.location.href = path;
  };

  const getTypeLabel = (type) => {
    const labels = {
      Academic: "Discipline",
      Cultural: "Club",
      Sports: "Club",
      Technical: "Club",
      Professional: "Club",
      Special: "Club",
    };
    return labels[type] || "Club";
  };

  const handleDeleteClick = () => {
    setShowMenu(false);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    setDeleting(true);
    try {
      await deleteGroup(group.id);
      onDelete(group.id);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete group");
      setDeleting(false);
    }
  };

  const handleJoinGroup = async () => {
    setJoining(true);
    try {
      await joinGroup(group.id);
      alert("Joined group successfully!");
      onUpdate(); // Refresh groups list
    } catch (error) {
      console.error("Join error:", error);
      alert(error.response?.data?.message || "Failed to join group");
    } finally {
      setJoining(false);
    }
  };

  const handleButtonClick = () => {
    if (isMember) {
      handleNavigation(`/groups/${group.id}`);
    } else {
      handleJoinGroup();
    }
  };

  return (
    <>
      <div className="bg-slate-800/70 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-800/90 transition-all group relative">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3
              className="text-2xl font-bold text-white mb-2 cursor-pointer hover:text-blue-400 transition-colors"
              onClick={() => handleNavigation(`/groups/${group.id}`)}
            >
              {group.name}
            </h3>
            <p className="text-slate-400 text-sm mb-1">{getTypeLabel(group.type)}</p>
            <p className="text-slate-400 text-sm">
              {group.memberCount || 0} members
            </p>
          </div>

          {isCreator && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="text-slate-400 hover:text-white p-1 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>

              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-20 overflow-hidden">
                    <button
                      onClick={() => {
                        handleNavigation(`/groups/${group.id}/edit`);
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-slate-700 text-white font-medium transition-colors flex items-center gap-2"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      Edit Group
                    </button>
                    <button
                      onClick={handleDeleteClick}
                      className="w-full text-left px-4 py-3 hover:bg-slate-700 text-red-400 font-medium border-t border-slate-700 transition-colors flex items-center gap-2"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      Delete Group
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <button
          onClick={handleButtonClick}
          disabled={joining}
          className={`w-full py-3 rounded-xl font-semibold transition-all ${
            isMember
              ? "bg-slate-700/50 border border-slate-600 text-white hover:bg-slate-700"
              : "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed"
          }`}
        >
          {joining ? "Joining..." : isMember ? "View" : "Join"}
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-red-500/10 rounded-full">
                  <svg
                    className="w-6 h-6 text-red-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Delete Group</h2>
                  <p className="text-slate-400 text-sm">
                    This action cannot be undone
                  </p>
                </div>
              </div>

              <p className="text-slate-300 mb-6">
                Are you sure you want to delete{" "}
                <span className="font-bold text-white">"{group.name}"</span>?
                All members will be removed and all group data will be
                permanently deleted.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold transition-colors"
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold disabled:bg-slate-700 disabled:cursor-not-allowed transition-colors"
                  disabled={deleting}
                >
                  {deleting ? "Deleting..." : "Delete Group"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}