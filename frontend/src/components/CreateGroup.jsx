import { useState } from "react";
import { createGroup } from "../api/groups.api";

export default function CreateGroup({ onClose, onGroupCreated }) {
  const [name, setName] = useState("");
  const [type, setType] = useState("Academic");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const groupTypes = [
    "Academic",
    "Cultural",
    "Sports",
    "Technical",
    "Professional",
    "Special",
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Group name is required");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await createGroup({ name, type });
      onGroupCreated();
    } catch (err) {
      console.error("Create group error:", err);
      setError(err.response?.data?.message || "Failed to create group");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="border-b border-slate-700 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Create New Group</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-3xl font-bold transition-colors"
            disabled={loading}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
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
              className="w-full p-3 bg-slate-900 border border-slate-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
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
              className="w-full p-3 bg-slate-900 border border-slate-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
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

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold disabled:bg-slate-700 disabled:cursor-not-allowed transition-colors"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Group"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}