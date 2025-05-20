import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  getProjects,
  deleteProject,
  recalculateAllProjectsProgress,
} from "../../services/firebase";
import { useAuth } from "../../contexts/AuthContext";
import {
  useSuccessNotification,
  useErrorNotification,
} from "../../contexts/NotificationContext";

// Get status color
const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "completed":
      return "bg-green-100 text-green-800";
    case "in progress":
      return "bg-blue-100 text-blue-800";
    case "almost complete":
      return "bg-teal-100 text-teal-800";
    case "just started":
      return "bg-yellow-100 text-yellow-800";
    case "not started":
      return "bg-yellow-50 text-yellow-700";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// Get priority color
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

type ViewMode = "grid" | "list";

const Projects: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { userData } = useAuth();
  const showSuccess = useSuccessNotification();
  const showError = useErrorNotification();

  // Fetch projects on component mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const projectsData = await getProjects();

        // If current user is an employer, filter to only show their projects
        const filteredProjects =
          userData?.userType === "employer"
            ? projectsData.filter(
                (project: any) => project.createdBy === userData.id
              )
            : projectsData;

        setProjects(filteredProjects);
      } catch (error) {
        console.error("Error fetching projects:", error);
        showError("Error", "Failed to load projects");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [userData?.id]);

  // Add effect to recalculate project progress when the component loads
  useEffect(() => {
    const updateProjectsProgress = async () => {
      if (!userData?.id || userData?.userType !== "employer") return;

      try {
        await recalculateAllProjectsProgress(userData.id);
        console.log("Updated all projects progress");
      } catch (error) {
        console.error("Error updating projects progress:", error);
      }
    };

    updateProjectsProgress();
  }, [userData?.id, userData?.userType]);

  // Extract unique categories for filter from real data
  const categories =
    projects.length > 0
      ? [...new Set(projects.map((project) => project.category))]
      : [];

  // Extract unique statuses for filter from real data
  const statuses =
    projects.length > 0
      ? [...new Set(projects.map((project) => project.status))]
      : [];

  // Filter projects based on search and filters using real data
  const filteredProjects = projects.filter((project) => {
    // Search filter
    const matchesSearch =
      searchQuery === "" ||
      project.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase());

    // Category filter
    const matchesCategory =
      categoryFilter === "" || project.category === categoryFilter;

    // Status filter
    const matchesStatus =
      statusFilter === "" || project.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Handle edit button click
  const handleEditClick = (project: any) => {
    setSelectedProject(project);
    setShowEditModal(true);
  };

  // Handle delete button click
  const handleDeleteClick = (project: any) => {
    setSelectedProject(project);
    setShowDeleteModal(true);
  };

  // Handle project deletion
  const handleDeleteConfirm = async () => {
    if (!selectedProject?.id) return;

    try {
      await deleteProject(selectedProject.id);

      // Update local state to remove the deleted project
      setProjects(projects.filter((p) => p.id !== selectedProject.id));

      showSuccess(
        "Project Deleted",
        "The project has been deleted successfully"
      );
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Error deleting project:", error);
      showError("Error", "Failed to delete project");
    }
  };

  // Calculate team size and task counts
  const getProjectStats = (project: any) => {
    const teamSize = project.team?.length || 0;

    // For now, we'll use placeholder values for tasks since they might be in a separate collection
    const taskStats = {
      total: 0,
      completed: 0,
    };

    return {
      teamSize,
      tasks: taskStats,
    };
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <Link
            to="/employer/create-project"
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
            New Project
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading state */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <>
            {/* Filters and Controls - Only show if there are projects */}
            {projects.length > 0 && (
              <div className="mb-8 bg-white shadow rounded-lg overflow-hidden">
                <div className="p-4 sm:p-6 md:flex md:items-center md:justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <div className="relative flex-grow focus-within:z-10">
                        <input
                          type="text"
                          name="search"
                          id="search"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="focus:ring-indigo-500 focus:border-indigo-500 block w-full rounded-md pl-4 sm:text-sm border-gray-300"
                          placeholder="Search projects..."
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
                    <div>
                      <select
                        id="category"
                        name="category"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                      >
                        <option value="">All Categories</option>
                        {categories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
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
                    <div className="flex border border-gray-300 rounded-md">
                      <button
                        type="button"
                        onClick={() => setViewMode("grid")}
                        className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-l-md ${
                          viewMode === "grid"
                            ? "bg-indigo-600 text-white"
                            : "bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <svg
                          className="h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                          />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => setViewMode("list")}
                        className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-r-md ${
                          viewMode === "list"
                            ? "bg-indigo-600 text-white"
                            : "bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <svg
                          className="h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 6h16M4 10h16M4 14h16M4 18h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Projects Display - with real data */}
            {projects.length > 0 ? (
              viewMode === "grid" ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredProjects.map((project) => {
                    const stats = getProjectStats(project);
                    return (
                      <div
                        key={project.id}
                        className="bg-white shadow rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-300"
                      >
                        <div className="p-5 border-b border-gray-200">
                          <div className="flex justify-between items-center mb-2">
                            <h3
                              className="text-lg font-medium text-gray-900 truncate"
                              title={project.name}
                            >
                              {project.name}
                            </h3>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(
                                project.priority
                              )}`}
                            >
                              {project.priority}
                            </span>
                          </div>
                          <p
                            className="text-sm text-gray-500 line-clamp-2 mb-3"
                            title={project.description}
                          >
                            {project.description}
                          </p>
                          <div className="flex justify-between items-end">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                project.status
                              )}`}
                            >
                              {project.status}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(project.startDate).toLocaleDateString()}{" "}
                              - {new Date(project.endDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="px-5 py-3 bg-gray-50">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <svg
                                className="h-5 w-5 text-gray-400 mr-1"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                />
                              </svg>
                              <span className="text-sm text-gray-500">
                                {stats.teamSize} members
                              </span>
                            </div>
                            <div className="flex items-center">
                              <svg
                                className="h-5 w-5 text-gray-400 mr-1"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                />
                              </svg>
                              <span className="text-sm text-gray-500">
                                {stats.tasks.completed}/{stats.tasks.total}{" "}
                                tasks
                              </span>
                            </div>
                          </div>
                          <div className="mt-2">
                            <div className="relative pt-1">
                              <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                                <div
                                  style={{ width: `${project.progress}%` }}
                                  className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                                    project.progress < 30
                                      ? "bg-red-500"
                                      : project.progress < 70
                                      ? "bg-yellow-500"
                                      : "bg-green-500"
                                  }`}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="px-5 py-3 flex justify-between border-t border-gray-200">
                          <Link
                            to={`/employer/projects/${project.id}`}
                            className="text-sm font-medium text-indigo-600 hover:text-indigo-900"
                          >
                            View Details
                          </Link>
                          <div className="flex space-x-2">
                            <button
                              type="button"
                              className="text-sm text-gray-500 hover:text-gray-700"
                              onClick={() => handleEditClick(project)}
                            >
                              <svg
                                className="h-5 w-5"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 0L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                            </button>
                            <button
                              type="button"
                              className="text-sm text-gray-500 hover:text-gray-700"
                              onClick={() => handleDeleteClick(project)}
                            >
                              <svg
                                className="h-5 w-5"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                  <ul className="divide-y divide-gray-200">
                    {filteredProjects.map((project) => {
                      getProjectStats(project);
                      return (
                        <li key={project.id}>
                          <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <p className="text-sm font-medium text-indigo-600 truncate">
                                  {project.name}
                                </p>
                                <div className="ml-2 flex-shrink-0 flex">
                                  <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                      project.status
                                    )}`}
                                  >
                                    {project.status}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-2 flex-shrink-0 flex">
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(
                                    project.priority
                                  )}`}
                                >
                                  {project.priority}
                                </span>
                              </div>
                            </div>
                            <div className="mt-2 sm:flex sm:justify-between">
                              <div className="sm:flex">
                                <p
                                  className="flex items-center text-sm text-gray-500 line-clamp-1 mr-6"
                                  title={project.description}
                                >
                                  {project.description}
                                </p>
                                <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                  <svg
                                    className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                  </svg>
                                  {new Date(
                                    project.startDate
                                  ).toLocaleDateString()}{" "}
                                  -{" "}
                                  {new Date(
                                    project.endDate
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                <div className="w-32 h-2 bg-gray-200 rounded-full mr-2">
                                  <div
                                    className={`h-full rounded-full ${
                                      project.progress < 30
                                        ? "bg-red-500"
                                        : project.progress < 70
                                        ? "bg-yellow-500"
                                        : "bg-green-500"
                                    }`}
                                    style={{ width: `${project.progress}%` }}
                                  ></div>
                                </div>
                                <span>{project.progress}%</span>
                              </div>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )
            ) : (
              <div className="bg-white shadow overflow-hidden sm:rounded-md p-12 text-center">
                <svg
                  className="mx-auto h-16 w-16 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  No projects yet
                </h3>
                <p className="mt-2 text-base text-gray-500">
                  Get started by creating your first project
                </p>
                <div className="mt-6">
                  <Link
                    to="/employer/create-project"
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
                    Create Project
                  </Link>
                </div>
              </div>
            )}

            {/* No filtered results state - keep as is */}
            {projects.length > 0 && filteredProjects.length === 0 && (
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
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No projects found
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Try adjusting your search or filter to find what you're
                  looking for.
                </p>
                <div className="mt-6">
                  <Link
                    to="/employer/create-project"
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
                    New Project
                  </Link>
                </div>
              </div>
            )}
          </>
        )}

        {/* Edit Project Modal - Keep as is, will implement functionality later */}
        {showEditModal && selectedProject && (
          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div
                className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                aria-hidden="true"
              ></div>
              <span
                className="hidden sm:inline-block sm:align-middle sm:h-screen"
                aria-hidden="true"
              >
                &#8203;
              </span>
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Edit Project
                      </h3>
                      <div className="mt-4 space-y-4">
                        <div>
                          <label
                            htmlFor="edit-title"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Project Title
                          </label>
                          <input
                            type="text"
                            id="edit-title"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            defaultValue={selectedProject.title}
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="edit-description"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Description
                          </label>
                          <textarea
                            id="edit-description"
                            rows={3}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            defaultValue={selectedProject.description}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label
                              htmlFor="edit-status"
                              className="block text-sm font-medium text-gray-700"
                            >
                              Status
                            </label>
                            <select
                              id="edit-status"
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              defaultValue={selectedProject.status}
                            >
                              {statuses.map((status) => (
                                <option key={status} value={status}>
                                  {status}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label
                              htmlFor="edit-priority"
                              className="block text-sm font-medium text-gray-700"
                            >
                              Priority
                            </label>
                            <select
                              id="edit-priority"
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              defaultValue={selectedProject.priority}
                            >
                              <option value="High">High</option>
                              <option value="Medium">Medium</option>
                              <option value="Low">Low</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => setShowEditModal(false)}
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => setShowEditModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal - updated with real delete functionality */}
        {showDeleteModal && selectedProject && (
          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div
                className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                aria-hidden="true"
              ></div>
              <span
                className="hidden sm:inline-block sm:align-middle sm:h-screen"
                aria-hidden="true"
              >
                &#8203;
              </span>
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                      <svg
                        className="h-6 w-6 text-red-600"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Delete Project
                      </h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Are you sure you want to delete the project "
                          {selectedProject.name}"? This action cannot be undone.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={handleDeleteConfirm}
                  >
                    Delete
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => setShowDeleteModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Projects;
