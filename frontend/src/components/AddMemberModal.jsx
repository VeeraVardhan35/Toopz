import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { getAllUsers, addMember } from "../api/groups.api";

export default function AddMemberModal({ groupId, onClose, onMemberAdded }) {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState("member");
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState("");

  const roles = [
    { value: "member", label: "Member" },
    { value: "coordinator", label: "Coordinator" },
    { value: "co-coordinator", label: "Co-Coordinator" },
    { value: "captain", label: "Captain" },
    { value: "Mentor", label: "Mentor" },
    { value: "admin", label: "Admin" },
  ];

  const DEFAULT_PROFILE_IMAGE =
    "https://cdn-icons-png.flaticon.com/512/847/847969.png";

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(
        (user) =>
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);

  const fetchUsers = async () => {
    try {
      setFetchLoading(true);
      const response = await getAllUsers();
      setUsers(response.users || []);
      setFilteredUsers(response.users || []);
    } catch (error) {
      setError("Failed to load users");
    } finally {
      setFetchLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!selectedUser) {
      setError("Please select a user");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await addMember(groupId, {
        userId: selectedUser.id,
        role: selectedRole,
      });
      toast.success("Member added successfully!");
      onMemberAdded();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add member");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] flex flex-col">
        <div className="border-b border-slate-700 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Add Member</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-3xl font-bold transition-colors"
            disabled={loading}
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/50 text-red-400 rounded-xl font-medium">
              {error}
            </div>
          )}

          {/* Search */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-slate-300">
              Search Users
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full p-3 bg-slate-900 border border-slate-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* User List */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-slate-300">
              Select User *
            </label>
            {fetchLoading ? (
              <div className="text-center py-8 text-slate-400">
                Loading users...
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                No users found
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto bg-slate-900 rounded-xl border border-slate-700">
                {filteredUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className={`w-full p-3 flex items-center gap-3 hover:bg-slate-800 transition-colors ${
                      selectedUser?.id === user.id
                        ? "bg-blue-600/20 border-l-4 border-blue-600"
                        : ""
                    }`}
                  >
                    <img
                      src={user.profileUrl || DEFAULT_PROFILE_IMAGE}
                      alt="profile"
                      className="w-10 h-10 rounded-full object-cover border-2 border-slate-700"
                    />
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-white">{user.name}</p>
                      <p className="text-sm text-slate-400">{user.email}</p>
                      <p className="text-xs text-slate-500">
                        {user.department} • {user.batch}
                      </p>
                    </div>
                    {selectedUser?.id === user.id && (
                      <svg
                        className="w-6 h-6 text-blue-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Role Selection */}
          {selectedUser && (
            <div>
              <label className="block text-sm font-semibold mb-2 text-slate-300">
                Assign Role *
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full p-3 bg-slate-900 border border-slate-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                {roles.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="border-t border-slate-700 p-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleAddMember}
            className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold disabled:bg-slate-700 disabled:cursor-not-allowed transition-colors"
            disabled={loading || !selectedUser}
          >
            {loading ? "Adding..." : "Add Member"}
          </button>
        </div>
      </div>
    </div>
  );
}
