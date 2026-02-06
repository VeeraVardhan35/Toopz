import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  getUniversityById,
  getUniversityUsers,
  getUniversityPosts,
  getUniversityGroups,
  deleteUniversity,
} from "../api/universal-admin.api";

export default function UniversityDetails() {
  const id = window.location.pathname.split("/").pop();

  const [university, setUniversity] = useState(null);
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchUniversity();
  }, [id]);

  useEffect(() => {
    if (activeTab === "users") fetchUsers();
    if (activeTab === "posts") fetchPosts();
    if (activeTab === "groups") fetchGroups();
  }, [activeTab, page, roleFilter, search]);

  const fetchUniversity = async () => {
    try {
      const response = await getUniversityById(id);
      setUniversity(response.university);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await getUniversityUsers(id, page, 20, roleFilter, search);
      setUsers(response.users);
      setPagination(response.pagination);
    } catch (error) {
    }
  };

  const fetchPosts = async () => {
    try {
      const response = await getUniversityPosts(id, page, 20);
      setPosts(response.posts);
      setPagination(response.pagination);
    } catch (error) {
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await getUniversityGroups(id, page, 20);
      setGroups(response.groups);
      setPagination(response.pagination);
    } catch (error) {
    }
  };

  const handleDelete = async () => {
    if (
      window.confirm(
        `Are you sure you want to delete ${university.name}? This action cannot be undone and will delete all associated data.`
      )
    ) {
      try {
        await deleteUniversity(id);
        toast.success("University deleted successfully");
        window.location.href = "/admin/universities";
      } catch (error) {
        toast.error("Failed to delete university");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!university) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl mb-4">University not found</p>
          <button
            onClick={() => (window.location.href = "/admin/universities")}
            className="text-blue-400 hover:text-blue-300"
          >
            Back to Universities
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1216] text-white p-6">
      <div className="panel-card p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => (window.location.href = "/admin/universities")}
          className="text-blue-400 hover:text-blue-300 mb-4 flex items-center gap-2"
        >
          ← Back to Universities
        </button>

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {university.logoUrl ? (
              <img
                src={university.logoUrl}
                alt={university.name}
                className="w-20 h-20 rounded-xl object-cover"
              />
            ) : (
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-3xl font-bold">
                {university.name.charAt(0)}
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold mb-1">{university.name}</h1>
              <p className="text-gray-400 mb-1">{university.domain}</p>
              {(university.city || university.state) && (
                <p className="text-sm text-gray-500">
                  📍 {university.city && university.state
                    ? `${university.city}, ${university.state}`
                    : university.city || university.state}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() =>
                toast("University editing will be available in the next update.")
              }
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
            >
              Edit
            </button>
            <button
              onClick={() => toast("University deletion will be available in the next update.")}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-700">
        {["users", "posts", "groups"].map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setPage(1);
            }}
            className={`px-6 py-3 font-semibold capitalize ${
              activeTab === tab
                ? "text-blue-400 border-b-2 border-blue-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Users Filters */}
      {activeTab === "users" && (
        <div className="flex gap-4 mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name or email..."
            className="flex-1 bg-gray-800 text-white px-4 py-2 rounded-lg"
          />
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="bg-gray-800 text-white px-4 py-2 rounded-lg"
          >
            <option value="">All Roles</option>
            <option value="student">Students</option>
            <option value="professor">Professors</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      )}

      {/* Content */}
      <div className="bg-gray-800 rounded-xl p-6">
        {activeTab === "users" &&
          users.map((user) => (
            <div
              key={user.id}
              className="bg-gray-700 rounded-lg p-4 flex justify-between mb-4"
            >
              <div>
                <h3 className="font-semibold">{user.name}</h3>
                <p className="text-sm text-gray-400">{user.email}</p>
              </div>
              <button
                onClick={() =>
                  toast("User details will be available in the next update.")
                }
                className="text-blue-400"
              >
                View →
              </button>
            </div>
          ))}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex justify-between mt-6">
            <button
              onClick={() => setPage((p) => p - 1)}
              disabled={!pagination.hasPreviousPage}
              className="bg-gray-700 px-6 py-2 rounded-lg disabled:opacity-50"
            >
              Previous
            </button>

            <span className="text-gray-400">
              Page {pagination.page} of {pagination.totalPages}
            </span>

            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!pagination.hasNextPage}
              className="bg-gray-700 px-6 py-2 rounded-lg disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
