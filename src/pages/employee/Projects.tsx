import { useState } from "react";
import { Link } from "react-router-dom";
import Modal from "../../components/Modal";

// Mock project data
const MOCK_PROJECTS = [
  {
    id: 1,
    name: "Website Redesign",
    description:
      "Redesign the company website with improved UI/UX and responsive design",
    client: "Acme Corporation",
    status: "In Progress",
    completion: 65,
    startDate: "2023-10-01",
    deadline: "2023-12-15",
    manager: {
      id: 1,
      name: "John Manager",
      avatar: "https://randomuser.me/api/portraits/men/1.jpg",
    },
    team: [
      {
        id: 1,
        name: "Jane Developer",
        avatar: "https://randomuser.me/api/portraits/women/1.jpg",
      },
      {
        id: 2,
        name: "Bob Designer",
        avatar: "https://randomuser.me/api/portraits/men/2.jpg",
      },
      {
        id: 3,
        name: "Alice Content",
        avatar: "https://randomuser.me/api/portraits/women/3.jpg",
      },
      {
        id: 4,
        name: "Current User",
        avatar: "https://randomuser.me/api/portraits/women/4.jpg",
      },
    ],
    tasks: [
      {
        id: 1,
        title: "Design new landing page mockups",
        status: "In Progress",
        assigned: true,
      },
      {
        id: 2,
        title: "Implement responsive navigation",
        status: "To Do",
        assigned: true,
      },
      {
        id: 3,
        title: "Create product showcase section",
        status: "Completed",
        assigned: true,
      },
      {
        id: 4,
        title: "Optimize images and assets",
        status: "To Do",
        assigned: false,
      },
    ],
    recentUpdates: [
      {
        id: 1,
        user: "John Manager",
        action: "updated the project deadline",
        time: "2 days ago",
      },
      {
        id: 2,
        user: "Alice Content",
        action: "completed the About Us page content",
        time: "3 days ago",
      },
    ],
  },
  {
    id: 2,
    name: "User Authentication",
    description:
      "Implement secure authentication system with social login options",
    client: "Internal",
    status: "In Progress",
    completion: 40,
    startDate: "2023-10-15",
    deadline: "2023-11-30",
    manager: {
      id: 1,
      name: "John Manager",
      avatar: "https://randomuser.me/api/portraits/men/1.jpg",
    },
    team: [
      {
        id: 5,
        name: "Charlie Backend",
        avatar: "https://randomuser.me/api/portraits/men/5.jpg",
      },
      {
        id: 6,
        name: "Diana Security",
        avatar: "https://randomuser.me/api/portraits/women/6.jpg",
      },
      {
        id: 4,
        name: "Current User",
        avatar: "https://randomuser.me/api/portraits/women/4.jpg",
      },
    ],
    tasks: [
      {
        id: 5,
        title: "Implement authentication API",
        status: "To Do",
        assigned: true,
      },
      {
        id: 6,
        title: "Create login/signup forms",
        status: "In Progress",
        assigned: true,
      },
      {
        id: 7,
        title: "Integrate with Google OAuth",
        status: "To Do",
        assigned: false,
      },
      {
        id: 8,
        title: "Update user documentation",
        status: "Completed",
        assigned: true,
      },
    ],
    recentUpdates: [
      {
        id: 3,
        user: "Diana Security",
        action: "added password reset functionality",
        time: "1 day ago",
      },
      {
        id: 4,
        user: "Charlie Backend",
        action: "updated API documentation",
        time: "4 days ago",
      },
    ],
  },
  {
    id: 3,
    name: "E-commerce Platform",
    description:
      "Build a new e-commerce platform with catalog, cart, and checkout functionality",
    client: "Fashion Outlet",
    status: "At Risk",
    completion: 25,
    startDate: "2023-09-15",
    deadline: "2023-12-01",
    manager: {
      id: 2,
      name: "Sarah Director",
      avatar: "https://randomuser.me/api/portraits/women/2.jpg",
    },
    team: [
      {
        id: 7,
        name: "Frank Frontend",
        avatar: "https://randomuser.me/api/portraits/men/7.jpg",
      },
      {
        id: 8,
        name: "Grace Data",
        avatar: "https://randomuser.me/api/portraits/women/8.jpg",
      },
      {
        id: 4,
        name: "Current User",
        avatar: "https://randomuser.me/api/portraits/women/4.jpg",
      },
      {
        id: 9,
        name: "Henry QA",
        avatar: "https://randomuser.me/api/portraits/men/9.jpg",
      },
    ],
    tasks: [
      {
        id: 9,
        title: "Implement product search",
        status: "In Progress",
        assigned: false,
      },
      {
        id: 10,
        title: "Create cart functionality",
        status: "In Progress",
        assigned: false,
      },
      {
        id: 11,
        title: "Fix checkout page bugs",
        status: "To Do",
        assigned: true,
      },
      {
        id: 12,
        title: "Integrate payment processor",
        status: "To Do",
        assigned: false,
      },
    ],
    recentUpdates: [
      {
        id: 5,
        user: "Sarah Director",
        action: "raised risk level due to payment integration issues",
        time: "12 hours ago",
      },
      {
        id: 6,
        user: "Henry QA",
        action: "reported bugs in the checkout process",
        time: "2 days ago",
      },
    ],
  },
  {
    id: 4,
    name: "Market Research",
    description:
      "Conduct competitor analysis and identify market opportunities",
    client: "Internal",
    status: "On Track",
    completion: 50,
    startDate: "2023-11-01",
    deadline: "2023-12-15",
    manager: {
      id: 2,
      name: "Sarah Director",
      avatar: "https://randomuser.me/api/portraits/women/2.jpg",
    },
    team: [
      {
        id: 10,
        name: "Irene Analyst",
        avatar: "https://randomuser.me/api/portraits/women/10.jpg",
      },
      {
        id: 4,
        name: "Current User",
        avatar: "https://randomuser.me/api/portraits/women/4.jpg",
      },
      {
        id: 11,
        name: "Jack Marketing",
        avatar: "https://randomuser.me/api/portraits/men/11.jpg",
      },
    ],
    tasks: [
      {
        id: 13,
        title: "Research competitor features",
        status: "In Progress",
        assigned: true,
      },
      {
        id: 14,
        title: "Analyze market trends",
        status: "To Do",
        assigned: false,
      },
      {
        id: 15,
        title: "Prepare presentation",
        status: "To Do",
        assigned: true,
      },
    ],
    recentUpdates: [
      {
        id: 7,
        user: "Jack Marketing",
        action: "added new competitors to the analysis",
        time: "3 days ago",
      },
      {
        id: 8,
        user: "Sarah Director",
        action: "scheduled the final presentation",
        time: "5 days ago",
      },
    ],
  },
];

const Projects = () => {
  const [projects, setProjects] = useState(MOCK_PROJECTS);
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [showProjectDetails, setShowProjectDetails] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal states for various project actions
  const [showStatusChangeModal, setShowStatusChangeModal] = useState(false);
  const [statusChangeInfo, setStatusChangeInfo] = useState<{
    projectId: number;
    projectName: string;
    currentStatus: string;
    newStatus: string;
  } | null>(null);
  const [showLeaveProjectModal, setShowLeaveProjectModal] = useState(false);
  const [projectToLeave, setProjectToLeave] = useState<any | null>(null);

  // Apply filters to projects
  const filteredProjects = projects.filter((project) => {
    // Status filter
    if (statusFilter !== "All" && project.status !== statusFilter) return false;

    // Search filter
    if (
      searchQuery.trim() !== "" &&
      !project.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !project.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !project.client.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    return true;
  });

  // Get unique statuses for filter
  const statuses = [
    "All",
    ...new Set(projects.map((project) => project.status)),
  ];

  // Open project details
  const handleOpenProjectDetails = (project: any) => {
    setSelectedProject(project);
    setShowProjectDetails(true);
  };

  // Close project details
  const handleCloseProjectDetails = () => {
    setShowProjectDetails(false);
  };

  // Handle project status change
  const handleStatusChange = (projectId: number, newStatus: string) => {
    const project = projects.find((p) => p.id === projectId);
    if (project) {
      setStatusChangeInfo({
        projectId,
        projectName: project.name,
        currentStatus: project.status,
        newStatus,
      });
      setShowStatusChangeModal(true);
    }
  };

  // Confirm status change
  const confirmStatusChange = () => {
    if (statusChangeInfo) {
      setProjects(
        projects.map((project) =>
          project.id === statusChangeInfo.projectId
            ? { ...project, status: statusChangeInfo.newStatus }
            : project
        )
      );

      if (
        selectedProject &&
        selectedProject.id === statusChangeInfo.projectId
      ) {
        setSelectedProject({
          ...selectedProject,
          status: statusChangeInfo.newStatus,
        });
      }

      setShowStatusChangeModal(false);
      setStatusChangeInfo(null);
    }
  };

  // Handle leave project
  const handleLeaveProject = (project: any) => {
    setProjectToLeave(project);
    setShowLeaveProjectModal(true);
  };

  // Confirm leave project
  const confirmLeaveProject = () => {
    if (projectToLeave) {
      // In a real app, this would remove the user from the project's team
      // Here we just update the UI to show the result
      setProjects(
        projects.map((project) =>
          project.id === projectToLeave.id
            ? {
                ...project,
                team: project.team.filter(
                  (member) => member.name !== "Current User"
                ),
              }
            : project
        )
      );

      if (selectedProject && selectedProject.id === projectToLeave.id) {
        setShowProjectDetails(false);
      }

      setShowLeaveProjectModal(false);
      setProjectToLeave(null);
    }
  };

  // Calculate days left
  const calculateDaysLeft = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
        <h1 className="text-3xl font-bold text-gray-800">My Projects</h1>
        <div className="w-full sm:w-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="absolute left-3 top-2.5 text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filter section - Updated for mobile */}
      <div className="bg-white shadow rounded-lg p-4 mb-6 overflow-x-auto">
        <div className="flex items-center whitespace-nowrap">
          <span className="text-sm font-medium text-gray-700 mr-2">
            Status:
          </span>
          <div className="flex space-x-2">
            {statuses.map((status, index) => (
              <button
                key={index}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 text-sm rounded-full ${
                  statusFilter === status
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Projects grid - Made responsive for different screen sizes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <div
            key={project.id}
            className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleOpenProjectDetails(project)}
          >
            <div className="p-5">
              <div className="flex justify-between mb-3">
                <div className="flex-1 pr-2">
                  <h3 className="text-lg font-semibold mb-1 text-gray-800 truncate">
                    {project.name}
                  </h3>
                  <span className="text-sm text-gray-500 block truncate">
                    Client: {project.client}
                  </span>
                </div>
                <span
                  className={`text-xs font-medium px-2.5 py-0.5 rounded h-fit flex-shrink-0 ${
                    project.status === "On Track"
                      ? "bg-green-100 text-green-800"
                      : project.status === "In Progress"
                      ? "bg-indigo-100 text-indigo-800"
                      : project.status === "At Risk"
                      ? "bg-red-100 text-red-800"
                      : project.status === "Completed"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {project.status}
                </span>
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {project.description}
              </p>

              {/* Progress bar */}
              <div className="mb-3">
                <div className="flex justify-between mb-1">
                  <span className="text-xs font-medium text-gray-700">
                    Progress
                  </span>
                  <span className="text-xs font-medium text-gray-700">
                    {project.completion}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      project.completion < 30
                        ? "bg-red-500"
                        : project.completion < 70
                        ? "bg-yellow-500"
                        : "bg-green-500"
                    }`}
                    style={{ width: `${project.completion}%` }}
                  ></div>
                </div>
              </div>

              {/* Dates and team */}
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-gray-500 mr-1"
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
                  <span className="text-xs text-gray-500">
                    {calculateDaysLeft(project.deadline) > 0
                      ? `${calculateDaysLeft(project.deadline)} days left`
                      : "Overdue"}
                  </span>
                </div>
                <div className="flex -space-x-2">
                  {project.team.slice(0, 3).map((member) => (
                    <img
                      key={member.id}
                      className="w-6 h-6 rounded-full border border-white"
                      src={member.avatar}
                      alt={member.name}
                      title={member.name}
                    />
                  ))}
                  {project.team.length > 3 && (
                    <div className="w-6 h-6 rounded-full bg-gray-200 border border-white flex items-center justify-center text-xs text-gray-600">
                      +{project.team.length - 3}
                    </div>
                  )}
                </div>
              </div>

              {/* My tasks */}
              <div>
                <h4 className="text-xs font-medium text-gray-700 mb-2">
                  My Tasks ({project.tasks.filter((t) => t.assigned).length})
                </h4>
                <div className="space-y-2">
                  {project.tasks
                    .filter((task) => task.assigned)
                    .slice(0, 2)
                    .map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="truncate flex-1 pr-2">
                          {task.title}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded flex-shrink-0 ${
                            task.status === "To Do"
                              ? "bg-gray-100 text-gray-800"
                              : task.status === "In Progress"
                              ? "bg-indigo-100 text-indigo-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {task.status}
                        </span>
                      </div>
                    ))}
                  {project.tasks.filter((t) => t.assigned).length > 2 && (
                    <span className="text-xs text-indigo-600">
                      +{project.tasks.filter((t) => t.assigned).length - 2} more
                      tasks
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredProjects.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-12 bg-white rounded-lg shadow">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 text-gray-300 mb-4"
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
            <h3 className="text-lg font-medium text-gray-900">
              No projects found
            </h3>
            <p className="text-gray-500 mt-1">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>

      {/* Project Detail Modal - Made responsive for mobile */}
      {showProjectDetails && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overscroll-contain overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 flex-shrink-0 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span
                      className={`text-xs font-medium px-2.5 py-0.5 rounded ${
                        selectedProject.status === "On Track"
                          ? "bg-green-100 text-green-800"
                          : selectedProject.status === "In Progress"
                          ? "bg-indigo-100 text-indigo-800"
                          : selectedProject.status === "At Risk"
                          ? "bg-red-100 text-red-800"
                          : selectedProject.status === "Completed"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {selectedProject.status}
                    </span>
                    <span className="text-xs text-gray-500">
                      Client: {selectedProject.client}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 break-words">
                    {selectedProject.name}
                  </h2>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLeaveProject(selectedProject);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
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
            </div>

            <div className="p-6 overflow-y-auto flex-grow">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                  {/* Description */}
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Description</h3>
                    <p className="text-gray-700">
                      {selectedProject.description}
                    </p>
                  </div>

                  {/* Progress */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <h3 className="text-lg font-semibold">Progress</h3>
                      <span className="text-sm font-medium text-gray-700">
                        {selectedProject.completion}% Complete
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
                      <div
                        className={`h-4 rounded-full ${
                          selectedProject.completion < 30
                            ? "bg-red-500"
                            : selectedProject.completion < 70
                            ? "bg-yellow-500"
                            : "bg-green-500"
                        }`}
                        style={{ width: `${selectedProject.completion}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* My Tasks */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">My Tasks</h3>
                    <div className="space-y-3">
                      {selectedProject.tasks
                        .filter((task: any) => task.assigned)
                        .map((task: any) => (
                          <div
                            key={task.id}
                            className="bg-gray-50 p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2"
                          >
                            <div>
                              <h4 className="font-medium text-gray-800">
                                {task.title}
                              </h4>
                              <Link
                                to={`/employee/tasks?project=${selectedProject.id}`}
                                className="text-sm text-indigo-600 hover:text-indigo-800"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCloseProjectDetails();
                                }}
                              >
                                View details
                              </Link>
                            </div>
                            <span
                              className={`text-xs font-medium px-2.5 py-1 rounded ${
                                task.status === "To Do"
                                  ? "bg-gray-100 text-gray-800"
                                  : task.status === "In Progress"
                                  ? "bg-indigo-100 text-indigo-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {task.status}
                            </span>
                          </div>
                        ))}
                      {selectedProject.tasks.filter(
                        (task: any) => task.assigned
                      ).length === 0 && (
                        <p className="text-gray-500 text-sm">
                          You don't have any assigned tasks for this project.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Team Members */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Team</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {selectedProject.team.map((member: any) => (
                        <div
                          key={member.id}
                          className="flex items-center p-3 bg-gray-50 rounded-lg"
                        >
                          <img
                            src={member.avatar}
                            alt={member.name}
                            className="w-10 h-10 rounded-full mr-3"
                          />
                          <div>
                            <p className="font-medium text-gray-800">
                              {member.name}
                            </p>
                            {member.name === "Current User" && (
                              <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">
                                You
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Updates */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">
                      Recent Updates
                    </h3>
                    <div className="space-y-3">
                      {selectedProject.recentUpdates.map((update: any) => (
                        <div
                          key={update.id}
                          className="border-l-2 border-indigo-500 pl-3 py-1"
                        >
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">{update.user}</span>{" "}
                            {update.action}
                          </p>
                          <p className="text-xs text-gray-500">{update.time}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Project Info Panel */}
                <div className="bg-gray-50 p-4 rounded-lg h-fit">
                  {/* Project Info */}
                  <h3 className="text-lg font-semibold mb-4">Project Info</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">
                        Project Manager
                      </h4>
                      <div className="mt-1 flex items-center">
                        <img
                          src={selectedProject.manager.avatar}
                          alt={selectedProject.manager.name}
                          className="h-8 w-8 rounded-full mr-2"
                        />
                        <span className="text-sm text-gray-900">
                          {selectedProject.manager.name}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-500">
                        Timeline
                      </h4>
                      <div className="mt-1 grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-xs text-gray-500">Start Date</p>
                          <p className="text-sm text-gray-900">
                            {new Date(
                              selectedProject.startDate
                            ).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Deadline</p>
                          <p className="text-sm text-gray-900">
                            {new Date(
                              selectedProject.deadline
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-500">
                        Days Remaining
                      </h4>
                      <div className="mt-1">
                        <p
                          className={`text-lg font-semibold ${
                            calculateDaysLeft(selectedProject.deadline) <= 0
                              ? "text-red-600"
                              : calculateDaysLeft(selectedProject.deadline) < 7
                              ? "text-orange-600"
                              : "text-green-600"
                          }`}
                        >
                          {calculateDaysLeft(selectedProject.deadline) > 0
                            ? `${calculateDaysLeft(
                                selectedProject.deadline
                              )} days`
                            : "Overdue"}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-500">
                        Client
                      </h4>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedProject.client}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-500">
                        Tasks
                      </h4>
                      <div className="mt-1 grid grid-cols-3 gap-2 text-center">
                        <div className="bg-gray-100 rounded p-2">
                          <p className="text-xs text-gray-500">To Do</p>
                          <p className="text-sm font-medium">
                            {
                              selectedProject.tasks.filter(
                                (t: any) => t.status === "To Do"
                              ).length
                            }
                          </p>
                        </div>
                        <div className="bg-indigo-50 rounded p-2">
                          <p className="text-xs text-gray-500">In Progress</p>
                          <p className="text-sm font-medium">
                            {
                              selectedProject.tasks.filter(
                                (t: any) => t.status === "In Progress"
                              ).length
                            }
                          </p>
                        </div>
                        <div className="bg-green-50 rounded p-2">
                          <p className="text-xs text-gray-500">Completed</p>
                          <p className="text-sm font-medium">
                            {
                              selectedProject.tasks.filter(
                                (t: any) => t.status === "Completed"
                              ).length
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t">
                    <Link
                      to="/employee/timetracking"
                      className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md flex items-center justify-center hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCloseProjectDetails();
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2"
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
                      Track Time for This Project
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t flex-shrink-0 bg-gray-50">
              <div className="flex justify-between">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLeaveProject(selectedProject);
                  }}
                  className="px-4 py-2 bg-red-100 text-red-700 border border-red-300 rounded-md shadow-sm text-sm font-medium hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Leave Project
                </button>
                <div className="flex space-x-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusChange(
                        selectedProject.id,
                        selectedProject.status === "In Progress"
                          ? "On Track"
                          : "In Progress"
                      );
                    }}
                    className="px-4 py-2 bg-indigo-100 text-indigo-700 border border-indigo-300 rounded-md shadow-sm text-sm font-medium hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Change Status
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCloseProjectDetails();
                    }}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Change Modal */}
      <Modal
        isOpen={showStatusChangeModal}
        onClose={() => setShowStatusChangeModal(false)}
        title="Change Project Status"
        size="small"
        actions={
          <>
            <button
              onClick={() => setShowStatusChangeModal(false)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              onClick={confirmStatusChange}
              className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Change Status
            </button>
          </>
        }
      >
        <p className="text-gray-700">
          Are you sure you want to change the status of "
          {statusChangeInfo?.projectName}" from
          <span className="font-medium">
            {" "}
            {statusChangeInfo?.currentStatus}
          </span>{" "}
          to
          <span className="font-medium"> {statusChangeInfo?.newStatus}</span>?
        </p>
        <p className="text-gray-500 text-sm mt-2">
          This will update the project's status and notify all team members.
        </p>
      </Modal>

      {/* Leave Project Modal */}
      <Modal
        isOpen={showLeaveProjectModal}
        onClose={() => setShowLeaveProjectModal(false)}
        title="Leave Project"
        size="small"
        actions={
          <>
            <button
              onClick={() => setShowLeaveProjectModal(false)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              onClick={confirmLeaveProject}
              className="px-4 py-2 bg-red-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Leave Project
            </button>
          </>
        }
      >
        <p className="text-gray-700">
          Are you sure you want to leave the project "{projectToLeave?.name}"?
        </p>
        <p className="text-gray-500 text-sm mt-2">
          You will no longer have access to this project's tasks and resources.
          The project manager will be notified of your departure.
        </p>
      </Modal>
    </div>
  );
};

export default Projects;
