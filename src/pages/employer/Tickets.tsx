import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  getTickets,
  updateTicketStatus,
  addTicketComment,
  getTicketComments,
  onTicketCommentsUpdate,
  type Ticket,
  type TicketComment,
  getProjects,
  getUserData,
  onTicketsUpdate,
} from "../../services/firebase";
import {
  useSuccessNotification,
  useErrorNotification,
} from "../../contexts/NotificationContext";
import { useNavigate } from "react-router-dom";

const Tickets: React.FC = () => {
  const { currentUser, userData } = useAuth();
  const showSuccess = useSuccessNotification();
  const showError = useErrorNotification();
  const navigate = useNavigate();

  // State for tickets and modals
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [showTicketDetails, setShowTicketDetails] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<TicketComment[]>([]);
  const [_commentCounts, setCommentCounts] = useState<{ [key: string]: number }>(
    {}
  );
  const [newComment, setNewComment] = useState("");
  const [statusFilter, setStatusFilter] = useState<Ticket["status"] | "all">(
    "all"
  );
  const [showProjectSelect, setShowProjectSelect] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [creatorNames, setCreatorNames] = useState<{ [id: string]: string }>(
    {}
  );
  const [showActionsDropdown, setShowActionsDropdown] = useState(false);

  // Load tickets and set up real-time listener
  useEffect(() => {
    const loadTickets = async () => {
      try {
        const allTickets = await getTickets();
        setTickets(allTickets);
      } catch (error) {
        console.error("Error loading tickets:", error);
        showError("Error", "Failed to load tickets");
      }
    };

    // Initial load
    loadTickets();

    // Set up real-time listener for ticket updates
    const unsubscribe = onTicketsUpdate((updatedTickets: Ticket[]) => {
      setTickets(updatedTickets);

      // Update selected ticket if it exists in the updated tickets
      if (selectedTicket) {
        const updatedSelectedTicket = updatedTickets.find(
          (t: Ticket) => t.id === selectedTicket.id
        );
        if (updatedSelectedTicket) {
          setSelectedTicket(updatedSelectedTicket);
        }
      }
    });

    return () => unsubscribe();
  }, [selectedTicket?.id]);

  // Load comments when a ticket is selected
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
      const unsubscribe = onTicketCommentsUpdate((updatedComments) => {
        setComments(updatedComments);
      }, selectedTicket.id as string);

      return () => unsubscribe();
    }
  }, [selectedTicket?.id]);

  // Load comment counts for all tickets
  useEffect(() => {
    const loadCommentCounts = async () => {
      const counts: { [key: string]: number } = {};
      for (const ticket of tickets) {
        try {
          const ticketComments = await getTicketComments(ticket.id as string);
          counts[ticket.id as string] = ticketComments.length;
        } catch (error) {
          console.error(
            `Error loading comments for ticket ${ticket.id}:`,
            error
          );
          counts[ticket.id as string] = 0;
        }
      }
      setCommentCounts(counts);
    };

    if (tickets.length > 0) {
      loadCommentCounts();
    }
  }, [tickets]);

  // Load projects for project selection
  useEffect(() => {
    if (showProjectSelect && currentUser?.uid) {
      const loadProjects = async () => {
        try {
          const projectsList = await getProjects(currentUser.uid);
          setProjects(projectsList);
        } catch (error) {
          // ignore
        }
      };
      loadProjects();
    }
  }, [showProjectSelect, currentUser?.uid]);

  // Handle ticket status update
  const handleStatusUpdate = async (
    ticketId: string,
    newStatus: Ticket["status"],
    relatedProjectId?: string,
    relatedTaskId?: string
  ) => {
    if (!currentUser?.uid) return;

    try {
      await updateTicketStatus(
        ticketId,
        newStatus,
        currentUser.uid,
        relatedProjectId,
        relatedTaskId
      );

      // Show success notification
      showSuccess("Success", "Ticket status updated successfully");

      // Refresh tickets list
      const updatedTickets = await getTickets();
      setTickets(updatedTickets);

      // Update selected ticket if it's the one being modified
      if (selectedTicket?.id === ticketId) {
        const updatedTicket = updatedTickets.find((t) => t.id === ticketId);
        if (updatedTicket) {
          setSelectedTicket(updatedTicket);
        }
      }
    } catch (error) {
      console.error("Error updating ticket status:", error);
      showError("Error", "Failed to update ticket status");
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
      const updatedComments = await getTicketComments(
        selectedTicket.id as string
      );
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

  // Helper to get ticket creator name (if available)
  function getTicketCreatorName(ticket: Ticket) {
    if ((ticket as any).createdByName) return (ticket as any).createdByName;
    if (creatorNames[ticket.createdBy]) return creatorNames[ticket.createdBy];
    return "Loading...";
  }

  // Fetch creator name if not present
  useEffect(() => {
    if (
      selectedTicket &&
      selectedTicket.createdBy &&
      !creatorNames[selectedTicket.createdBy]
    ) {
      getUserData(selectedTicket.createdBy).then((user) => {
        if (user && (user as any).fullName) {
          setCreatorNames((prev) => ({
            ...prev,
            [selectedTicket.createdBy]: (user as any).fullName,
          }));
        } else if (user && user.id) {
          setCreatorNames((prev) => ({
            ...prev,
            [selectedTicket.createdBy]: user.id,
          }));
        }
      });
    }
  }, [selectedTicket, creatorNames]);

  
  // Add refresh comments function
  const handleRefreshComments = async () => {
    if (selectedTicket?.id) {
      try {
        const ticketComments = await getTicketComments(
          selectedTicket.id as string
        );
        setComments(ticketComments);
        showSuccess("Success", "Comments refreshed");
      } catch (error) {
        console.error("Error refreshing comments:", error);
        showError("Error", "Failed to refresh comments");
      }
    }
  };

  // Add a click outside handler to close the dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const menu = document.getElementById("ticket-actions-menu");
      if (menu && !menu.contains(event.target as Node)) {
        setShowActionsDropdown(false);
      }
    }
    // if (showActionsDropdown) {
    //   document.addEventListener("mousedown", handleClickOutside);
    // } else {
    //   document.removeEventListener("mousedown", handleClickOutside);
    // }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showActionsDropdown]);

  return (
    <div className="w-full bg-gray-50 min-h-screen pb-12">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">Employee Tickets</h1>
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
                ? "There are no tickets yet."
                : `There are no ${statusFilter} tickets.`}
            </p>
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
                          <div className="ml-2 flex-shrink-0 flex">
                            <p
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                ticket.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : ticket.status === "ignored"
                                  ? "bg-gray-100 text-gray-800"
                                  : ticket.status === "converted-to-project"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {ticket.status
                                .split("-")
                                .map(
                                  (word) =>
                                    word.charAt(0).toUpperCase() + word.slice(1)
                                )
                                .join(" ")}
                            </p>
                          </div>
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

        {/* Ticket Details Modal */}
        {showTicketDetails && selectedTicket && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Overlay */}
            <div className="fixed inset-0 bg-gray-500 opacity-75 z-40"></div>
            {/* Modal content */}
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
              <div
                className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 flex-1 overflow-y-auto"
                style={{ minHeight: 0 }}
              >
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

                    {/* Action Buttons */}
                    {selectedTicket.status === "pending" && (
                      <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:space-x-3 space-y-2 sm:space-y-0">
                        <div className="relative inline-block text-left">
                          <button
                            type="button"
                            className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            id="ticket-actions-menu"
                            aria-haspopup="true"
                            aria-expanded={showActionsDropdown}
                            onClick={() =>
                              setShowActionsDropdown((prev) => !prev)
                            }
                          >
                            Actions
                            <svg
                              className="-mr-1 ml-2 h-5 w-5"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                              aria-hidden="true"
                            >
                              <path
                                fillRule="evenodd"
                                d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                          {showActionsDropdown && (
                            <div className="origin-top-left absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-20">
                              <div className="py-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedTicket(selectedTicket);
                                    setShowTicketDetails(true);
                                    handleStatusUpdate(
                                      selectedTicket.id as string,
                                      "ignored"
                                    );
                                    setTimeout(
                                      () => setShowActionsDropdown(false),
                                      0
                                    );
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  Ignore
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setShowActionsDropdown(false);
                                    setShowTicketDetails(false);
                                    if (selectedTicket) {
                                      navigate("/employer/create-project", {
                                        state: {
                                          ticketData: {
                                            title: selectedTicket.title,
                                            description:
                                              selectedTicket.description,
                                            sourceTicketId: selectedTicket.id,
                                            priority: selectedTicket.priority,
                                            category: selectedTicket.category,
                                          },
                                        },
                                      });
                                    }
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-indigo-700 hover:bg-indigo-100"
                                >
                                  Convert to Project
                                </button>
                                <button
                                  // type="button"
                                  onClick={() => {
                                    setSelectedTicket(selectedTicket);
                                    setShowTicketDetails(true);
                                    setSelectedProjectId("");
                                    setShowProjectSelect(true);
                                    setTimeout(
                                      () => setShowActionsDropdown(false),
                                      0
                                    );
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-green-50"
                                >
                                  Add as Task
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                        {showProjectSelect && (
                          <div className="ml-0 sm:ml-4 mt-4 sm:mt-0 flex flex-col sm:flex-row sm:items-center">
                            <select
                              value={selectedProjectId}
                              onChange={(e) =>
                                setSelectedProjectId(e.target.value)
                              }
                              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                            >
                              <option value="">Select Project</option>
                              {projects.map((project) => (
                                <option key={project.id} value={project.id}>
                                  {project.name}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              disabled={!selectedProjectId}
                              onClick={() => {
                                if (selectedProjectId && selectedTicket) {
                                  navigate(
                                    `/employer/projects/${selectedProjectId}`,
                                    {
                                      state: {
                                        addTaskFromTicket: {
                                          title: selectedTicket.title,
                                          description:
                                            selectedTicket.description,
                                          estimatedHours:
                                            (selectedTicket as any)
                                              .estimatedHours || undefined,
                                          assignedTo: selectedTicket.createdBy,
                                          ticketId: selectedTicket.id,
                                        },
                                        openAddTaskModal: true,
                                      },
                                    }
                                  );
                                  setShowProjectSelect(false);
                                  setSelectedProjectId("");
                                  setShowTicketDetails(false);
                                }
                              }}
                              className="mt-2 sm:mt-0 sm:ml-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                            >
                              Confirm Add to Project
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setShowProjectSelect(false);
                                setSelectedProjectId("");
                              }}
                              className="mt-2 sm:mt-0 sm:ml-2 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>
                    )}

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
                      <div
                        className="space-y-4 overflow-y-auto"
                        style={{ maxHeight: "220px", minHeight: 0 }}
                      >
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

                    {/* Ticket Creator Name */}
                    <div className="mt-4">
                      <span className="text-xs text-gray-500">
                        Created by:{" "}
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {getTicketCreatorName(selectedTicket)}
                      </span>
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
