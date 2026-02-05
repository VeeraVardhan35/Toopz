import { useState, useEffect } from "react";
import { getDashboardStats } from "../api/universal-admin.api";
import { logoutUser } from "../api/auth.api.js"; // ✅ import logout

export default function UniversalAdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await getDashboardStats();
      setStats(response.stats);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser(); // call API to logout
      window.location.href = "/login"; // redirect to login page
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Logout failed. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold mb-2">Universal Admin Dashboard</h1>
          <p className="text-gray-400">
            Manage all universities, users, and content
          </p>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Universities */}
        <div
          className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
          onClick={() => (window.location.href = "/admin/universities")}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Universities</h3>
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <p className="text-4xl font-bold mb-2">{stats?.universities || 0}</p>
          <p className="text-sm text-blue-200">Click to manage</p>
        </div>

        {/* Users */}
        <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Total Users</h3>
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <p className="text-4xl font-bold mb-2">{stats?.users?.totalUsers || 0}</p>
          <div className="flex gap-2 text-xs text-green-200">
            <span>👨‍🎓 {stats?.users?.students || 0}</span>
            <span>👨‍🏫 {stats?.users?.professors || 0}</span>
            <span>👤 {stats?.users?.admins || 0}</span>
          </div>
        </div>

        {/* Posts */}
        <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Total Posts</h3>
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          </div>
          <p className="text-4xl font-bold mb-2">{stats?.posts || 0}</p>
          <p className="text-sm text-purple-200">Across all universities</p>
        </div>

        {/* Groups */}
        <div className="bg-gradient-to-br from-orange-600 to-orange-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Total Groups</h3>
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <p className="text-4xl font-bold mb-2">{stats?.groups || 0}</p>
          <p className="text-sm text-orange-200">Active communities</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-gray-800 rounded-xl p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">Recent Activity (Last 7 Days)</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-700 rounded-lg p-4">
            <p className="text-2xl font-bold">{stats?.recentActivity?.users || 0}</p>
            <p className="text-sm text-gray-400">New Users</p>
          </div>

          <div className="bg-gray-700 rounded-lg p-4">
            <p className="text-2xl font-bold">{stats?.recentActivity?.posts || 0}</p>
            <p className="text-sm text-gray-400">New Posts</p>
          </div>

          <div className="bg-gray-700 rounded-lg p-4">
            <p className="text-2xl font-bold">{stats?.recentActivity?.groups || 0}</p>
            <p className="text-sm text-gray-400">New Groups</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button
          onClick={() => (window.location.href = "/admin/universities")}
          className="bg-gray-800 hover:bg-gray-700 rounded-xl p-6 text-left transition-colors"
        >
          <h3 className="text-xl font-semibold mb-1">Manage Universities</h3>
          <p className="text-gray-400">View and manage all registered universities</p>
        </button>

        <button
          onClick={() => alert("Coming soon!")}
          className="bg-gray-800 hover:bg-gray-700 rounded-xl p-6 text-left transition-colors"
        >
          <h3 className="text-xl font-semibold mb-1">Add University</h3>
          <p className="text-gray-400">Register a new university</p>
        </button>

        <button
          onClick={() => alert("Coming soon!")}
          className="bg-gray-800 hover:bg-gray-700 rounded-xl p-6 text-left transition-colors"
        >
          <h3 className="text-xl font-semibold mb-1">View Analytics</h3>
          <p className="text-gray-400">Detailed analytics and reports</p>
        </button>
      </div>
    </div>
  );
}
