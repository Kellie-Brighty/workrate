import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";

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
  const { projectId } = useParams<{ projectId: string }>();
  const [activeTab, setActiveTab] = useState<
    "overview" | "tasks" | "team" | "activity"
  >("overview");

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
                <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                  <ul className="divide-y divide-gray-200">
                    {projectData.teamMembers.map((member) => (
                      <li key={member.id} className="py-3 flex items-center">
                        <img
                          className="h-10 w-10 rounded-full"
                          src={member.avatar}
                          alt={member.name}
                        />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            {member.name}
                          </p>
                          <p className="text-sm text-gray-500">{member.role}</p>
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
    </div>
  );
};

export default ProjectDetail;
