import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { getAllUniversities } from "../api/universal-admin.api";

export default function UniversitiesManagement() {
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchUniversities();
  }, [page, search]);

  const fetchUniversities = async () => {
    try {
      setLoading(true);
      const response = await getAllUniversities(page, 20, search);
      setUniversities(response.universities);
      setPagination(response.pagination);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1216] text-white p-6">
      <div className="panel-card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <button
            onClick={() => (window.location.href = "/admin")}
            className="text-blue-400 hover:text-blue-300 mb-2 flex items-center gap-2"
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
            Back to Dashboard
          </button>

          <h1 className="text-3xl font-bold">Universities Management</h1>
          <p className="text-gray-400">Manage all registered universities</p>
        </div>

        <button
          onClick={() =>
            toast("Coming soon! University creation will be available in the next update.")
          }
          className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors"
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
          Add University
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search universities by name..."
            className="w-full bg-gray-800 text-white px-4 py-3 pl-12 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <svg
            className="w-5 h-5 text-gray-400 absolute left-4 top-4"
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
      </div>

      {/* Universities Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : universities.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">No universities found</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {universities.map((university) => (
              <div
                key={university.id}
                className="bg-gray-800 rounded-xl p-6 hover:bg-gray-750 transition-colors cursor-pointer"
                onClick={() =>
                  (window.location.href = `/admin/universities/${university.id}`)
                }
              >
                {/* University Logo */}
                <div className="flex items-center gap-4 mb-4">
                  {university.logoUrl ? (
                    <img
                      src={university.logoUrl}
                      alt={university.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-2xl font-bold">
                      {university.name.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold">
                      {university.name}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {university.domain}
                    </p>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-center gap-2 text-gray-400 mb-4">
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
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span className="text-sm">
                    {university.city && university.state
                      ? `${university.city}, ${university.state}`
                      : university.city ||
                        university.state ||
                        "Location not specified"}
                  </span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-700 rounded-lg p-3">
                    <p className="text-2xl font-bold text-blue-400">
                      {university.stats.total}
                    </p>
                    <p className="text-xs text-gray-400">Total Users</p>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-3">
                    <p className="text-2xl font-bold text-green-400">
                      {university.stats.students}
                    </p>
                    <p className="text-xs text-gray-400">Students</p>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-3">
                    <p className="text-2xl font-bold text-purple-400">
                      {university.stats.posts}
                    </p>
                    <p className="text-xs text-gray-400">Posts</p>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-3">
                    <p className="text-2xl font-bold text-orange-400">
                      {university.stats.groups}
                    </p>
                    <p className="text-xs text-gray-400">Groups</p>
                  </div>
                </div>

                {/* User Breakdown */}
                <div className="flex gap-2 text-xs text-gray-400">
                  <span>👨‍🏫 {university.stats.professors} Professors</span>
                  <span>•</span>
                  <span>👤 {university.stats.admins} Admins</span>
                </div>

                {/* Created Date */}
                <div className="mt-4 pt-4 border-t border-gray-700 text-xs text-gray-500">
                  Created{" "}
                  {new Date(university.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-8">
              <button
                onClick={() => setPage((p) => p - 1)}
                disabled={!pagination.hasPreviousPage}
                className="bg-gray-800 hover:bg-gray-700 px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>

              <span className="text-gray-400">
                Page {pagination.page} of {pagination.totalPages}
              </span>

              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!pagination.hasNextPage}
                className="bg-gray-800 hover:bg-gray-700 px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
      </div>
    </div>
  );
}
