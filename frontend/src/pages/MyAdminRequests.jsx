import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { getMyRequests, submitAdminRequest } from "../api/admin-requests.api";
import { getAllUniversities } from "../api/universal-admin.api";

export default function MyAdminRequests() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showRequestForm, setShowRequestForm] = useState(false);
    const [universities, setUniversities] = useState([]);
    const [selectedUniversity, setSelectedUniversity] = useState("");
    const [requestMessage, setRequestMessage] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const response = await getMyRequests();
            setRequests(response.requests);
        } catch (error) {
        } finally {
            setLoading(false);
        }
    };

    const fetchUniversities = async () => {
        try {
            const response = await getAllUniversities(1, 100);
            setUniversities(response.universities);
        } catch (error) {
        }
    };

    const handleSubmitRequest = async (e) => {
        e.preventDefault();

        if (!selectedUniversity) {
            toast.error("Please select a university");
            return;
        }

        try {
            setSubmitting(true);
            await submitAdminRequest(selectedUniversity, requestMessage);
            toast.success("Request submitted successfully! Please wait for approval.");
            setShowRequestForm(false);
            setSelectedUniversity("");
            setRequestMessage("");
            fetchRequests();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to submit request");
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            pending: { bg: "bg-yellow-600", icon: "⏳" },
            approved: { bg: "bg-green-600", icon: "✓" },
            rejected: { bg: "bg-red-600", icon: "✗" },
        };
        return badges[status] || badges.pending;
    };

    return (
        <div className="min-h-screen bg-[#0f1216] text-white p-6">
            <div className="panel-card p-6">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold mb-2">My Admin Requests</h1>
                    <p className="text-gray-400">
                        Track your university admin access requests
                    </p>
                </div>
                <button
                    onClick={() => {
                        setShowRequestForm(true);
                        fetchUniversities();
                    }}
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
                    Request Admin Access
                </button>
            </div>

            {/* Requests List */}
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            ) : requests.length === 0 ? (
                <div className="text-center py-12 bg-gray-800 rounded-xl">
                    <svg
                        className="w-16 h-16 mx-auto mb-4 text-slate-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5"
                        />
                    </svg>
                    <p className="text-gray-400 text-lg mb-2">No requests yet</p>
                    <p className="text-gray-500 text-sm">
                        Click "Request Admin Access" to get started
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {requests.map((request) => {
                        const badge = getStatusBadge(request.status);
                        return (
                            <div key={request.id} className="bg-gray-800 rounded-xl p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-xl font-semibold">
                                                {request.university.name}
                                            </h3>
                                            <span
                                                className={`${badge.bg} px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1`}
                                            >
                        <span>{badge.icon}</span>
                        <span className="capitalize">{request.status}</span>
                      </span>
                                        </div>
                                        <p className="text-gray-400">
                                            {request.university.domain}
                                        </p>
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        {new Date(request.createdAt).toLocaleDateString()}
                                    </p>
                                </div>

                                {request.requestMessage && (
                                    <div className="bg-gray-700 rounded-lg p-3 mb-3">
                                        <p className="text-sm text-gray-400 mb-1 font-semibold">
                                            Your Message:
                                        </p>
                                        <p className="text-sm text-gray-300">
                                            {request.requestMessage}
                                        </p>
                                    </div>
                                )}

                                {request.responseMessage && (
                                    <div
                                        className={`rounded-lg p-3 ${
                                            request.status === "approved"
                                                ? "bg-green-900 bg-opacity-30"
                                                : "bg-red-900 bg-opacity-30"
                                        }`}
                                    >
                                        <p className="text-sm font-semibold mb-1">
                                            {request.status === "approved"
                                                ? "✓ Approved"
                                                : "✗ Rejected"}
                                        </p>
                                        <p className="text-sm">{request.responseMessage}</p>
                                    </div>
                                )}

                                {request.status === "pending" && (
                                    <div className="mt-4 pt-4 border-t border-gray-700">
                                        <p className="text-sm text-yellow-400">
                                            ⏳ Your request is being reviewed by the Universal Admin
                                        </p>
                                    </div>
                                )}

                                {request.status === "approved" && request.reviewedAt && (
                                    <div className="mt-4 pt-4 border-t border-gray-700">
                                        <p className="text-sm text-green-400">
                                            ✓ Approved on{" "}
                                            {new Date(request.reviewedAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Request Form Modal */}
            {showRequestForm && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
                    <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full">
                        <h3 className="text-2xl font-bold mb-4">
                            Request Admin Access
                        </h3>

                        <form onSubmit={handleSubmitRequest}>
                            <div className="mb-4">
                                <label className="block text-sm font-semibold mb-2">
                                    Select University
                                </label>
                                <select
                                    value={selectedUniversity}
                                    onChange={(e) => setSelectedUniversity(e.target.value)}
                                    required
                                    className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg"
                                >
                                    <option value="">-- Choose University --</option>
                                    {universities.map((uni) => (
                                        <option key={uni.id} value={uni.id}>
                                            {uni.name} ({uni.domain})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-semibold mb-2">
                                    Request Message (Optional)
                                </label>
                                <textarea
                                    value={requestMessage}
                                    onChange={(e) => setRequestMessage(e.target.value)}
                                    rows={4}
                                    className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg"
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowRequestForm(false);
                                        setSelectedUniversity("");
                                        setRequestMessage("");
                                    }}
                                    disabled={submitting}
                                    className="flex-1 bg-gray-700 px-4 py-2 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting || !selectedUniversity}
                                    className="flex-1 bg-blue-600 px-4 py-2 rounded-lg"
                                >
                                    {submitting ? "Submitting..." : "Submit Request"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            </div>
        </div>
    );
}
