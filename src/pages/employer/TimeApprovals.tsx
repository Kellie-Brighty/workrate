import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  useSuccessNotification,
  useErrorNotification,
} from "../../contexts/NotificationContext";
import {
  getEmployerRenegotiationRequests,
  updateRenegotiationRequest,
  type DueDateRenegotiationRequest,
} from "../../services/firebase";
import Modal from "../../components/Modal";

const TimeApprovals: React.FC = () => {
  const { userData } = useAuth();
  const showSuccess = useSuccessNotification();
  const showError = useErrorNotification();

  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<
    (DueDateRenegotiationRequest & { id: string })[]
  >([]);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [selectedRequest, setSelectedRequest] = useState<
    (DueDateRenegotiationRequest & { id: string }) | null
  >(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(
    null
  );
  const [responseNote, setResponseNote] = useState("");
  const [processingAction, setProcessingAction] = useState(false);

  // Add a ref to track if data has been fetched
  const dataFetchedRef = useRef(false);

  useEffect(() => {
    // Only fetch if we haven't already or if userData.id changes
    if (dataFetchedRef.current && userData?.id) return;

    const fetchRequests = async () => {
      if (!userData?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const requestsData = await getEmployerRenegotiationRequests(
          userData.id
        );

        // Add proper type assertion to handle the returned data
        setRequests(
          (Array.isArray(requestsData)
            ? requestsData
            : []) as (DueDateRenegotiationRequest & { id: string })[]
        );

        // Mark data as fetched
        dataFetchedRef.current = true;
      } catch (error) {
        console.error("Error fetching renegotiation requests:", error);
        showError("Error", "Failed to load renegotiation requests");
        // Ensure we set empty requests on error
        setRequests([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [userData?.id]); // Remove showError from dependencies

  // Filter requests based on status
  const filteredRequests = requests.filter((request) => {
    if (statusFilter === "all") return true;
    return request.status === statusFilter;
  });

  // Handle approve/reject actions
  const handleAction = (
    request: DueDateRenegotiationRequest & { id: string },
    action: "approve" | "reject"
  ) => {
    setSelectedRequest(request);
    setActionType(action);
    setResponseNote("");
    setShowActionModal(true);
  };

  // Submit the action
  const submitAction = async () => {
    if (!selectedRequest || !actionType) return;

    try {
      setProcessingAction(true);
      await updateRenegotiationRequest(
        selectedRequest.id,
        actionType === "approve" ? "approved" : "rejected",
        responseNote
      );

      // Update local state
      setRequests(
        requests.map((req) =>
          req.id === selectedRequest.id
            ? {
                ...req,
                status: actionType === "approve" ? "approved" : "rejected",
                responseNote,
              }
            : req
        )
      );

      showSuccess(
        actionType === "approve" ? "Request Approved" : "Request Rejected",
        `The due date change request has been ${
          actionType === "approve" ? "approved" : "rejected"
        }.`
      );
      setShowActionModal(false);
    } catch (error) {
      console.error(`Error ${actionType}ing request:`, error);
      showError("Error", `Failed to ${actionType} request`);
    } finally {
      setProcessingAction(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Due Date Change Requests
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white shadow rounded-lg p-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Requests</h2>
              <p className="text-sm text-gray-500">
                Review and manage due date change requests from your team
                members
              </p>
            </div>
            <div className="w-full sm:w-auto">
              <select
                id="status-filter"
                name="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="pending">Pending Requests</option>
                <option value="approved">Approved Requests</option>
                <option value="rejected">Rejected Requests</option>
                <option value="all">All Requests</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          /* Request list */
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            {filteredRequests.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {filteredRequests.map((request) => (
                  <li key={request.id}>
                    <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-indigo-100">
                              <span className="text-sm font-medium leading-none text-indigo-800">
                                {request.employeeName?.charAt(0) || "U"}
                              </span>
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-indigo-600">
                              {request.taskTitle}
                            </div>
                            <div className="text-sm text-gray-500">
                              Requested by: {request.employeeName}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              request.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : request.status === "approved"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {request.status.charAt(0).toUpperCase() +
                              request.status.slice(1)}
                          </span>
                        </div>
                      </div>
                      <div className="mt-4 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <div className="flex items-center text-sm text-gray-500 sm:mr-6">
                            <svg
                              className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span>
                              Current: {formatDate(request.currentDueDate)}
                            </span>
                          </div>
                          <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                            <svg
                              className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span>
                              Requested: {formatDate(request.requestedDueDate)}
                            </span>
                          </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between sm:mt-0">
                          <span className="text-sm text-gray-500 mr-4">
                            Project: {request.projectName}
                          </span>
                          {request.status === "pending" && (
                            <div className="ml-2 flex-shrink-0 flex">
                              <button
                                onClick={() => handleAction(request, "reject")}
                                className="mr-2 inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                              >
                                Reject
                              </button>
                              <button
                                onClick={() => handleAction(request, "approve")}
                                className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                              >
                                Approve
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Request reason */}
                      <div className="mt-2">
                        <div className="text-sm font-medium text-gray-500">
                          Reason:
                        </div>
                        <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">
                          {request.reason}
                        </p>
                      </div>

                      {/* Show response note if available */}
                      {request.responseNote && request.status !== "pending" && (
                        <div className="mt-2">
                          <div className="text-sm font-medium text-gray-500">
                            Your Response:
                          </div>
                          <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">
                            {request.responseNote}
                          </p>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No requests found
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {statusFilter === "pending"
                    ? "There are no pending due date change requests."
                    : statusFilter === "approved"
                    ? "You haven't approved any due date change requests yet."
                    : statusFilter === "rejected"
                    ? "You haven't rejected any due date change requests yet."
                    : "There are no due date change requests."}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Action Modal */}
        <Modal
          isOpen={showActionModal}
          onClose={() => setShowActionModal(false)}
          title={
            actionType === "approve" ? "Approve Request" : "Reject Request"
          }
          size="medium"
          actions={
            <>
              <button
                onClick={() => setShowActionModal(false)}
                disabled={processingAction}
                className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                onClick={submitAction}
                disabled={processingAction}
                className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  actionType === "approve"
                    ? "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500"
                    : "bg-red-600 hover:bg-red-700 focus:ring-red-500"
                }`}
              >
                {processingAction ? (
                  <div className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </div>
                ) : actionType === "approve" ? (
                  "Approve"
                ) : (
                  "Reject"
                )}
              </button>
            </>
          }
        >
          {selectedRequest && (
            <div className="space-y-4 py-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700">
                  Task: {selectedRequest.taskTitle}
                </h3>
                <p className="text-sm text-gray-500">
                  Requested by: {selectedRequest.employeeName}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Current Due Date
                  </label>
                  <div className="mt-1 bg-gray-50 p-2 rounded text-sm text-gray-900">
                    {formatDate(selectedRequest.currentDueDate)}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Requested Due Date
                  </label>
                  <div className="mt-1 bg-gray-50 p-2 rounded text-sm text-gray-900">
                    {formatDate(selectedRequest.requestedDueDate)}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Reason
                </label>
                <div className="mt-1 bg-gray-50 p-2 rounded text-sm text-gray-900">
                  {selectedRequest.reason}
                </div>
              </div>

              <div>
                <label
                  htmlFor="responseNote"
                  className="block text-sm font-medium text-gray-700"
                >
                  Your Response (Optional)
                </label>
                <textarea
                  id="responseNote"
                  name="responseNote"
                  rows={3}
                  value={responseNote}
                  onChange={(e) => setResponseNote(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder={
                    actionType === "approve"
                      ? "Add any additional notes or context for approving this request..."
                      : "Provide a reason for rejecting this request..."
                  }
                />
              </div>

              <div
                className={`p-4 rounded-md ${
                  actionType === "approve" ? "bg-green-50" : "bg-yellow-50"
                }`}
              >
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className={`h-5 w-5 ${
                        actionType === "approve"
                          ? "text-green-400"
                          : "text-yellow-400"
                      }`}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3
                      className={`text-sm font-medium ${
                        actionType === "approve"
                          ? "text-green-800"
                          : "text-yellow-800"
                      }`}
                    >
                      {actionType === "approve"
                        ? "Confirm Approval"
                        : "Confirm Rejection"}
                    </h3>
                    <div
                      className={`mt-2 text-sm ${
                        actionType === "approve"
                          ? "text-green-700"
                          : "text-yellow-700"
                      }`}
                    >
                      <p>
                        {actionType === "approve"
                          ? "By approving this request, the task due date will be updated to the requested date. This action cannot be undone."
                          : "By rejecting this request, the task due date will remain unchanged. This action cannot be undone."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Modal>
      </main>
    </div>
  );
};

export default TimeApprovals;
