import React, { useState } from "react";
import { Link } from "react-router-dom";
import Modal from "../../components/Modal";

// Mock project data
const projectData = {
  id: 1,
  title: "Website Redesign",
  description:
    "Redesign the company website with a modern look and improved user experience. The new design should be mobile-friendly and follow the latest web design trends while maintaining our brand identity.",
  startDate: "2023-10-15",
  endDate: "2023-12-31",
  progress: 65,
  status: "In Progress",
  priority: "High",
  category: "Design",
  budget: 25000,
  teamMembers: [
    {
      id: 1,
      name: "Jason Chen",
      role: "UI/UX Designer",
      avatar: "https://randomuser.me/api/portraits/men/42.jpg",
    },
    {
      id: 2,
      name: "Sarah Johnson",
      role: "Frontend Developer",
      avatar: "https://randomuser.me/api/portraits/women/43.jpg",
    },
    {
      id: 3,
      name: "Michael Brown",
      role: "Backend Developer",
      avatar: "https://randomuser.me/api/portraits/men/44.jpg",
    },
    {
      id: 4,
      name: "Emily Davis",
      role: "Project Manager",
      avatar: "https://randomuser.me/api/portraits/women/45.jpg",
    },
  ],
  tasks: [
    {
      id: 1,
      title: "Research competitors",
      status: "Completed",
      assignee: "Jason Chen",
      dueDate: "2023-10-25",
      priority: "Medium",
    },
    {
      id: 2,
      title: "Create wireframes",
      status: "Completed",
      assignee: "Jason Chen",
      dueDate: "2023-11-05",
      priority: "High",
    },
    {
      id: 3,
      title: "Design homepage",
      status: "In Progress",
      assignee: "Jason Chen",
      dueDate: "2023-11-15",
      priority: "High",
    },
    {
      id: 4,
      title: "Implement responsive layout",
      status: "Not Started",
      assignee: "Sarah Johnson",
      dueDate: "2023-11-25",
      priority: "High",
    },
    {
      id: 5,
      title: "Create backend API",
      status: "In Progress",
      assignee: "Michael Brown",
      dueDate: "2023-11-20",
      priority: "Medium",
    },
    {
      id: 6,
      title: "User testing",
      status: "Not Started",
      assignee: "Emily Davis",
      dueDate: "2023-12-10",
      priority: "Medium",
    },
    {
      id: 7,
      title: "Performance optimization",
      status: "Not Started",
      assignee: "Sarah Johnson",
      dueDate: "2023-12-20",
      priority: "Low",
    },
    {
      id: 8,
      title: "Content migration",
      status: "Not Started",
      assignee: "Michael Brown",
      dueDate: "2023-12-25",
      priority: "Medium",
    },
  ],
  milestones: [
    {
      id: 1,
      title: "Research & Planning Phase",
      dueDate: "2023-10-30",
      status: "Completed",
    },
    {
      id: 2,
      title: "Design Phase",
      dueDate: "2023-11-15",
      status: "In Progress",
    },
    {
      id: 3,
      title: "Development Phase",
      dueDate: "2023-12-15",
      status: "Not Started",
    },
    {
      id: 4,
      title: "Testing & Launch",
      dueDate: "2023-12-31",
      status: "Not Started",
    },
  ],
  activity: [
    {
      id: 1,
      user: "Emily Davis",
      action: "updated the project status",
      timestamp: "2023-11-10T14:32:00Z",
    },
    {
      id: 2,
      user: "Jason Chen",
      action: "completed task 'Create wireframes'",
      timestamp: "2023-11-05T11:15:00Z",
    },
    {
      id: 3,
      user: "Sarah Johnson",
      action: "was assigned to task 'Implement responsive layout'",
      timestamp: "2023-11-01T09:45:00Z",
    },
    {
      id: 4,
      user: "Michael Brown",
      action: "started working on 'Create backend API'",
      timestamp: "2023-10-28T16:20:00Z",
    },
    {
      id: 5,
      user: "Emily Davis",
      action: "created the project",
      timestamp: "2023-10-15T10:00:00Z",
    },
  ],
};

// Status color mapping
const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "completed":
      return "bg-green-100 text-green-800";
    case "in progress":
      return "bg-blue-100 text-blue-800";
    case "not started":
      return "bg-gray-100 text-gray-800";
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

const ProjectDetail: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "overview" | "tasks" | "team" | "activity"
  >("overview");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showMemberDetailModal, setShowMemberDetailModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const [showDeleteProjectModal, setShowDeleteProjectModal] = useState(false);

  // Handle view team member
  const handleViewMember = (member: any) => {
    setSelectedMember(member);
    setShowMemberDetailModal(true);
  };

  // In a real app, we would fetch the project data based on the projectId
  // For this demo, we'll use the mock data

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-900 truncate">
                  {projectData.title}
                </h1>
                <span
                  className={`ml-3 inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium ${getStatusColor(
                    projectData.status
                  )}`}
                >
                  {projectData.status}
                </span>
              </div>
              <div className="mt-1 flex items-center text-sm text-gray-500">
                <span className="truncate">
                  {new Date(projectData.startDate).toLocaleDateString()} -{" "}
                  {new Date(projectData.endDate).toLocaleDateString()}
                </span>
                <span className="mx-2">•</span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(
                    projectData.priority
                  )}`}
                >
                  {projectData.priority} Priority
                </span>
                <span className="mx-2">•</span>
                <span>{projectData.category}</span>
              </div>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4">
              <Link
                to="/employer/projects"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Back to Projects
              </Link>
              <button
                type="button"
                className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={() => setShowEditModal(true)}
              >
                Edit Project
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {["overview", "tasks", "team", "activity"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as typeof activeTab)}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                  ${
                    activeTab === tab
                      ? "border-indigo-500 text-indigo-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }
                `}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Main content */}
            <div className="lg:col-span-2">
              {/* Project Description */}
              <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Project Description
                  </h3>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                  <p className="text-gray-600">{projectData.description}</p>
                </div>
              </div>

              {/* Progress */}
              <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Progress
                  </h3>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Overall Completion
                    </span>
                    <span className="text-sm font-medium text-gray-700">
                      {projectData.progress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${
                        projectData.progress < 30
                          ? "bg-red-500"
                          : projectData.progress < 70
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                      style={{ width: `${projectData.progress}%` }}
                    ></div>
                  </div>

                  {/* Milestones */}
                  <div className="mt-8">
                    <h4 className="text-base font-medium text-gray-700 mb-4">
                      Milestones
                    </h4>
                    <div className="space-y-3">
                      {projectData.milestones.map((milestone) => (
                        <div key={milestone.id} className="flex items-center">
                          <div
                            className={`flex-shrink-0 h-5 w-5 rounded-full ${
                              milestone.status === "Completed"
                                ? "bg-green-500"
                                : milestone.status === "In Progress"
                                ? "bg-blue-500"
                                : "bg-gray-300"
                            }`}
                          ></div>
                          <div className="ml-4 flex-1">
                            <div className="flex justify-between items-center">
                              <div>
                                <h5 className="text-sm font-medium text-gray-900">
                                  {milestone.title}
                                </h5>
                                <p className="text-xs text-gray-500">
                                  Due:{" "}
                                  {new Date(
                                    milestone.dueDate
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                  milestone.status
                                )}`}
                              >
                                {milestone.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Tasks */}
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Recent Tasks
                  </h3>
                  <button
                    onClick={() => setActiveTab("tasks")}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-900"
                  >
                    View All
                  </button>
                </div>
                <div className="border-t border-gray-200">
                  <ul className="divide-y divide-gray-200">
                    {projectData.tasks.slice(0, 4).map((task) => (
                      <li key={task.id} className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div
                              className={`h-2.5 w-2.5 rounded-full mr-2 ${
                                task.status === "Completed"
                                  ? "bg-green-500"
                                  : task.status === "In Progress"
                                  ? "bg-blue-500"
                                  : "bg-gray-300"
                              }`}
                            ></div>
                            <p className="text-sm font-medium text-gray-900">
                              {task.title}
                            </p>
                          </div>
                          <div className="ml-2 flex-shrink-0 flex">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                task.status
                              )}`}
                            >
                              {task.status}
                            </span>
                          </div>
                        </div>
                        <div className="mt-2 sm:flex sm:justify-between">
                          <div className="sm:flex">
                            <p className="flex items-center text-sm text-gray-500">
                              <svg
                                className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                aria-hidden="true"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              {task.assignee}
                            </p>
                          </div>
                          <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                            <svg
                              className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                              aria-hidden="true"
                            >
                              <path
                                fillRule="evenodd"
                                d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <p>
                              Due {new Date(task.dueDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Project Info */}
              <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Project Information
                  </h3>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">
                        Budget
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        ${projectData.budget.toLocaleString()}
                      </dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">
                        Category
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {projectData.category}
                      </dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">
                        Start Date
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {new Date(projectData.startDate).toLocaleDateString()}
                      </dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">
                        End Date
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {new Date(projectData.endDate).toLocaleDateString()}
                      </dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">
                        Tasks Status
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        <div className="flex space-x-4">
                          <div>
                            <span className="text-lg font-medium">
                              {
                                projectData.tasks.filter(
                                  (t) => t.status === "Completed"
                                ).length
                              }
                            </span>
                            <p className="text-xs text-gray-500">Completed</p>
                          </div>
                          <div>
                            <span className="text-lg font-medium">
                              {
                                projectData.tasks.filter(
                                  (t) => t.status === "In Progress"
                                ).length
                              }
                            </span>
                            <p className="text-xs text-gray-500">In Progress</p>
                          </div>
                          <div>
                            <span className="text-lg font-medium">
                              {
                                projectData.tasks.filter(
                                  (t) => t.status === "Not Started"
                                ).length
                              }
                            </span>
                            <p className="text-xs text-gray-500">Not Started</p>
                          </div>
                        </div>
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              {/* Team Members */}
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Team
                  </h3>
                  <button
                    onClick={() => setActiveTab("team")}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-900"
                  >
                    View All
                  </button>
                </div>
                <div className="border-t border-gray-200">
                  <ul className="divide-y divide-gray-200">
                    {projectData.teamMembers.map((member) => (
                      <li
                        key={member.id}
                        className="px-4 py-4 sm:px-6 hover:bg-gray-50"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <img
                              className="h-12 w-12 rounded-full"
                              src={member.avatar}
                              alt={member.name}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {member.name}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              {member.role}
                            </p>
                          </div>
                          <div>
                            <button
                              type="button"
                              className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                              onClick={() => handleViewMember(member)}
                            >
                              View
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tasks Tab */}
        {activeTab === "tasks" && (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Project Tasks
              </h3>
              <button
                type="button"
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={() => setShowAddTaskModal(true)}
              >
                Add Task
              </button>
            </div>
            <div className="border-t border-gray-200">
              <ul className="divide-y divide-gray-200">
                {projectData.tasks.map((task) => (
                  <li
                    key={task.id}
                    className="px-4 py-4 sm:px-6 hover:bg-gray-50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div
                          className={`h-3 w-3 rounded-full mr-3 ${
                            task.status === "Completed"
                              ? "bg-green-500"
                              : task.status === "In Progress"
                              ? "bg-blue-500"
                              : "bg-gray-300"
                          }`}
                        ></div>
                        <p className="text-sm font-medium text-gray-900">
                          {task.title}
                        </p>
                        <span
                          className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(
                            task.priority
                          )}`}
                        >
                          {task.priority}
                        </span>
                      </div>
                      <div className="ml-2 flex-shrink-0 flex">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            task.status
                          )}`}
                        >
                          {task.status}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          <svg
                            className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {task.assignee}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <svg
                          className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <p>Due {new Date(task.dueDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Team Tab */}
        {activeTab === "team" && (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Project Team
              </h3>
              <button
                type="button"
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={() => setShowAddMemberModal(true)}
              >
                Add Members
              </button>
            </div>
            <div className="border-t border-gray-200">
              <ul className="divide-y divide-gray-200">
                {projectData.teamMembers.map((member) => (
                  <li
                    key={member.id}
                    className="px-4 py-4 sm:px-6 hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <img
                          className="h-12 w-12 rounded-full"
                          src={member.avatar}
                          alt={member.name}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {member.name}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {member.role}
                        </p>
                      </div>
                      <div>
                        <button
                          type="button"
                          className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          onClick={() => handleViewMember(member)}
                        >
                          View
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === "activity" && (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Project Activity
              </h3>
            </div>
            <div className="border-t border-gray-200">
              <div className="bg-gray-50 px-4 py-6 sm:px-6">
                <div className="flow-root">
                  <ul className="-mb-8">
                    {projectData.activity.map((item, itemIdx) => (
                      <li key={item.id}>
                        <div className="relative pb-8">
                          {itemIdx !== projectData.activity.length - 1 ? (
                            <span
                              className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200"
                              aria-hidden="true"
                            ></span>
                          ) : null}
                          <div className="relative flex items-start space-x-3">
                            <div className="relative">
                              <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center ring-8 ring-white">
                                <svg
                                  className="h-5 w-5 text-white"
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
                              </div>
                            </div>
                            <div className="min-w-0 flex-1">
                              <div>
                                <div className="text-sm">
                                  <a
                                    href="#"
                                    className="font-medium text-gray-900"
                                  >
                                    {item.user}
                                  </a>
                                </div>
                                <p className="mt-0.5 text-sm text-gray-500">
                                  {item.action}
                                </p>
                              </div>
                              <div className="mt-2 text-sm text-gray-500">
                                <p>
                                  {new Date(item.timestamp).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Project Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Project"
        size="large"
        actions={
          <>
            <button
              className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={() => setShowEditModal(false)}
            >
              Cancel
            </button>
            <button
              className="ml-3 px-4 py-2 bg-indigo-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={() => setShowEditModal(false)}
            >
              Save Changes
            </button>
          </>
        }
      >
        <div className="py-4 space-y-4">
          <div>
            <label
              htmlFor="project-title"
              className="block text-sm font-medium text-gray-700"
            >
              Project Title
            </label>
            <input
              type="text"
              id="project-title"
              defaultValue={projectData.title}
              className="mt-1 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md"
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
              id="description"
              rows={3}
              defaultValue={projectData.description}
              className="mt-1 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="start-date"
                className="block text-sm font-medium text-gray-700"
              >
                Start Date
              </label>
              <input
                type="date"
                id="start-date"
                defaultValue={projectData.startDate}
                className="mt-1 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label
                htmlFor="end-date"
                className="block text-sm font-medium text-gray-700"
              >
                End Date
              </label>
              <input
                type="date"
                id="end-date"
                defaultValue={projectData.endDate}
                className="mt-1 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="status"
                className="block text-sm font-medium text-gray-700"
              >
                Status
              </label>
              <select
                id="status"
                defaultValue={projectData.status}
                className="mt-1 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md"
              >
                <option>Not Started</option>
                <option>Just Started</option>
                <option>In Progress</option>
                <option>Almost Complete</option>
                <option>Completed</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="priority"
                className="block text-sm font-medium text-gray-700"
              >
                Priority
              </label>
              <select
                id="priority"
                defaultValue={projectData.priority}
                className="mt-1 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md"
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>
          </div>
          <div>
            <label
              htmlFor="budget"
              className="block text-sm font-medium text-gray-700"
            >
              Budget
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="text"
                id="budget"
                defaultValue={projectData.budget}
                className="mt-1 pl-7 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>
          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            <button
              type="button"
              className="text-red-600 hover:text-red-900 text-sm font-medium"
              onClick={() => {
                setShowEditModal(false);
                setShowDeleteProjectModal(true);
              }}
            >
              Delete Project
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Project Confirmation Modal */}
      <Modal
        isOpen={showDeleteProjectModal}
        onClose={() => setShowDeleteProjectModal(false)}
        title="Delete Project"
        size="small"
        actions={
          <>
            <button
              className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={() => setShowDeleteProjectModal(false)}
            >
              Cancel
            </button>
            <button
              className="ml-3 px-4 py-2 bg-red-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              onClick={() => {
                setShowDeleteProjectModal(false);
                // In a real app, we would delete the project and navigate
                window.location.href = "/employer/projects";
              }}
            >
              Delete
            </button>
          </>
        }
      >
        <div className="py-4">
          <p className="text-sm text-gray-500">
            Are you sure you want to delete this project? This action cannot be
            undone and all associated data will be permanently removed.
          </p>
        </div>
      </Modal>

      {/* Add Task Modal - would be added when the "Add Task" button is clicked */}
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
              onClick={() => setShowAddTaskModal(false)}
            >
              Add Task
            </button>
          </>
        }
      >
        <div className="py-4 space-y-4">
          <div>
            <label
              htmlFor="task-title"
              className="block text-sm font-medium text-gray-700"
            >
              Task Title
            </label>
            <input
              type="text"
              id="task-title"
              className="mt-1 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label
              htmlFor="task-description"
              className="block text-sm font-medium text-gray-700"
            >
              Description
            </label>
            <textarea
              id="task-description"
              rows={3}
              className="mt-1 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="task-assignee"
                className="block text-sm font-medium text-gray-700"
              >
                Assignee
              </label>
              <select
                id="task-assignee"
                className="mt-1 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md"
              >
                {projectData.teamMembers.map((member) => (
                  <option key={member.id} value={member.name}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="task-due-date"
                className="block text-sm font-medium text-gray-700"
              >
                Due Date
              </label>
              <input
                type="date"
                id="task-due-date"
                className="mt-1 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="task-priority"
                className="block text-sm font-medium text-gray-700"
              >
                Priority
              </label>
              <select
                id="task-priority"
                className="mt-1 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md"
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="task-status"
                className="block text-sm font-medium text-gray-700"
              >
                Status
              </label>
              <select
                id="task-status"
                className="mt-1 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md"
              >
                <option>Not Started</option>
                <option>In Progress</option>
                <option>Completed</option>
              </select>
            </div>
          </div>
        </div>
      </Modal>

      {/* Add Team Member Modal */}
      <Modal
        isOpen={showAddMemberModal}
        onClose={() => setShowAddMemberModal(false)}
        title="Add Team Members"
        size="medium"
        actions={
          <>
            <button
              className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={() => setShowAddMemberModal(false)}
            >
              Cancel
            </button>
            <button
              className="ml-3 px-4 py-2 bg-indigo-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={() => setShowAddMemberModal(false)}
            >
              Add Members
            </button>
          </>
        }
      >
        <div className="py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Select Employees
            </label>
            <div className="mt-2 space-y-2 max-h-60 overflow-y-auto border border-gray-300 rounded-md p-2">
              {/* Employee selection list */}
              {[
                {
                  id: 5,
                  name: "Alex Thompson",
                  role: "DevOps Engineer",
                  avatar: "https://randomuser.me/api/portraits/men/32.jpg",
                },
                {
                  id: 6,
                  name: "Jessica Williams",
                  role: "UI Designer",
                  avatar: "https://randomuser.me/api/portraits/women/25.jpg",
                },
                {
                  id: 7,
                  name: "Robert Lewis",
                  role: "QA Engineer",
                  avatar: "https://randomuser.me/api/portraits/men/67.jpg",
                },
              ].map((emp) => (
                <div
                  key={emp.id}
                  className="flex items-center p-2 hover:bg-gray-50 rounded"
                >
                  <input
                    id={`employee-${emp.id}`}
                    name={`employee-${emp.id}`}
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor={`employee-${emp.id}`}
                    className="ml-3 flex items-center cursor-pointer"
                  >
                    <img
                      src={emp.avatar}
                      alt={emp.name}
                      className="h-8 w-8 rounded-full mr-2"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {emp.name}
                      </p>
                      <p className="text-xs text-gray-500">{emp.role}</p>
                    </div>
                  </label>
                </div>
              ))}
            </div>
          </div>
          <div>
            <label
              htmlFor="member-role"
              className="block text-sm font-medium text-gray-700"
            >
              Role in Project
            </label>
            <select
              id="member-role"
              className="mt-1 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md"
            >
              <option value="Developer">Developer</option>
              <option value="Designer">Designer</option>
              <option value="Project Manager">Project Manager</option>
              <option value="QA Tester">QA Tester</option>
              <option value="DevOps">DevOps</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="member-notes"
              className="block text-sm font-medium text-gray-700"
            >
              Additional Notes
            </label>
            <textarea
              id="member-notes"
              rows={3}
              className="mt-1 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md"
              placeholder="Responsibilities, availability, etc."
            />
          </div>
        </div>
      </Modal>

      {/* Team Member Detail Modal */}
      <Modal
        isOpen={showMemberDetailModal}
        onClose={() => setShowMemberDetailModal(false)}
        title="Team Member Details"
        size="medium"
        actions={
          <button
            className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={() => setShowMemberDetailModal(false)}
          >
            Close
          </button>
        }
      >
        {selectedMember && (
          <div className="py-4">
            <div className="flex items-center mb-6">
              <img
                src={selectedMember.avatar}
                alt={selectedMember.name}
                className="h-16 w-16 rounded-full mr-4"
              />
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {selectedMember.name}
                </h3>
                <p className="text-sm text-gray-500">{selectedMember.role}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700">
                  Assigned Tasks
                </h4>
                <div className="mt-1 bg-gray-50 rounded-md p-3">
                  <ul className="space-y-2">
                    {projectData.tasks
                      .filter((task) => task.assignee === selectedMember.name)
                      .map((task) => (
                        <li key={task.id} className="flex items-center">
                          <span
                            className={`h-2 w-2 rounded-full mr-2 ${
                              task.status === "Completed"
                                ? "bg-green-500"
                                : task.status === "In Progress"
                                ? "bg-blue-500"
                                : "bg-gray-300"
                            }`}
                          ></span>
                          <span className="text-sm">{task.title}</span>
                          <span
                            className={`ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                              task.status
                            )}`}
                          >
                            {task.status}
                          </span>
                        </li>
                      ))}
                    {!projectData.tasks.some(
                      (task) => task.assignee === selectedMember.name
                    ) && (
                      <li className="text-sm text-gray-500">
                        No tasks assigned
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700">Skills</h4>
                <div className="mt-1 flex flex-wrap gap-1">
                  {["JavaScript", "React", "TypeScript", "UI Design"].map(
                    (skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-indigo-100 text-indigo-800"
                      >
                        {skill}
                      </span>
                    )
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700">
                  Contact Information
                </h4>
                <div className="mt-1 text-sm text-gray-500">
                  <p>
                    Email: {selectedMember.name.toLowerCase().replace(" ", ".")}
                    @company.com
                  </p>
                  <p>Phone: +1 (555) 123-4567</p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 flex justify-between">
                <button
                  type="button"
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Reassign Tasks
                </button>
                <button
                  type="button"
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Remove from Project
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ProjectDetail;
