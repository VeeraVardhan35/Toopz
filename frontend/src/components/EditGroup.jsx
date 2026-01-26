import { useState, useEffect } from "react";
import { getGroupById, updateGroup } from "../api/groups.api";
import { useAuth } from "../AuthContext";

export default function EditGroup() {
  const { user } = useAuth();
  const groupId = window.location.pathname.split("/")[2]; // /groups/:id/edit

  const [name, setName] = useState("");
  const [type, setType] = useState("Academic");
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState("");

  const groupTypes = [
    "Academic",
    "Cultural",
    "Sports",
    "Technical",
    "Professional",
    "Special",
  ];

  useEffect(() => {
    fetchGroupDetails();
  }, [groupId]);

  const fetchGroupDetails = async () => {
    try {
      setFetchLoading(true);
      const response = await getGroupById(groupId);
      const group = response.group;

      // Check if user is admin/creator
      if (group.createdBy !== user?.id && group.userRole !== "admin") {
        alert("You don't have permission to edit this group");
        handleNavigation(`/groups/${groupId}`);
        return;
      }

      setName(group.name);
      setType(group.type);
    } catch (error) {
      console.error("Fetch group error:", error);
      setError("Failed to load group details");
    } finally {
      setFetchLoading(false);
    }
  };

  const handleNavigation = (path) => {
    window.location.href = path;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Group name is required");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await updateGroup(groupId, { name, type });
      alert("Group updated successfully!");
      handleNavigation(`/groups/${groupId}`);
    } catch (err) {
      console.error("Update group error:", err);
      setError(err.response?.data?.message || "Failed to update group");
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-slate-400 text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => handleNavigation(`/groups/${groupId}`)}
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
          Back to Group
        </button>

        <div className="bg-slate-800/70 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-2xl">
          <div className="border-b border-slate-700 p-6">
            <h1 className="text-3xl font-bold text-white">Edit Group</h1>
            <p className="text-slate-400 mt-2">
              Update your group's information
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/50 text-red-400 rounded-xl font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold mb-2 text-slate-300">
                Group Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter group name"
                className="w-full p-4 bg-slate-900 border border-slate-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-lg"
                disabled={loading}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-slate-300">
                Group Type *
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full p-4 bg-slate-900 border border-slate-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-lg"
                disabled={loading}
                required
              >
                {groupTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => handleNavigation(`/groups/${groupId}`)}
                className="flex-1 px-6 py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold transition-colors text-lg"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold disabled:bg-slate-700 disabled:cursor-not-allowed transition-colors text-lg"
                disabled={loading}
              >
                {loading ? "Updating..." : "Update Group"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}