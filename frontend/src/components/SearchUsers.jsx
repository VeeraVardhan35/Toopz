import { useState, useEffect } from "react";
import { searchUsers } from "../api/messages.api";

export default function SearchUsers({ onSelectUser }) {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);

  const DEFAULT_PROFILE_IMAGE =
    "https://cdn-icons-png.flaticon.com/512/847/847969.png";

  useEffect(() => {
    handleSearch(query);
  }, [query]);

  const handleSearch = async (searchQuery) => {
    try {
      setLoading(true);
      const response = await searchUsers(searchQuery || "");
      setUsers(response.users || []);
      setGroups(response.groups || []);
    } catch (error) {
      console.error("Search users error:", error);
      setUsers([]);
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = (user) => {
    onSelectUser({
      type: "user",
      id: user.id,
      data: user,
    });
    setQuery("");
    setUsers([]);
    setGroups([]);
  };

  const handleSelectGroup = (group) => {
    onSelectUser({
      type: "group",
      id: group.id,
      data: group,
    });
    setQuery("");
    setUsers([]);
    setGroups([]);
  };

  return (
    <div className="relative">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search users or groups..."
          className="w-full bg-[#2C3440] text-white px-4 py-2 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
        />
        <svg
          className="w-5 h-5 text-gray-400 absolute left-3 top-2.5"
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
      </div>

      <div className="absolute z-10 w-full mt-2 bg-[#1E2329] border border-gray-700 rounded-lg shadow-lg max-h-80 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-gray-400">Searching…</div>
        ) : (
          <>
            {groups.length > 0 && (
              <>
                <div className="p-2 text-xs text-gray-400 border-b border-gray-700">
                  Groups
                </div>
                {groups.map((group) => (
                  <button
                    key={group.id}
                    onClick={() => handleSelectGroup(group)}
                    className="w-full p-3 hover:bg-[#252B36] flex items-center gap-3 text-left"
                  >
                    <img
                      src={group.avatarUrl || DEFAULT_PROFILE_IMAGE}
                      alt={group.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1">
                      <p className="text-white font-semibold">{group.name}</p>
                      <p className="text-sm text-gray-400">
                        {group.description || "Group"}
                      </p>
                    </div>
                  </button>
                ))}
              </>
            )}

            {users.length > 0 && (
              <>
                <div className="p-2 text-xs text-gray-400 border-t border-gray-700">
                  Users
                </div>
                {users.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleSelectUser(user)}
                    className="w-full p-3 hover:bg-[#252B36] flex items-center gap-3 text-left"
                  >
                    <img
                      src={user.profileUrl || DEFAULT_PROFILE_IMAGE}
                      alt={user.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1">
                      <p className="text-white font-semibold">{user.name}</p>
                      <p className="text-sm text-gray-400">{user.email}</p>
                    </div>
                  </button>
                ))}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
