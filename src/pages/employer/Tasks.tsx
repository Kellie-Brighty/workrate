import React, { useState, useEffect } from "react";
import Modal from "../../components/Modal";
import {
  onTasksUpdate,
  updateTask,
  type TaskData,
  createTask,
  getProjects,
  getEmployees,
  deleteTask,
  type ProjectData,
} from "../../services/firebase";
import { useAuth } from "../../contexts/AuthContext";

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

// Status color mapping
const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "completed":
      return "bg-green-100 text-green-800";
    case "in progress":
      return "bg-blue-100 text-blue-800";
    case "not started":
      return "bg-yellow-50 text-yellow-700";
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

type DisplayTask = {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: string;
  project: { id: string; name: string };
  assignedBy: { id: string; name: string; avatar: string };
  checklist: any[];
  attachments: any[];
  timeEstimate: string;
  timeSpent: string;
  dueDateRenegotiationStatus?: "pending" | "approved" | "rejected";
  tags?: string[];
  assignedTo?: string;
  assigneeName?: string;
  assigneeInfo?: any;
  projectName?: string;
  projectInfo?: any;
  createdAt?: any;
};

const Tasks: React.FC = () => {
  const isMobile = useIsMobile();
  const { userData } = useAuth();

  // Add state for tasks and loading
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<any[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  // Add new states for modals and filters
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showTaskDetailModal, setShowTaskDetailModal] = useState(false);
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<DisplayTask | null>(null);

  // Search/filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [sortBy, setSortBy] = useState("dueDate");
  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 10;

  // Set up Firebase real-time listener
  useEffect(() => {
    setLoading(true);
    // Only set up the listener if projects and employees data are loaded
    if (projects.length > 0 && employees.length > 0) {
      // Listen for tasks for the employer's own projects only
      const projectIds = projects.map((p) => p.id);
      const unsubscribe = onTasksUpdate((updatedTasks) => {
        const processedTasks = updatedTasks.map((task) => {
          const project = projects.find((p) => p.id === task.projectId) || null;
          const assignee =
            employees.find((e) => e.id === task.assignedTo) || null;
          return {
            ...task,
            projectName: project?.name || task.projectName || "Unknown Project",
            projectInfo: project || {
              id: task.projectId,
              name: project?.name || "Unknown Project",
            },
            assigneeName: assignee?.name || task.assigneeName || "Unassigned",
            assigneeInfo:
              assignee || (task.assignedTo ? { id: task.assignedTo } : null),
          };
        });
        setTasks(processedTasks);
        setLoading(false);
      }, projectIds);
      return () => {
        unsubscribe();
      };
    }
  }, [projects, employees]);

  // Fetch projects for the dropdown
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoadingProjects(true);
        const projectsList = (await getProjects()) as (ProjectData & {
          id: string;
        })[];
        // Only include projects created by this employer
        const employerProjects = userData?.id
          ? projectsList.filter((p) => p.createdBy === userData.id)
          : [];
        setProjects(employerProjects);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoadingProjects(false);
      }
    };

    fetchProjects();
  }, [userData]);

  // Fetch employees for the dropdown
  useEffect(() => {
    const fetchEmployees = async () => {
      if (!userData) return;

      try {
        setLoadingEmployees(true);
        const employeesList = await getEmployees(userData.id);
        setEmployees(employeesList);
      } catch (error) {
        console.error("Error fetching employees:", error);
      } finally {
        setLoadingEmployees(false);
      }
    };

    fetchEmployees();
  }, [userData]);

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
  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      // Update in Firebase
      await updateTask(taskId, {
        status: newStatus as TaskData["status"],
      });

      // Local state update is now handled by the onSnapshot listener

      // If task detail modal is open, update selected task
      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask({ ...selectedTask, status: newStatus });
      }
    } catch (error) {
      console.error("Error updating task status:", error);
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

  const handleDeleteTask = async () => {
    if (!taskToDelete) return;

    try {
      await deleteTask(taskToDelete);
      setShowDeleteConfirmModal(false);
      setTaskToDelete(null);
      setShowTaskDetailModal(false);
    } catch (error) {
      console.error("Error deleting task:", error);
    }
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
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
              </div>
            ) : (
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

                    // Get assignee and project info or provide defaults
                    const assigneeName =
                      task.assigneeName ||
                      task.assigneeInfo?.name ||
                      "Unassigned";
                    const assigneeAvatar =
                      task.assigneeInfo?.avatar ||
                      "https://randomuser.me/api/portraits/lego/1.jpg";
                    const projectTitle =
                      task.projectName ||
                      task.projectInfo?.name ||
                      "No Project";

                    return (
                      <tr
                        key={task.id}
                        className="hover:bg-gray-50"
                        onClick={() => handleTaskClick(task)}
                      >
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
                                {projectTitle}
                              </div>
                              {/* Mobile-only assignee */}
                              <div className="mt-1 sm:hidden flex items-center">
                                <img
                                  className="h-5 w-5 rounded-full mr-1"
                                  src={assigneeAvatar}
                                  alt={assigneeName}
                                />
                                <span className="text-xs text-gray-500">
                                  {assigneeName}
                                </span>
                              </div>
                              {/* Mobile-only due date */}
                              <div className="mt-1 sm:hidden text-xs text-gray-500">
                                Due{" "}
                                {new Date(task.dueDate).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {projectTitle}
                          </div>
                        </td>
                        <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8">
                              <img
                                className="h-8 w-8 rounded-full"
                                src={assigneeAvatar}
                                alt={assigneeName}
                              />
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                {assigneeName}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(task.dueDate).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <select
                            value={effectiveStatus}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleStatusChange(task.id, e.target.value);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className={`text-xs inline-flex py-1 px-2 rounded-full ${getStatusColor(
                              effectiveStatus
                            )} border-0 focus:ring-2 focus:ring-indigo-500`}
                          >
                            <option value="Not Started">Not Started</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </td>
                        <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(
                              task.priority
                            )}`}
                          >
                            {task.priority}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={(e) => handleEditTask(task, e)}
                            className="text-indigo-600 hover:text-indigo-900 transition-colors"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
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
              className="px-4 py-2 bg-red-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              onClick={() => {
                if (selectedTask) {
                  setTaskToDelete(selectedTask.id);
                  setShowDeleteConfirmModal(true);
                }
              }}
            >
              Delete Task
            </button>
            <button
              className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={() => setShowTaskDetailModal(false)}
            >
              Close
            </button>
            <button
              className="ml-3 px-4 py-2 bg-indigo-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={async () => {
                if (!selectedTask) return;

                try {
                  // Get values from form
                  const titleElement = document.getElementById(
                    "task-detail-title"
                  ) as HTMLInputElement;
                  const descriptionElement = document.getElementById(
                    "task-detail-description"
                  ) as HTMLTextAreaElement;
                  const priorityElement = document.getElementById(
                    "task-detail-priority"
                  ) as HTMLSelectElement;
                  const statusElement = document.getElementById(
                    "task-detail-status"
                  ) as HTMLSelectElement;
                  const dueDateElement = document.getElementById(
                    "task-detail-due-date"
                  ) as HTMLInputElement;

                  // Update the task in Firebase
                  await updateTask(selectedTask.id, {
                    title: titleElement.value,
                    description: descriptionElement.value,
                    priority: priorityElement.value as TaskData["priority"],
                    status: statusElement.value as TaskData["status"],
                    dueDate: dueDateElement.value,
                  });

                  // Close the modal
                  setShowTaskDetailModal(false);
                } catch (error) {
                  console.error("Error updating task:", error);
                }
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
                  defaultValue={
                    selectedTask.assigneeName ||
                    selectedTask.assigneeInfo?.name ||
                    "Unassigned"
                  }
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
                defaultValue={
                  selectedTask.projectName ||
                  selectedTask.projectInfo?.name ||
                  "No Project"
                }
                readOnly
                className="mt-1 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md bg-gray-50"
              />
            </div>
            {selectedTask.createdAt && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Created At
                </label>
                <div className="mt-1 text-sm text-gray-500">
                  {new Date(
                    selectedTask.createdAt.seconds * 1000
                  ).toLocaleDateString()}{" "}
                  at{" "}
                  {new Date(
                    selectedTask.createdAt.seconds * 1000
                  ).toLocaleTimeString()}
                </div>
              </div>
            )}
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
              onClick={async () => {
                if (!selectedTask) return;

                try {
                  // Get values from form
                  const titleElement = document.getElementById(
                    "edit-task-title"
                  ) as HTMLInputElement;
                  const descriptionElement = document.getElementById(
                    "edit-task-description"
                  ) as HTMLTextAreaElement;
                  const priorityElement = document.getElementById(
                    "edit-task-priority"
                  ) as HTMLSelectElement;
                  const statusElement = document.getElementById(
                    "edit-task-status"
                  ) as HTMLSelectElement;
                  const dueDateElement = document.getElementById(
                    "edit-task-due-date"
                  ) as HTMLInputElement;
                  const assigneeElement = document.getElementById(
                    "edit-task-assignee"
                  ) as HTMLSelectElement;

                  // Update the task in Firebase
                  await updateTask(selectedTask.id, {
                    title: titleElement.value,
                    description: descriptionElement.value,
                    priority: priorityElement.value as TaskData["priority"],
                    status: statusElement.value as TaskData["status"],
                    dueDate: dueDateElement.value,
                    assignedTo: assigneeElement.value || undefined,
                  });

                  // Close the modal
                  setShowEditTaskModal(false);
                } catch (error) {
                  console.error("Error updating task:", error);
                }
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
                  defaultValue={selectedTask.assignedTo || ""}
                  className="mt-1 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md"
                >
                  <option value="">Unassigned</option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name}
                    </option>
                  ))}
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
                defaultValue={selectedTask.tags?.join(", ") || ""}
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
              onClick={async () => {
                if (!userData) return;

                try {
                  // Get values from form
                  const titleElement = document.getElementById(
                    "new-task-title"
                  ) as HTMLInputElement;
                  const descriptionElement = document.getElementById(
                    "new-task-description"
                  ) as HTMLTextAreaElement;
                  const priorityElement = document.getElementById(
                    "new-task-priority"
                  ) as HTMLSelectElement;
                  const statusElement = document.getElementById(
                    "new-task-status"
                  ) as HTMLSelectElement;
                  const dueDateElement = document.getElementById(
                    "new-task-due-date"
                  ) as HTMLInputElement;
                  const projectElement = document.getElementById(
                    "new-task-project"
                  ) as HTMLSelectElement;

                  // Create new task in Firebase
                  await createTask({
                    title: titleElement.value,
                    description: descriptionElement.value,
                    priority: priorityElement.value as TaskData["priority"],
                    status: statusElement.value as TaskData["status"],
                    dueDate: dueDateElement.value,
                    projectId: projectElement.value,
                    createdBy: userData.id,
                  });

                  // Close the modal
                  setShowAddTaskModal(false);
                } catch (error) {
                  console.error("Error adding new task:", error);
                }
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
                {loadingEmployees ? (
                  <option value="" disabled>
                    Loading employees...
                  </option>
                ) : (
                  employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name}
                    </option>
                  ))
                )}
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
              {loadingProjects ? (
                <option value="" disabled>
                  Loading projects...
                </option>
              ) : (
                projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirmModal}
        onClose={() => setShowDeleteConfirmModal(false)}
        title="Delete Task"
        size="small"
        actions={
          <>
            <button
              className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={() => setShowDeleteConfirmModal(false)}
            >
              Cancel
            </button>
            <button
              className="ml-3 px-4 py-2 bg-red-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              onClick={handleDeleteTask}
            >
              Delete
            </button>
          </>
        }
      >
        <div className="py-4">
          <p className="text-sm text-gray-500">
            Are you sure you want to delete this task? This action cannot be
            undone.
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default Tasks;
