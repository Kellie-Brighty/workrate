import React, { useState, useEffect } from "react";
import Modal from "../../components/Modal";

// Hook to detect screen size
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    // Set initial value
    checkIsMobile();

    // Add event listener
    window.addEventListener("resize", checkIsMobile);

    // Clean up
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  return isMobile;
};

// Mock data for tasks
const tasksData = [
  {
    id: 1,
    title: "Research competitors",
    description:
      "Analyze top 5 competitors in the market and prepare a report on their features and pricing",
    dueDate: "2023-11-25",
    status: "Completed",
    priority: "Medium",
    assignee: {
      id: 1,
      name: "Jason Chen",
      avatar: "https://randomuser.me/api/portraits/men/42.jpg",
    },
    project: {
      id: 1,
      title: "Website Redesign",
    },
    tags: ["research", "marketing"],
    createdAt: "2023-10-15",
  },
  {
    id: 2,
    title: "Create wireframes",
    description:
      "Design wireframes for the homepage, product pages, and checkout flow",
    dueDate: "2023-11-05",
    status: "Completed",
    priority: "High",
    assignee: {
      id: 1,
      name: "Jason Chen",
      avatar: "https://randomuser.me/api/portraits/men/42.jpg",
    },
    project: {
      id: 1,
      title: "Website Redesign",
    },
    tags: ["design", "wireframes"],
    createdAt: "2023-10-18",
  },
  {
    id: 3,
    title: "Design homepage",
    description:
      "Create high-fidelity designs for the homepage based on approved wireframes",
    dueDate: "2023-11-15",
    status: "In Progress",
    priority: "High",
    assignee: {
      id: 1,
      name: "Jason Chen",
      avatar: "https://randomuser.me/api/portraits/men/42.jpg",
    },
    project: {
      id: 1,
      title: "Website Redesign",
    },
    tags: ["design", "ui"],
    createdAt: "2023-10-25",
  },
  {
    id: 4,
    title: "Implement responsive layout",
    description:
      "Develop responsive layout for all screen sizes following the design specifications",
    dueDate: "2023-11-30",
    status: "Not Started",
    priority: "High",
    assignee: {
      id: 2,
      name: "Sarah Johnson",
      avatar: "https://randomuser.me/api/portraits/women/43.jpg",
    },
    project: {
      id: 1,
      title: "Website Redesign",
    },
    tags: ["development", "responsive"],
    createdAt: "2023-10-27",
  },
  {
    id: 5,
    title: "Create backend API",
    description: "Develop RESTful API endpoints for the application",
    dueDate: "2023-11-20",
    status: "In Progress",
    priority: "Medium",
    assignee: {
      id: 3,
      name: "Michael Brown",
      avatar: "https://randomuser.me/api/portraits/men/44.jpg",
    },
    project: {
      id: 1,
      title: "Website Redesign",
    },
    tags: ["development", "backend"],
    createdAt: "2023-10-22",
  },
  {
    id: 6,
    title: "Develop mobile app UI",
    description:
      "Design UI components for the iOS and Android mobile application",
    dueDate: "2023-12-10",
    status: "Not Started",
    priority: "Medium",
    assignee: {
      id: 1,
      name: "Jason Chen",
      avatar: "https://randomuser.me/api/portraits/men/42.jpg",
    },
    project: {
      id: 2,
      title: "Mobile App Development",
    },
    tags: ["design", "mobile"],
    createdAt: "2023-11-01",
  },
  {
    id: 7,
    title: "Performance optimization",
    description:
      "Optimize website performance and achieve a 90+ score on PageSpeed Insights",
    dueDate: "2023-12-20",
    status: "Not Started",
    priority: "Low",
    assignee: {
      id: 2,
      name: "Sarah Johnson",
      avatar: "https://randomuser.me/api/portraits/women/43.jpg",
    },
    project: {
      id: 1,
      title: "Website Redesign",
    },
    tags: ["development", "performance"],
    createdAt: "2023-11-05",
  },
  {
    id: 8,
    title: "CRM data migration",
    description: "Migrate existing customer data to the new CRM system",
    dueDate: "2023-11-30",
    status: "In Progress",
    priority: "High",
    assignee: {
      id: 3,
      name: "Michael Brown",
      avatar: "https://randomuser.me/api/portraits/men/44.jpg",
    },
    project: {
      id: 3,
      title: "CRM Integration",
    },
    tags: ["data", "migration"],
    createdAt: "2023-10-20",
  },
  {
    id: 9,
    title: "User testing",
    description:
      "Conduct user testing sessions with 5-7 participants and gather feedback",
    dueDate: "2023-12-15",
    status: "Not Started",
    priority: "Medium",
    assignee: {
      id: 4,
      name: "Emily Davis",
      avatar: "https://randomuser.me/api/portraits/women/45.jpg",
    },
    project: {
      id: 1,
      title: "Website Redesign",
    },
    tags: ["testing", "ux"],
    createdAt: "2023-11-10",
  },
  {
    id: 10,
    title: "Set up analytics",
    description: "Implement Google Analytics and set up custom event tracking",
    dueDate: "2023-12-05",
    status: "Not Started",
    priority: "Low",
    assignee: {
      id: 4,
      name: "Emily Davis",
      avatar: "https://randomuser.me/api/portraits/women/45.jpg",
    },
    project: {
      id: 4,
      title: "Marketing Campaign",
    },
    tags: ["analytics", "marketing"],
    createdAt: "2023-11-12",
  },
];

// Status color mapping
const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "completed":
      return "bg-green-100 text-green-800";
    case "in progress":
      return "bg-blue-100 text-blue-800";
    case "not started":
      return "bg-gray-100 text-gray-800";
    case "overdue":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// Priority color mapping
const getPriorityColor = (priority: string) => {
  switch (priority.toLowerCase()) {
    case "high":
      return "bg-red-100 text-red-800";
    case "medium":
      return "bg-yellow-100 text-yellow-800";
    case "low":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// Calculate if a task is overdue
const isTaskOverdue = (task: any) => {
  const today = new Date();
  const dueDate = new Date(task.dueDate);
  return today > dueDate && task.status.toLowerCase() !== "completed";
};

// Get the effective status (including Overdue)
const getEffectiveStatus = (task: any) => {
  if (isTaskOverdue(task)) {
    return "Overdue";
  }
  return task.status;
};

const Tasks: React.FC = () => {
  const isMobile = useIsMobile();

  // Add state for tasks
  const [tasks, setTasks] = useState(tasksData);

  // Add new states for modals and filters
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showTaskDetailModal, setShowTaskDetailModal] = useState(false);
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);

  // Search/filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [sortBy, setSortBy] = useState("dueDate");
  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 10;

  // Handle task click
  const handleTaskClick = (task: any) => {
    setSelectedTask(task);
    setShowTaskDetailModal(true);
  };

  // Handle edit task button
  const handleEditTask = (task: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedTask(task);
    setShowEditTaskModal(true);
  };

  // Handle status change
  const handleStatusChange = (taskId: number, newStatus: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );

    // If task detail modal is open, update selected task
    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask({ ...selectedTask, status: newStatus });
    }
  };

  // Filter tasks based on search and filters
  const filteredTasks = tasks.filter((task) => {
    // Search filter
    const matchesSearch =
      searchQuery === "" ||
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase());

    // Status filter
    const matchesStatus =
      statusFilter === "all" ||
      getEffectiveStatus(task).toLowerCase() === statusFilter.toLowerCase();

    // Priority filter
    const matchesPriority =
      priorityFilter === "all" ||
      task.priority.toLowerCase() === priorityFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Sort the filtered tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    switch (sortBy) {
      case "dueDate":
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      case "priority":
        const priorityValue = { high: 3, medium: 2, low: 1 };
        return (
          priorityValue[
            b.priority.toLowerCase() as keyof typeof priorityValue
          ] -
          priorityValue[a.priority.toLowerCase() as keyof typeof priorityValue]
        );
      case "status":
        return getEffectiveStatus(a).localeCompare(getEffectiveStatus(b));
      default:
        return 0;
    }
  });

  // Pagination
  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const currentTasks = sortedTasks.slice(indexOfFirstTask, indexOfLastTask);
  const totalPages = Math.ceil(sortedTasks.length / tasksPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <button
            type="button"
            onClick={() => setShowAddTaskModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg
              className="-ml-1 mr-2 h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            New Task
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Search */}
        <div className="mb-8 bg-white shadow rounded-lg overflow-hidden">
          <div className="p-4 sm:p-6">
            <div className="mb-4">
              <label
                htmlFor="search"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Search
              </label>
              <input
                type="text"
                name="search"
                id="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full rounded-md sm:text-sm border-gray-300"
                placeholder="Search tasks by title, description, project, or tags..."
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="all">All Statuses</option>
                  <option value="Completed">Completed</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Not Started">Not Started</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="priority"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Priority
                </label>
                <select
                  id="priority"
                  name="priority"
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="all">All Priorities</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="sort"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Sort By
                </label>
                <select
                  id="sort"
                  name="sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="dueDate">Due Date</option>
                  <option value="priority">Priority</option>
                  <option value="status">Status</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Tasks Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Task
                  </th>
                  <th
                    scope="col"
                    className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Project
                  </th>
                  <th
                    scope="col"
                    className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Assignee
                  </th>
                  <th
                    scope="col"
                    className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Due Date
                  </th>
                  <th
                    scope="col"
                    className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Priority
                  </th>
                  <th
                    scope="col"
                    className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentTasks.map((task) => {
                  const effectiveStatus = getEffectiveStatus(task);
                  return (
                    <tr key={task.id} className="hover:bg-gray-50">
                      <td className="px-4 sm:px-6 py-4 whitespace-normal sm:whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {task.title}
                            </div>
                            <div
                              className="text-sm text-gray-500 line-clamp-1"
                              title={task.description}
                            >
                              {task.description}
                            </div>
                            {/* Mobile-only project */}
                            <div className="mt-1 sm:hidden text-xs text-gray-500">
                              {task.project.title}
                            </div>
                            {/* Mobile-only assignee */}
                            <div className="mt-1 sm:hidden flex items-center">
                              <img
                                className="h-5 w-5 rounded-full mr-1"
                                src={task.assignee.avatar}
                                alt={task.assignee.name}
                              />
                              <span className="text-xs text-gray-500">
                                {task.assignee.name}
                              </span>
                            </div>
                            {/* Mobile-only due date */}
                            <div className="mt-1 sm:hidden text-xs text-gray-500">
                              Due: {new Date(task.dueDate).toLocaleDateString()}
                              {isTaskOverdue(task) && (
                                <span className="ml-1 text-xs text-red-500">
                                  (Overdue)
                                </span>
                              )}
                            </div>
                            {/* Mobile-only priority */}
                            <div className="mt-1 sm:hidden">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(
                                  task.priority
                                )}`}
                              >
                                {task.priority}
                              </span>
                            </div>
                            <div className="mt-1 hidden sm:flex flex-wrap gap-1">
                              {task.tags.map((tag: string) => (
                                <span
                                  key={tag}
                                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {task.project.title}
                        </div>
                      </td>
                      <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8">
                            <img
                              className="h-8 w-8 rounded-full"
                              src={task.assignee.avatar}
                              alt={task.assignee.name}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {task.assignee.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(task.dueDate).toLocaleDateString()}
                        </div>
                        {isTaskOverdue(task) && (
                          <div className="text-xs text-red-500">Overdue</div>
                        )}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            effectiveStatus
                          )}`}
                        >
                          {effectiveStatus}
                        </span>
                      </td>
                      <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(
                            task.priority
                          )}`}
                        >
                          {task.priority}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleTaskClick(task)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          View
                        </button>
                        <button
                          onClick={(e) => handleEditTask(task, e)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredTasks.length > 0 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex justify-between w-full flex-col sm:flex-row sm:items-center">
                <div className="mb-4 sm:mb-0">
                  <p className="text-sm text-gray-700">
                    Showing{" "}
                    <span className="font-medium">
                      {Math.min(
                        (currentPage - 1) * tasksPerPage + 1,
                        filteredTasks.length
                      )}
                    </span>{" "}
                    to{" "}
                    <span className="font-medium">
                      {Math.min(
                        currentPage * tasksPerPage,
                        filteredTasks.length
                      )}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium">{filteredTasks.length}</span>{" "}
                    results
                  </p>
                </div>
                <div className="flex justify-center">
                  <nav
                    className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px overflow-x-auto"
                    aria-label="Pagination"
                  >
                    {/* Previous Page Button */}
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === 1
                          ? "text-gray-300 cursor-not-allowed"
                          : "text-gray-500 hover:bg-gray-50 cursor-pointer"
                      }`}
                    >
                      <span className="sr-only">Previous</span>
                      <svg
                        className="h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>

                    {/* Page Numbers - Show fewer on mobile */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => {
                        // On mobile, only show current page and immediate neighbors
                        const isCurrentPage = currentPage === page;
                        const isAdjacentPage =
                          page === currentPage - 1 || page === currentPage + 1;
                        const isFirstOrLastPage =
                          page === 1 || page === totalPages;

                        // Show ellipses for breaks in sequence on mobile
                        if (
                          isMobile &&
                          !isCurrentPage &&
                          !isAdjacentPage &&
                          !isFirstOrLastPage
                        ) {
                          // Only show one ellipsis between groups
                          if (
                            page === currentPage - 2 ||
                            page === currentPage + 2
                          ) {
                            return (
                              <span
                                key={`ellipsis-${page}`}
                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                              >
                                ...
                              </span>
                            );
                          }
                          return null;
                        }

                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              currentPage === page
                                ? "z-10 bg-indigo-50 border-indigo-500 text-indigo-600"
                                : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                            }`}
                          >
                            {page}
                          </button>
                        );
                      }
                    )}

                    {/* Next Page Button */}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === totalPages
                          ? "text-gray-300 cursor-not-allowed"
                          : "text-gray-500 hover:bg-gray-50 cursor-pointer"
                      }`}
                    >
                      <span className="sr-only">Next</span>
                      <svg
                        className="h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* No results state */}
        {filteredTasks.length === 0 && (
          <div className="bg-white shadow overflow-hidden sm:rounded-md p-6 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No tasks found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filters to find what you're looking
              for.
            </p>
            <div className="mt-6">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg
                  className="-ml-1 mr-2 h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Create a New Task
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Task Detail Modal */}
      <Modal
        isOpen={showTaskDetailModal}
        onClose={() => setShowTaskDetailModal(false)}
        title={selectedTask?.title || "Task Details"}
        size="medium"
        actions={
          <>
            <button
              className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={() => setShowTaskDetailModal(false)}
            >
              Close
            </button>
            <button
              className="ml-3 px-4 py-2 bg-indigo-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={() => {
                // In a real app, this would save task changes
                setShowTaskDetailModal(false);
              }}
            >
              Save Changes
            </button>
          </>
        }
      >
        {selectedTask && (
          <div className="py-4 space-y-4">
            <div>
              <label
                htmlFor="task-detail-title"
                className="block text-sm font-medium text-gray-700"
              >
                Task Title
              </label>
              <input
                type="text"
                id="task-detail-title"
                defaultValue={selectedTask.title}
                className="mt-1 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label
                htmlFor="task-detail-description"
                className="block text-sm font-medium text-gray-700"
              >
                Description
              </label>
              <textarea
                id="task-detail-description"
                rows={3}
                defaultValue={selectedTask.description}
                className="mt-1 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="task-detail-assignee"
                  className="block text-sm font-medium text-gray-700"
                >
                  Assignee
                </label>
                <input
                  type="text"
                  id="task-detail-assignee"
                  defaultValue={selectedTask.assignee.name}
                  readOnly
                  className="mt-1 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md bg-gray-50"
                />
              </div>
              <div>
                <label
                  htmlFor="task-detail-due-date"
                  className="block text-sm font-medium text-gray-700"
                >
                  Due Date
                </label>
                <input
                  type="date"
                  id="task-detail-due-date"
                  defaultValue={selectedTask.dueDate}
                  className="mt-1 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="task-detail-priority"
                  className="block text-sm font-medium text-gray-700"
                >
                  Priority
                </label>
                <select
                  id="task-detail-priority"
                  defaultValue={selectedTask.priority}
                  className="mt-1 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md"
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="task-detail-status"
                  className="block text-sm font-medium text-gray-700"
                >
                  Status
                </label>
                <select
                  id="task-detail-status"
                  defaultValue={selectedTask.status}
                  onChange={(e) =>
                    handleStatusChange(selectedTask.id, e.target.value)
                  }
                  className="mt-1 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md"
                >
                  <option>Not Started</option>
                  <option>In Progress</option>
                  <option>Completed</option>
                </select>
              </div>
            </div>
            <div>
              <label
                htmlFor="task-detail-project"
                className="block text-sm font-medium text-gray-700"
              >
                Project
              </label>
              <input
                type="text"
                id="task-detail-project"
                defaultValue={selectedTask.project.title}
                readOnly
                className="mt-1 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Created At
              </label>
              <div className="mt-1 text-sm text-gray-500">
                {new Date(selectedTask.createdAt).toLocaleDateString()} at{" "}
                {new Date(selectedTask.createdAt).toLocaleTimeString()}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Task Modal */}
      <Modal
        isOpen={showEditTaskModal}
        onClose={() => setShowEditTaskModal(false)}
        title="Edit Task"
        size="medium"
        actions={
          <>
            <button
              className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={() => setShowEditTaskModal(false)}
            >
              Cancel
            </button>
            <button
              className="ml-3 px-4 py-2 bg-indigo-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={() => {
                // In a real app, would update the task
                setShowEditTaskModal(false);
              }}
            >
              Save Changes
            </button>
          </>
        }
      >
        {selectedTask && (
          <div className="py-4 space-y-4">
            <div>
              <label
                htmlFor="edit-task-title"
                className="block text-sm font-medium text-gray-700"
              >
                Task Title
              </label>
              <input
                type="text"
                id="edit-task-title"
                defaultValue={selectedTask.title}
                className="mt-1 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label
                htmlFor="edit-task-description"
                className="block text-sm font-medium text-gray-700"
              >
                Description
              </label>
              <textarea
                id="edit-task-description"
                rows={3}
                defaultValue={selectedTask.description}
                className="mt-1 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="edit-task-assignee"
                  className="block text-sm font-medium text-gray-700"
                >
                  Assignee
                </label>
                <select
                  id="edit-task-assignee"
                  defaultValue={selectedTask.assignee.name}
                  className="mt-1 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md"
                >
                  <option value="Jason Chen">Jason Chen</option>
                  <option value="Sarah Johnson">Sarah Johnson</option>
                  <option value="Michael Brown">Michael Brown</option>
                  <option value="Emily Davis">Emily Davis</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="edit-task-due-date"
                  className="block text-sm font-medium text-gray-700"
                >
                  Due Date
                </label>
                <input
                  type="date"
                  id="edit-task-due-date"
                  defaultValue={selectedTask.dueDate}
                  className="mt-1 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="edit-task-priority"
                  className="block text-sm font-medium text-gray-700"
                >
                  Priority
                </label>
                <select
                  id="edit-task-priority"
                  defaultValue={selectedTask.priority}
                  className="mt-1 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md"
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="edit-task-status"
                  className="block text-sm font-medium text-gray-700"
                >
                  Status
                </label>
                <select
                  id="edit-task-status"
                  defaultValue={selectedTask.status}
                  onChange={(e) =>
                    handleStatusChange(selectedTask.id, e.target.value)
                  }
                  className="mt-1 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md"
                >
                  <option>Not Started</option>
                  <option>In Progress</option>
                  <option>Completed</option>
                </select>
              </div>
            </div>
            <div>
              <label
                htmlFor="edit-task-tags"
                className="block text-sm font-medium text-gray-700"
              >
                Tags
              </label>
              <input
                type="text"
                id="edit-task-tags"
                defaultValue={selectedTask.tags.join(", ")}
                className="mt-1 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md"
                placeholder="Comma-separated tags"
              />
            </div>
          </div>
        )}
      </Modal>

      {/* Add Task Modal */}
      <Modal
        isOpen={showAddTaskModal}
        onClose={() => setShowAddTaskModal(false)}
        title="Add New Task"
        size="medium"
        actions={
          <>
            <button
              className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={() => setShowAddTaskModal(false)}
            >
              Cancel
            </button>
            <button
              className="ml-3 px-4 py-2 bg-indigo-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={() => {
                // In a real app, would add the task to the list
                setShowAddTaskModal(false);
              }}
            >
              Add Task
            </button>
          </>
        }
      >
        <div className="py-4 space-y-4">
          <div>
            <label
              htmlFor="new-task-title"
              className="block text-sm font-medium text-gray-700"
            >
              Task Title
            </label>
            <input
              type="text"
              id="new-task-title"
              className="mt-1 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label
              htmlFor="new-task-description"
              className="block text-sm font-medium text-gray-700"
            >
              Description
            </label>
            <textarea
              id="new-task-description"
              rows={3}
              className="mt-1 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="new-task-assignee"
                className="block text-sm font-medium text-gray-700"
              >
                Assignee
              </label>
              <select
                id="new-task-assignee"
                className="mt-1 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md"
              >
                <option value="">Select Assignee</option>
                <option value="Jason Chen">Jason Chen</option>
                <option value="Sarah Johnson">Sarah Johnson</option>
                <option value="Michael Brown">Michael Brown</option>
                <option value="Emily Davis">Emily Davis</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="new-task-due-date"
                className="block text-sm font-medium text-gray-700"
              >
                Due Date
              </label>
              <input
                type="date"
                id="new-task-due-date"
                className="mt-1 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="new-task-priority"
                className="block text-sm font-medium text-gray-700"
              >
                Priority
              </label>
              <select
                id="new-task-priority"
                className="mt-1 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md"
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="new-task-status"
                className="block text-sm font-medium text-gray-700"
              >
                Status
              </label>
              <select
                id="new-task-status"
                className="mt-1 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md"
              >
                <option>Not Started</option>
                <option>In Progress</option>
                <option>Completed</option>
              </select>
            </div>
          </div>
          <div>
            <label
              htmlFor="new-task-project"
              className="block text-sm font-medium text-gray-700"
            >
              Project
            </label>
            <select
              id="new-task-project"
              className="mt-1 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md"
            >
              <option value="">Select Project</option>
              <option value="1">Website Redesign</option>
              <option value="2">Mobile App Development</option>
              <option value="3">CRM Integration</option>
              <option value="4">Marketing Campaign</option>
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Tasks;
