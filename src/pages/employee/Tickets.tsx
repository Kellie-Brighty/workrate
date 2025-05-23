import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  getEmployeeTickets,
  createTicket,
  addTicketComment,
  getTicketComments,
  onTicketCommentsUpdate,
  type Ticket,
  type TicketComment,
} from "../../services/firebase";
import {
  useSuccessNotification,
  useErrorNotification,
} from "../../contexts/NotificationContext";

const Tickets: React.FC = () => {
  const { currentUser, userData } = useAuth();
  const showSuccess = useSuccessNotification();
  const showError = useErrorNotification();

  // State for tickets and modals
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTicketDetails, setShowTicketDetails] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<TicketComment[]>([]);
  const [commentCounts, setCommentCounts] = useState<{ [key: string]: number }>(
    {}
  );
  const [newComment, setNewComment] = useState("");
  const [statusFilter, setStatusFilter] = useState<Ticket["status"] | "all">(
    "all"
  );

  // Form state
  const [newTicket, setNewTicket] = useState({
    title: "",
    description: "",
    category: "feature" as Ticket["category"],
    priority: "medium" as "low" | "medium" | "high",
    estimatedHours: "",
  });

  // Load tickets
  useEffect(() => {
    const loadTickets = async () => {
      if (!currentUser?.uid) return;

      try {
        const employeeTickets = await getEmployeeTickets(currentUser.uid);
        setTickets(employeeTickets);
      } catch (error) {
        console.error("Error loading tickets:", error);
        showError("Error", "Failed to load tickets");
      }
    };
    loadTickets();
  }, [currentUser?.uid]);

  // Load comments when ticket is selected
  useEffect(() => {
    if (selectedTicket?.id) {
      const loadComments = async () => {
        try {
          const ticketComments = await getTicketComments(
            selectedTicket.id as string
          );
          setComments(ticketComments);
        } catch (error) {
          console.error("Error loading comments:", error);
        }
      };
      loadComments();

      // Set up real-time listener for comments
      const unsubscribe = onTicketCommentsUpdate(
        (updatedComments: TicketComment[]) => {
          setComments(updatedComments);
        },
        selectedTicket.id as string
      );

      return () => unsubscribe();
    }
  }, [selectedTicket?.id]);

  // Load comment counts for all tickets
  useEffect(() => {
    const loadCommentCounts = async () => {
      const counts: { [key: string]: number } = {};
      for (const ticket of tickets) {
        if (ticket.id) {
          try {
            const ticketComments = await getTicketComments(ticket.id as string);
            counts[ticket.id] = ticketComments.length;
          } catch (error) {
            console.error(
              `Error loading comments for ticket ${ticket.id}:`,
              error
            );
            counts[ticket.id] = 0;
          }
        }
      }
      setCommentCounts(counts);
    };

    if (tickets.length > 0) {
      loadCommentCounts();
    }
  }, [tickets]);

  // Handle creating a new ticket
  const handleCreateTicket = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentUser?.uid) return;

    try {
      const ticketData: any = {
        ...newTicket,
        createdBy: currentUser.uid,
        status: "pending",
      };
      if (newTicket.category === "new-task") {
        ticketData.estimatedHours = Number(newTicket.estimatedHours) || 0;
      } else {
        delete ticketData.estimatedHours;
      }
      await createTicket(ticketData);
      setNewTicket({
        title: "",
        description: "",
        category: "feature",
        priority: "medium",
        estimatedHours: "",
      });
      setShowCreateModal(false);
      showSuccess("Success", "Ticket created successfully");
      const updatedTickets = await getEmployeeTickets(currentUser.uid);
      setTickets(updatedTickets);
    } catch (error) {
      console.error("Error creating ticket:", error);
      showError("Error", "Failed to create ticket");
    }
  };

  // Handle adding a comment
  const handleAddComment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentUser?.uid || !selectedTicket?.id) return;

    try {
      // Prepare comment data, omitting userAvatar if undefined
      const commentData: any = {
        ticketId: selectedTicket.id,
        userId: currentUser.uid,
        userName:
          userData?.fullName ||
          currentUser.displayName ||
          currentUser.email ||
          "Anonymous",
        content: newComment,
      };
      if (currentUser.photoURL) {
        commentData.userAvatar = currentUser.photoURL;
      }
      await addTicketComment(commentData);

      // Reset comment input
      setNewComment("");

      // Refresh comments
      const updatedComments = await getTicketComments(selectedTicket.id);
      setComments(updatedComments);
    } catch (error) {
      console.error("Error adding comment:", error);
      showError("Error", "Failed to add comment");
    }
  };

  // Handle viewing ticket details
  const handleViewTicket = async (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setShowTicketDetails(true);
  };

  // Filter tickets based on status
  const filteredTickets =
    statusFilter === "all"
      ? tickets
      : tickets.filter((ticket) => ticket.status === statusFilter);

  // Add refresh comments function
  const handleRefreshComments = async () => {
    if (selectedTicket?.id) {
      try {
        const ticketComments = await getTicketComments(selectedTicket.id);
        setComments(ticketComments);
        showSuccess("Success", "Comments refreshed");
      } catch (error) {
        console.error("Error refreshing comments:", error);
        showError("Error", "Failed to refresh comments");
      }
    }
  };

  // Helper to format time ago
  function formatTimeAgo(date: Date) {
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days !== 1 ? "s" : ""} ago`;
  }

  return (
    <div className="w-full bg-gray-50 min-h-screen pb-12">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">My Tickets</h1>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-indigo-600 px-4 py-2 text-white rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors duration-200 flex items-center gap-1"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              New Ticket
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Filter */}
        <div className="mb-6">
          <label htmlFor="status" className="sr-only">
            Filter by status
          </label>
          <select
            id="status"
            name="status"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as Ticket["status"] | "all")
            }
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="ignored">Ignored</option>
            <option value="converted-to-project">Converted to Project</option>
            <option value="added-to-task">Added to Task</option>
          </select>
        </div>

        {/* Tickets List */}
        {filteredTickets.length === 0 ? (
          <div className="text-center py-12 bg-white shadow rounded-lg">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No tickets found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {statusFilter === "all"
                ? "You haven't created any tickets yet."
                : `You don't have any ${statusFilter} tickets.`}
            </p>
            <div className="mt-6">
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Create your first ticket
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {filteredTickets.map((ticket) => (
                <li key={ticket.id}>
                  <div
                    className="block hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleViewTicket(ticket)}
                  >
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-indigo-600 truncate">
                            {ticket.title}
                          </p>
                          <span className="ml-2 flex items-center text-xs text-gray-500">
                            <svg
                              className="h-4 w-4 mr-0.5 text-gray-400"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 8h2a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2v-8a2 2 0 012-2h2m2-4h4a2 2 0 012 2v4H7V6a2 2 0 012-2z"
                              />
                            </svg>
                            {commentCounts[ticket.id!] || 0}
                          </span>
                        </div>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              ticket.priority === "high"
                                ? "bg-red-100 text-red-800"
                                : ticket.priority === "medium"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {ticket.priority.charAt(0).toUpperCase() +
                              ticket.priority.slice(1)}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            {ticket.description}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <p>
                            Created{" "}
                            {ticket.createdAt
                              ? new Date(
                                  ticket.createdAt.seconds * 1000
                                ).toLocaleDateString()
                              : "recently"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Create Ticket Modal */}
        {showCreateModal && (
          <div className="fixed z-10 inset-0 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity">
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen"></span>
              &#8203;
              <div
                className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-headline"
              >
                <form onSubmit={handleCreateTicket}>
                  <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                      <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                        <h3
                          className="text-lg leading-6 font-medium text-gray-900"
                          id="modal-headline"
                        >
                          Create New Ticket
                        </h3>
                        <div className="mt-4 space-y-4">
                          <div>
                            <label
                              htmlFor="title"
                              className="block text-sm font-medium text-gray-700"
                            >
                              Title
                            </label>
                            <input
                              type="text"
                              name="title"
                              id="title"
                              required
                              value={newTicket.title}
                              onChange={(e) =>
                                setNewTicket({
                                  ...newTicket,
                                  title: e.target.value,
                                })
                              }
                              className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            />
                          </div>
                          <div>
                            <label
                              htmlFor="description"
                              className="block text-sm font-medium text-gray-700"
                            >
                              Description
                            </label>
                            <textarea
                              name="description"
                              id="description"
                              rows={3}
                              required
                              value={newTicket.description}
                              onChange={(e) =>
                                setNewTicket({
                                  ...newTicket,
                                  description: e.target.value,
                                })
                              }
                              className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            />
                          </div>
                          <div>
                            <label
                              htmlFor="category"
                              className="block text-sm font-medium text-gray-700"
                            >
                              Category
                            </label>
                            <select
                              id="category"
                              name="category"
                              value={newTicket.category}
                              onChange={(e) =>
                                setNewTicket({
                                  ...newTicket,
                                  category: e.target
                                    .value as Ticket["category"],
                                })
                              }
                              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                            >
                              <option value="feature">Feature Request</option>
                              <option value="bug">Bug Report</option>
                              <option value="improvement">Improvement</option>
                              <option value="project-creation">
                                Project Creation
                              </option>
                              <option value="new-task">New Task</option>
                              <option value="other">Other</option>
                            </select>
                          </div>
                          {newTicket.category === "new-task" && (
                            <div>
                              <label
                                htmlFor="estimatedHours"
                                className="block text-sm font-medium text-gray-700"
                              >
                                Estimated Hours
                              </label>
                              <input
                                type="number"
                                name="estimatedHours"
                                id="estimatedHours"
                                min="0"
                                step="0.5"
                                required
                                value={newTicket.estimatedHours}
                                onChange={(e) =>
                                  setNewTicket({
                                    ...newTicket,
                                    estimatedHours: e.target.value,
                                  })
                                }
                                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                              />
                            </div>
                          )}
                          <div>
                            <label
                              htmlFor="priority"
                              className="block text-sm font-medium text-gray-700"
                            >
                              Priority
                            </label>
                            <select
                              id="priority"
                              name="priority"
                              value={newTicket.priority}
                              onChange={(e) =>
                                setNewTicket({
                                  ...newTicket,
                                  priority: e.target
                                    .value as Ticket["priority"],
                                })
                              }
                              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                            >
                              <option value="low">Low</option>
                              <option value="medium">Medium</option>
                              <option value="high">High</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button
                      type="submit"
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      Create Ticket
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Ticket Details Modal */}
        {showTicketDetails && selectedTicket && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-gray-500 opacity-75 z-40"></div>
            <div
              className="relative z-50 bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all max-w-lg w-full flex flex-col"
              style={{
                maxHeight: "80vh",
                height: "700px",
              }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-headline"
            >
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 flex-1 overflow-y-auto">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <div className="flex justify-between items-center">
                      <h3
                        className="text-lg leading-6 font-medium text-gray-900"
                        id="modal-headline"
                      >
                        {selectedTicket.title}
                      </h3>
                      <button
                        type="button"
                        onClick={() => setShowTicketDetails(false)}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <span className="sr-only">Close</span>
                        <svg
                          className="h-6 w-6"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                    <div className="mt-4">
                      <div className="flex items-center space-x-2 mb-4">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            selectedTicket.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : selectedTicket.status === "ignored"
                              ? "bg-gray-100 text-gray-800"
                              : selectedTicket.status === "converted-to-project"
                              ? "bg-green-100 text-green-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {selectedTicket.status
                            .split("-")
                            .map(
                              (word) =>
                                word.charAt(0).toUpperCase() + word.slice(1)
                            )
                            .join(" ")}
                        </span>
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            selectedTicket.priority === "high"
                              ? "bg-red-100 text-red-800"
                              : selectedTicket.priority === "medium"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {selectedTicket.priority.charAt(0).toUpperCase() +
                            selectedTicket.priority.slice(1)}
                        </span>
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {selectedTicket.category.charAt(0).toUpperCase() +
                            selectedTicket.category.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {selectedTicket.description}
                      </p>
                    </div>

                    {/* Comments Section */}
                    <div className="mt-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-gray-900">
                          Comments
                        </h3>
                        <button
                          onClick={handleRefreshComments}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          <svg
                            className="h-4 w-4 mr-1"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                          </svg>
                          Refresh
                        </button>
                      </div>
                      <div className="space-y-4">
                        {comments.map((comment) => (
                          <div
                            key={comment.id}
                            className="flex space-x-3 bg-gray-50 p-4 rounded-lg"
                          >
                            {comment.userAvatar ? (
                              <img
                                className="h-10 w-10 rounded-full"
                                src={comment.userAvatar}
                                alt=""
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                <span className="text-gray-600 text-sm">
                                  {comment.userName.charAt(0)}
                                </span>
                              </div>
                            )}
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h3 className="text-sm font-medium text-gray-900">
                                  {comment.userName}
                                </h3>
                                <p className="text-sm text-gray-500">
                                  {comment.createdAt
                                    ? formatTimeAgo(
                                        new Date(
                                          comment.createdAt.seconds * 1000
                                        )
                                      )
                                    : "recently"}
                                </p>
                              </div>
                              <div className="mt-1 text-sm text-gray-700">
                                {comment.content}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Add Comment Form */}
                      <form onSubmit={handleAddComment} className="mt-4">
                        <div>
                          <label htmlFor="comment" className="sr-only">
                            Add a comment
                          </label>
                          <textarea
                            id="comment"
                            name="comment"
                            rows={3}
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            placeholder="Add a comment..."
                          ></textarea>
                        </div>
                        <div className="mt-3 flex justify-end">
                          <button
                            type="submit"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            Comment
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Tickets;
