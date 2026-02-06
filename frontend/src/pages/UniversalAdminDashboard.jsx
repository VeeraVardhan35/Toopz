import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import { getDashboardStats } from "../api/universal-admin.api";
import { useAuth } from "../AuthContext.jsx";

export default function UniversalAdminDashboard() {
  const { logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

    useEffect(() => {
  }, []);

  useEffect(() => {
    
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getDashboardStats();
      setStats(response.stats);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const goTo = (path) => {
    navigate(path);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      toast.error("Logout failed. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-red-600 text-white p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{error}</p>
          <button 
            onClick={fetchStats}
            className="mt-4 bg-white/10 text-red-300 px-4 py-2 rounded-lg border border-red-400/30 hover:bg-white/15"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1216] text-white p-6">
      <div className="panel-card p-6">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold mb-2">Universal Admin Dashboard</h1>
          <p className="text-gray-400">
            Manage all universities, users, and content
          </p>
        </div>

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
        <button
          onClick={() => goTo("/admin/universities")}
          className="text-left bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Universities</h3>
          </div>
          <p className="text-4xl font-bold mb-2">{stats?.universities || 0}</p>
          <p className="text-sm text-blue-200">Click to manage</p>
        </button>

        {/* Users */}
        <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Total Users</h3>
          <p className="text-4xl font-bold mb-2">
            {stats?.users?.totalUsers || 0}
          </p>
          <div className="flex gap-2 text-xs text-green-200">
            <span>👨‍🎓 {stats?.users?.students || 0}</span>
            <span>👨‍🏫 {stats?.users?.professors || 0}</span>
            <span>👤 {stats?.users?.admins || 0}</span>
          </div>
        </div>

        {/* Posts */}
        <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Total Posts</h3>
          <p className="text-4xl font-bold mb-2">{stats?.posts || 0}</p>
          <p className="text-sm text-purple-200">Across all universities</p>
        </div>

        {/* Groups */}
        <div className="bg-gradient-to-br from-orange-600 to-orange-800 rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Total Groups</h3>
          <p className="text-4xl font-bold mb-2">{stats?.groups || 0}</p>
          <p className="text-sm text-orange-200">Active communities</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-gray-800 rounded-xl p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">
          Recent Activity (Last 7 Days)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-700 rounded-lg p-4">
            <p className="text-2xl font-bold">
              {stats?.recentActivity?.users || 0}
            </p>
            <p className="text-sm text-gray-400">New Users</p>
          </div>

          <div className="bg-gray-700 rounded-lg p-4">
            <p className="text-2xl font-bold">
              {stats?.recentActivity?.posts || 0}
            </p>
            <p className="text-sm text-gray-400">New Posts</p>
          </div>

          <div className="bg-gray-700 rounded-lg p-4">
            <p className="text-2xl font-bold">
              {stats?.recentActivity?.groups || 0}
            </p>
            <p className="text-sm text-gray-400">New Groups</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button
          onClick={() => goTo("/admin/universities")}
          className="bg-gray-800 hover:bg-gray-700 rounded-xl p-6 text-left"
        >
          <h3 className="text-xl font-semibold mb-1">
            Manage Universities
          </h3>
          <p className="text-gray-400">
            View and manage all registered universities
          </p>
        </button>

        <button
          onClick={() => goTo("/admin/university-requests")}
          className="bg-gray-800 hover:bg-gray-700 rounded-xl p-6 text-left"
        >
          <h3 className="text-xl font-semibold mb-1">University Requests</h3>
          <p className="text-gray-400">Review new university registrations</p>
        </button>

        <button
          onClick={() => toast("Coming soon!")}
          className="bg-gray-800 hover:bg-gray-700 rounded-xl p-6 text-left"
        >
          <h3 className="text-xl font-semibold mb-1">View Analytics</h3>
          <p className="text-gray-400">
            Detailed analytics and reports
          </p>
        </button>
      </div>
      </div>
    </div>
  );
}
