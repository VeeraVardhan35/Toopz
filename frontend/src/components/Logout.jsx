import {useState, useRef, useEffect} from "react";
import {logoutUser} from "../api/auth.api.js";
import {useAuth} from "../AuthContext.jsx";

export default function Logout({onClose}) {
    const {logout} = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const modalRef = useRef(null);

    // Close modal when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [onClose]);

    // Close modal on Escape key
    useEffect(() => {
        function handleEscape(event) {
            if (event.key === "Escape") {
                onClose();
            }
        }

        document.addEventListener("keydown", handleEscape);
        return () => {
            document.removeEventListener("keydown", handleEscape);
        };
    }, [onClose]);

    async function handleLogout() {
        setError("");
        setLoading(true);

        try {
            await logoutUser();
            logout();
            window.location.href = "/login";
        } catch(err) {
            console.error(err.response?.data || err);
            setError(err.response?.data?.message || "Logout failed. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div 
                ref={modalRef}
                className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg space-y-6 m-4"
            >
                <div className="space-y-2 text-center">
                    <h2 className="text-2xl font-semibold">Logout</h2>
                    <p className="text-gray-600">Do you want to logout?</p>
                </div>

                {error && (
                    <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                        {error}
                    </div>
                )}

                <div className="flex gap-4">
                    <button
                        onClick={onClose}
                        className="flex-1 p-2 border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleLogout}
                        className="flex-1 p-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                        disabled={loading}
                    >
                        {loading ? "Logging out..." : "Logout"}
                    </button>
                </div>
            </div>
        </div>
    );
}