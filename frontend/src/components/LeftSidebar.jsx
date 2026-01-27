import { useState } from "react";
import { useAuth } from "../AuthContext.jsx";
import Logout from "./Logout.jsx";

export default function LeftSidebar() {
  const { user } = useAuth();
  const [showLogout, setShowLogout] = useState(false);

  const DEFAULT_PROFILE_IMAGE =
    "https://cdn-icons-png.flaticon.com/512/847/847969.png";

  const handleNavigation = (path) => {
    window.location.href = path;
  };

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-4 space-y-6 sticky top-6">
      {/* Profile Section */}
      <div className="border-b border-gray-300 pb-4">
        <div className="flex items-center gap-3 mb-3">
          <img
            src={user?.profileUrl || DEFAULT_PROFILE_IMAGE}
            alt="profile"
            className="w-16 h-16 rounded-full object-cover border-2 border-black"
          />
          <div className="flex-1">
            <h3 className="font-bold text-black">
              {user?.name || "Loading..."}
            </h3>
            <p className="text-sm text-gray-600">{user?.email || ""}</p>
          </div>
        </div>

        {user && (
          <div className="space-y-1 text-sm text-gray-700">
            <p>
              <span className="font-semibold text-black">Department:</span>{" "}
              {user.department || "N/A"}
            </p>
            <p>
              <span className="font-semibold text-black">Batch:</span>{" "}
              {user.batch || "N/A"}
            </p>
            <p>
              <span className="font-semibold text-black">Role:</span>{" "}
              <span className="capitalize">{user.role || "N/A"}</span>
            </p>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <nav>
        <h4 className="text-xs font-bold text-black uppercase mb-3">Menu</h4>
        <ul className="space-y-2">
          <li>
            <button
              onClick={() => handleNavigation("/emails")}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 border border-transparent hover:border-black transition-all flex items-center gap-3 text-black font-medium"
            >
              <span className="text-xl">📧</span>
              <span>Emails</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => handleNavigation("/messages")} 
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 border border-transparent hover:border-black transition-all flex items-center gap-3 text-black font-medium">
              <span className="text-xl">💬</span>
              <span>Messages</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => handleNavigation("/groups")}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 border border-transparent hover:border-black transition-all flex items-center gap-3 text-black font-medium"
            >
              <span className="text-xl">👥</span>
              <span>Groups</span>
            </button>
          </li>
          <li>
            <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 border border-transparent hover:border-black transition-all flex items-center gap-3 text-black font-medium">
              <span className="text-xl">🎬</span>
              <span>Reels</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => handleNavigation("/profile")}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 border border-transparent hover:border-black transition-all flex items-center gap-3 text-black font-medium">
              <span className="text-xl">👤</span>
              <span>Profile</span>
            </button>
          </li>
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="border-t border-gray-300 pt-4">
        <button
          onClick={() => setShowLogout(true)}
          className="w-full bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors font-semibold flex items-center justify-center gap-2 border-2 border-black"
        >
          <span className="text-xl">🚪</span>
          <span>Logout</span>
        </button>
        {showLogout && <Logout onClose={() => setShowLogout(false)} />}
      </div>
    </div>
  );
}