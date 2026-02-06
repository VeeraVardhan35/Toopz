import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
    getAllPendingRequests,
    approveAdminRequest,
    rejectAdminRequest,
} from "../api/admin-requests.api";

export default function AdminRequestsManagement() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState(null);
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState("pending");
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalAction, setModalAction] = useState(null);
    const [responseMessage, setResponseMessage] = useState("");
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchRequests();
    }, [page, statusFilter]);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const response = await getAllPendingRequests(page, 20, statusFilter);
            setRequests(response.requests);
            setPagination(response.pagination);
        } catch (error) {
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        try {
            setProcessing(true);
            await approveAdminRequest(selectedRequest.id, responseMessage);
            toast.success(
                `Approved ${selectedRequest.user.name} as admin for ${selectedRequest.university.name}`
            );
            setShowModal(false);
            setResponseMessage("");
            fetchRequests();
        } catch (error) {
            toast.error("Failed to approve request");
        } finally {
            setProcessing(false);
        }
    };

    const handleReject = async () => {
        try {
            setProcessing(true);
            await rejectAdminRequest(
                selectedRequest.id,
                responseMessage || "Your request has been rejected"
            );
            toast.error(`Rejected ${selectedRequest.user.name}'s request`);
            setShowModal(false);
            setResponseMessage("");
            fetchRequests();
        } catch (error) {
            toast.error("Failed to reject request");
        } finally {
            setProcessing(false);
        }
    };

    const openModal = (request, action) => {
        setSelectedRequest(request);
        setModalAction(action);
        setShowModal(true);
    };

    const getStatusBadge = (status) => {
        const badges = {
            pending: "bg-yellow-600 text-white",
            approved: "bg-green-600 text-white",
            rejected: "bg-red-600 text-white",
        };
        return badges[status] || "bg-gray-600 text-white";
    };

    return (
        <div className="min-h-screen bg-[#0f1216] text-white p-6">
            <div className="panel-card p-6">
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => window.history.back()}
                    className="text-blue-400 hover:text-blue-300 mb-4 flex items-center gap-2"
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

                <h1 className="text-3xl font-bold mb-2">Admin Requests</h1>
                <p className="text-gray-400">
                    Review and approve university admin requests
                </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6">
                {["pending", "approved", "rejected"].map((status) => (
                    <button
                        key={status}
                        onClick={() => {
                            setStatusFilter(status);
                            setPage(1);
                        }}
                        className={`px-6 py-3 rounded-lg font-semibold capitalize transition-colors ${
                            statusFilter === status
                                ? "bg-blue-600 text-white"
                                : "bg-gray-800 text-gray-400 hover:text-white"
                        }`}
                    >
                        {status}
                    </button>
                ))}
            </div>

            {/* Requests List */}
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            ) : requests.length === 0 ? (
                <div className="text-center py-12 bg-gray-800 rounded-xl">
                    <p className="text-gray-400 text-lg">
                        No {statusFilter} requests found
                    </p>
                </div>
            ) : (
                <>
                    <div className="space-y-4">
                        {requests.map((request) => (
                            <div
                                key={request.id}
                                className="bg-gray-800 rounded-xl p-6"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex gap-4 flex-1">
                                        <img
                                            src={
                                                request.user.profileUrl ||
                                                "https://cdn-icons-png.flaticon.com/512/847/847969.png"
                                            }
                                            alt={request.user.name}
                                            className="w-16 h-16 rounded-full object-cover"
                                        />

                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-xl font-semibold">
                                                    {request.user.name}
                                                </h3>
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(
                                                        request.status
                                                    )}`}
                                                >
                          {request.status}
                        </span>
                                            </div>

                                            <p className="text-gray-400 mb-2">
                                                {request.user.email}
                                            </p>

                                            <p className="text-sm text-gray-500 mb-2">
                                                🏫 {request.university.name} • 🌐{" "}
                                                {request.university.domain}
                                            </p>

                                            {request.requestMessage && (
                                                <div className="bg-gray-700 rounded-lg p-3 mb-3">
                                                    <span className="font-semibold">Message: </span>
                                                    {request.requestMessage}
                                                </div>
                                            )}

                                            {request.responseMessage && (
                                                <div className="bg-blue-900 bg-opacity-30 rounded-lg p-3 mb-3">
                                                    <span className="font-semibold">Response: </span>
                                                    {request.responseMessage}
                                                </div>
                                            )}

                                            <p className="text-xs text-gray-500">
                                                Requested{" "}
                                                {new Date(request.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>

                                    {request.status === "pending" && (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => openModal(request, "approve")}
                                                className="bg-green-600 hover:bg-green-700 px-5 py-2 rounded-lg font-semibold"
                                            >
                                                ✓ Approve
                                            </button>
                                            <button
                                                onClick={() => openModal(request, "reject")}
                                                className="bg-red-600 hover:bg-red-700 px-5 py-2 rounded-lg font-semibold"
                                            >
                                                ✗ Reject
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {pagination && pagination.totalPages > 1 && (
                        <div className="flex items-center justify-between mt-8">
                            <button
                                onClick={() => setPage((p) => p - 1)}
                                disabled={!pagination.hasPreviousPage}
                                className="bg-gray-800 px-6 py-2 rounded-lg disabled:opacity-50"
                            >
                                Previous
                            </button>

                            <span className="text-gray-400">
                Page {pagination.page} of {pagination.totalPages}
              </span>

                            <button
                                onClick={() => setPage((p) => p + 1)}
                                disabled={!pagination.hasNextPage}
                                className="bg-gray-800 px-6 py-2 rounded-lg disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Confirmation Modal */}
            {showModal && selectedRequest && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full">
                        <h3 className="text-xl font-bold mb-4">
                            {modalAction === "approve"
                                ? "Approve Request"
                                : "Reject Request"}
                        </h3>

                        <textarea
                            value={responseMessage}
                            onChange={(e) => setResponseMessage(e.target.value)}
                            className="w-full bg-gray-700 px-4 py-3 rounded-lg mb-4"
                            rows={3}
                            placeholder="Optional message..."
                        />

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setResponseMessage("");
                                }}
                                className="flex-1 bg-gray-700 px-4 py-2 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={
                                    modalAction === "approve"
                                        ? handleApprove
                                        : handleReject
                                }
                                disabled={processing}
                                className={`flex-1 px-4 py-2 rounded-lg ${
                                    modalAction === "approve"
                                        ? "bg-green-600"
                                        : "bg-red-600"
                                }`}
                            >
                                {processing ? "Processing..." : modalAction}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            </div>
        </div>
    );
}
