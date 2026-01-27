import { useState, useEffect } from "react";
import { getAllGroups, getMyGroups, deleteGroup } from "../api/groups.api";
import { useAuth } from "../AuthContext";
import CreateGroup from "../components/CreateGroup";
import GroupCard from "../components/GroupCard";

export default function Groups() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("discover");
  const [groups, setGroups] = useState([]);
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterType, setFilterType] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchInput, setShowSearchInput] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);

  const filterTabs = [
    { id: "discover", label: "Discover", icon: "🧭" },
    { id: "my", label: "My Groups", icon: "👥" },
  ];

  // Map frontend categories to database enum values
  const categoryFilters = [
    { label: "Batch", value: null, customFilter: "batch" },
    { label: "Discipline", value: "Academic" },
    { label: "Clubs", value: null, customFilter: "clubs" },
  ];

  useEffect(() => {
    setCurrentPage(1); // Reset to page 1 when tab or filter changes
    fetchGroups(1, false);
  }, [activeTab, filterType]);

  useEffect(() => {
    // Apply client-side search filter
    let filtered = groups;

    if (searchQuery.trim() !== "") {
      filtered = filtered.filter((group) =>
        group.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredGroups(filtered);
  }, [searchQuery, groups]);

  const fetchGroups = async (page = 1, append = false) => {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      
      let response;

      // Only send actual enum values to backend
      const backendFilterType =
        filterType && !["batch", "clubs"].includes(filterType)
          ? filterType
          : null;

      if (activeTab === "discover") {
        response = await getAllGroups(backendFilterType, page, 12);
      } else {
        response = await getMyGroups(page, 12);
      }

      let fetchedGroups = response.groups || [];
      
      // Apply client-side filters if needed
      if (filterType === "clubs") {
        fetchedGroups = fetchedGroups.filter((group) =>
          ["Cultural", "Sports", "Technical", "Professional", "Special"].includes(
            group.type
          )
        );
      }
      
      if (append) {
        setGroups(prev => [...prev, ...fetchedGroups]);
      } else {
        setGroups(fetchedGroups);
      }
      
      setFilteredGroups(fetchedGroups);
      setPagination(response.pagination);
      setCurrentPage(page);
    } catch (error) {
      console.error("Fetch groups error:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (pagination && pagination.hasNextPage && !loadingMore) {
      fetchGroups(currentPage + 1, true);
    }
  };

  const handleDeleteGroup = async (groupId) => {
    if (!confirm("Are you sure you want to delete this group?")) return;

    try {
      await deleteGroup(groupId);
      setGroups((prev) => prev.filter((g) => g.id !== groupId));
      setFilteredGroups((prev) => prev.filter((g) => g.id !== groupId));
      alert("Group deleted successfully!");
    } catch (error) {
      console.error("Delete group error:", error);
      alert("Failed to delete group");
    }
  };

  const handleGroupCreated = () => {
    setShowCreateModal(false);
    fetchGroups(1, false);
  };

  const handleFilterClick = (filter) => {
    if (filter.customFilter) {
      setFilterType(filterType === filter.customFilter ? null : filter.customFilter);
    } else if (filter.value) {
      setFilterType(filterType === filter.value ? null : filter.value);
    } else {
      setFilterType(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-slate-900/50 backdrop-blur-sm border-b border-slate-700/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-4xl font-bold text-white">Groups</h1>
            <div className="flex items-center gap-3">
              {/* Search Input */}
              {showSearchInput ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search groups..."
                    className="px-4 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 w-64"
                    autoFocus
                  />
                  <button
                    onClick={() => {
                      setShowSearchInput(false);
                      setSearchQuery("");
                    }}
                    className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-full transition-colors"
                  >
                    <svg
                      className="w-6 h-6 text-slate-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowSearchInput(true)}
                  className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-full transition-colors"
                >
                  <svg
                    className="w-6 h-6 text-slate-300"
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
                </button>
              )}

              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-semibold transition-colors flex items-center gap-2"
              >
                <span className="text-xl">+</span>
                <span>Create</span>
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-3 mb-4">
            {filterTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-2.5 rounded-full font-semibold transition-all ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}

            {activeTab === "discover" && (
              <>
                {categoryFilters.map((filter) => {
                  const isActive =
                    (filter.customFilter && filterType === filter.customFilter) ||
                    (filter.value && filterType === filter.value);

                  return (
                    <button
                      key={filter.label}
                      onClick={() => handleFilterClick(filter)}
                      className={`px-6 py-2.5 rounded-full font-semibold transition-all ${
                        isActive
                          ? "bg-slate-700 text-white"
                          : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                      }`}
                    >
                      {filter.label}
                    </button>
                  );
                })}
              </>
            )}
          </div>

          {/* Search Results & Pagination Info */}
          <div className="flex justify-between items-center text-slate-400 text-sm">
            {searchQuery ? (
              <div>
                Found {filteredGroups.length} group(s) matching "{searchQuery}"
              </div>
            ) : pagination ? (
              <div>
                Showing {filteredGroups.length} of {pagination.totalItems} groups
                (Page {pagination.currentPage} of {pagination.totalPages})
              </div>
            ) : (
              <div></div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Groups Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-slate-400 text-lg">Loading groups...</div>
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl">
            <div className="text-slate-400 text-xl mb-4">
              {searchQuery
                ? `No groups found matching "${searchQuery}"`
                : activeTab === "discover"
                ? "No groups found"
                : "You haven't joined any groups yet"}
            </div>
            {activeTab === "my" && !searchQuery && (
              <button
                onClick={() => setActiveTab("discover")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
              >
                Explore Groups
              </button>
            )}
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGroups.map((group) => (
                <GroupCard
                  key={group.id}
                  group={group}
                  currentUserId={user?.id}
                  onDelete={handleDeleteGroup}
                  onUpdate={() => fetchGroups(1, false)}
                />
              ))}
            </div>
            
            {/* Load More Button */}
            {pagination && pagination.hasNextPage && !searchQuery && (
              <div className="mt-8 text-center">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingMore ? "Loading..." : "Load More Groups"}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Group Modal */}
      {showCreateModal && (
        <CreateGroup
          onClose={() => setShowCreateModal(false)}
          onGroupCreated={handleGroupCreated}
        />
      )}
    </div>
  );
}