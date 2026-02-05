import { useEffect, useState } from "react";
import {
  getMyUniversityRequests,
  submitUniversityRequest,
} from "../api/university-requests.api";

export default function UniversityRegistrationRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [requestMessage, setRequestMessage] = useState("");

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await getMyUniversityRequests();
      setRequests(response.requests || []);
    } catch (error) {
      console.error("Failed to fetch university requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setDomain("");
    setCity("");
    setState("");
    setLogoUrl("");
    setRequestMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      await submitUniversityRequest({
        name,
        domain,
        city,
        state,
        logoUrl,
        requestMessage,
      });
      alert("✅ University request submitted successfully!");
      setShowForm(false);
      resetForm();
      fetchRequests();
    } catch (error) {
      console.error("Failed to submit request:", error);
      alert(error.response?.data?.message || "Failed to submit request");
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
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">University Registration</h1>
          <p className="text-gray-400">
            Submit your university details for approval by the Universal Admin.
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
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
          New Request
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-12 bg-gray-800 rounded-xl">
          <p className="text-gray-400 text-lg">No requests yet</p>
          <p className="text-gray-500 text-sm">
            Click "New Request" to register your university.
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
                      <h3 className="text-xl font-semibold">{request.name}</h3>
                      <span
                        className={`${badge.bg} px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1`}
                      >
                        <span>{badge.icon}</span>
                        <span className="capitalize">{request.status}</span>
                      </span>
                    </div>
                    <p className="text-gray-400">{request.domain}</p>
                    {(request.city || request.state) && (
                      <p className="text-gray-500 text-sm">
                        {request.city || ""} {request.city && request.state ? ", " : ""}
                        {request.state || ""}
                      </p>
                    )}
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
                      {request.status === "approved" ? "✓ Approved" : "✗ Rejected"}
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
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-xl p-6 max-w-xl w-full">
            <h3 className="text-2xl font-bold mb-4">Register University</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  University Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  University Domain
                </label>
                <input
                  type="text"
                  value={domain}
                  onChange={(event) => setDomain(event.target.value)}
                  required
                  placeholder="example.edu"
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    City (Optional)
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(event) => setCity(event.target.value)}
                    className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    State (Optional)
                  </label>
                  <input
                    type="text"
                    value={state}
                    onChange={(event) => setState(event.target.value)}
                    className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Logo URL (Optional)
                </label>
                <input
                  type="url"
                  value={logoUrl}
                  onChange={(event) => setLogoUrl(event.target.value)}
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Request Message (Optional)
                </label>
                <textarea
                  value={requestMessage}
                  onChange={(event) => setRequestMessage(event.target.value)}
                  rows={4}
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  disabled={submitting}
                  className="flex-1 bg-gray-700 px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
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
  );
}