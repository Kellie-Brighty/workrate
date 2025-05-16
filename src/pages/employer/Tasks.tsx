import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [projectFilter, setProjectFilter] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const isMobile = useIsMobile();

  // Extract unique values for filters
  const statuses = ["Completed", "In Progress", "Not Started", "Overdue"];
  const priorities = ["High", "Medium", "Low"];
  const projects = [...new Set(tasksData.map((task) => task.project.title))];
  const assignees = [...new Set(tasksData.map((task) => task.assignee.name))];

  // Filter tasks based on search and filters
  const filteredTasks = tasksData.filter((task) => {
    // Apply effective status (including marking overdue tasks)
    const effectiveStatus = getEffectiveStatus(task);

    // Search filter
    const matchesSearch =
      searchQuery === "" ||
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.tags.some((tag: string) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );

    // Status filter
    const matchesStatus =
      statusFilter === "" || effectiveStatus === statusFilter;

    // Priority filter
    const matchesPriority =
      priorityFilter === "" || task.priority === priorityFilter;

    // Project filter
    const matchesProject =
      projectFilter === "" || task.project.title === projectFilter;

    // Assignee filter
    const matchesAssignee =
      assigneeFilter === "" || task.assignee.name === assigneeFilter;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesPriority &&
      matchesProject &&
      matchesAssignee
    );
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);
  const paginatedTasks = filteredTasks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [
    searchQuery,
    statusFilter,
    priorityFilter,
    projectFilter,
    assigneeFilter,
  ]);

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg
              className="mr-2 h-5 w-5"
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
                  <option value="">All Statuses</option>
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
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
                  <option value="">All Priorities</option>
                  {priorities.map((priority) => (
                    <option key={priority} value={priority}>
                      {priority}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="project"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Project
                </label>
                <select
                  id="project"
                  name="project"
                  value={projectFilter}
                  onChange={(e) => setProjectFilter(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="">All Projects</option>
                  {projects.map((project) => (
                    <option key={project} value={project}>
                      {project}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="assignee"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Assignee
                </label>
                <select
                  id="assignee"
                  name="assignee"
                  value={assigneeFilter}
                  onChange={(e) => setAssigneeFilter(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="">All Assignees</option>
                  {assignees.map((assignee) => (
                    <option key={assignee} value={assignee}>
                      {assignee}
                    </option>
                  ))}
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
                {paginatedTasks.map((task) => {
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
                        <Link
                          to={`/employer/tasks/${task.id}`}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          View
                        </Link>
                        <button className="text-indigo-600 hover:text-indigo-900 mr-3">
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
                        (currentPage - 1) * itemsPerPage + 1,
                        filteredTasks.length
                      )}
                    </span>{" "}
                    to{" "}
                    <span className="font-medium">
                      {Math.min(
                        currentPage * itemsPerPage,
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
    </div>
  );
};

export default Tasks;
