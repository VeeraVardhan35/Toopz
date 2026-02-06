import { useState } from "react";
import toast from "react-hot-toast";
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
    <div className="bg-[#1b2027] border border-white/10 rounded-2xl p-4 space-y-6 sticky top-6 text-slate-100">
      {/* Profile Section */}
      <div className="border-b border-white/10 pb-4">
        <div className="flex items-center gap-3 mb-3">
          <img
            src={user?.profileUrl || DEFAULT_PROFILE_IMAGE}
            alt="profile"
            className="w-16 h-16 rounded-full object-cover border border-white/15"
          />
          <div className="flex-1">
            <h3 className="font-bold text-slate-100">
              {user?.name || "Loading..."}
            </h3>
            <p className="text-sm text-slate-400">{user?.email || ""}</p>
          </div>
        </div>

        {user && (
          <div className="space-y-1 text-sm text-slate-300">
            <p>
              <span className="font-semibold text-slate-100">Department:</span>{" "}
              {user.department || "N/A"}
            </p>
            <p>
              <span className="font-semibold text-slate-100">Batch:</span>{" "}
              {user.batch || "N/A"}
            </p>
            <p>
              <span className="font-semibold text-slate-100">Role:</span>{" "}
              <span className="capitalize">{user.role || "N/A"}</span>
            </p>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <nav>
        <h4 className="text-xs font-bold text-slate-300 uppercase mb-3">Menu</h4>
        <ul className="space-y-2">
          <li>
            <button
              onClick={() => handleNavigation("/emails")}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10 transition-all flex items-center gap-3 text-slate-100 font-medium"
            >
              <span className="text-xl">📧</span>
              <span>Emails</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => handleNavigation("/messages")} 
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10 transition-all flex items-center gap-3 text-slate-100 font-medium">
              <span className="text-xl">💬</span>
              <span>Messages</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => handleNavigation("/groups")}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10 transition-all flex items-center gap-3 text-slate-100 font-medium"
            >
              <span className="text-xl">👥</span>
              <span>Groups</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => toast("Coming soon")}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10 transition-all flex items-center gap-3 text-slate-100 font-medium"
            >
              <span className="text-xl">🎬</span>
              <span>Reels</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => handleNavigation("/profile")}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10 transition-all flex items-center gap-3 text-slate-100 font-medium">
              <span className="text-xl">👤</span>
              <span>Profile</span>
            </button>
          </li>
          {user?.role === "admin" && (
            <li>
              <button
                onClick={() => handleNavigation("/university-requests")}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10 transition-all flex items-center gap-3 text-slate-100 font-medium"
              >
                <span className="text-xl">🏫</span>
                <span>Register University</span>
              </button>
            </li>
          )}

        </ul>
      </nav>

      {/* Logout Button */}
      <div className="border-t border-white/10 pt-4">
        <button
          onClick={() => setShowLogout(true)}
          className="w-full bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/15 transition-colors font-semibold flex items-center justify-center gap-2 border border-white/10"
        >
          <span className="text-xl">🚪</span>
          <span>Logout</span>
        </button>
        {showLogout && <Logout onClose={() => setShowLogout(false)} />}
      </div>
    </div>
  );
}
