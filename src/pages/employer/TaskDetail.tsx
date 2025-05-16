import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";

// Mock task data (we'll use the same structure as in the Tasks.tsx file)
const taskData = {
  id: 3,
  title: "Design homepage",
  description:
    "Create high-fidelity designs for the homepage based on approved wireframes. Include mobile and desktop versions with attention to responsive behavior. Should follow the brand guidelines and incorporate user feedback from earlier testing.",
  dueDate: "2023-11-15",
  createdAt: "2023-10-25",
  status: "In Progress",
  priority: "High",
  assignee: {
    id: 1,
    name: "Jason Chen",
    role: "UI/UX Designer",
    avatar: "https://randomuser.me/api/portraits/men/42.jpg",
  },
  project: {
    id: 1,
    title: "Website Redesign",
  },
  tags: ["design", "ui"],
  comments: [
    {
      id: 1,
      user: {
        id: 4,
        name: "Emily Davis",
        avatar: "https://randomuser.me/api/portraits/women/45.jpg",
      },
      text: "Please make sure to align with the new brand guidelines we finalized last week.",
      timestamp: "2023-10-26T14:30:00Z",
    },
    {
      id: 2,
      user: {
        id: 1,
        name: "Jason Chen",
        avatar: "https://randomuser.me/api/portraits/men/42.jpg",
      },
      text: "I've completed the first draft of desktop designs. Will work on mobile versions next.",
      timestamp: "2023-10-30T09:15:00Z",
    },
  ],
  attachments: [
    {
      id: 1,
      name: "homepage_wireframe.pdf",
      size: "2.4 MB",
      uploadedAt: "2023-10-25T11:30:00Z",
    },
    {
      id: 2,
      name: "brand_guidelines.pdf",
      size: "3.8 MB",
      uploadedAt: "2023-10-26T15:45:00Z",
    },
  ],
  activity: [
    {
      id: 1,
      action: "created the task",
      user: {
        id: 4,
        name: "Emily Davis",
      },
      timestamp: "2023-10-25T10:00:00Z",
    },
    {
      id: 2,
      action: "assigned the task to Jason Chen",
      user: {
        id: 4,
        name: "Emily Davis",
      },
      timestamp: "2023-10-25T10:05:00Z",
    },
    {
      id: 3,
      action: "added attachment homepage_wireframe.pdf",
      user: {
        id: 4,
        name: "Emily Davis",
      },
      timestamp: "2023-10-25T11:30:00Z",
    },
    {
      id: 4,
      action: "changed status from Not Started to In Progress",
      user: {
        id: 1,
        name: "Jason Chen",
      },
      timestamp: "2023-10-27T09:15:00Z",
    },
  ],
  checklist: [
    {
      id: 1,
      text: "Create desktop homepage design",
      completed: true,
    },
    {
      id: 2,
      text: "Create mobile homepage design",
      completed: false,
    },
    {
      id: 3,
      text: "Add responsive breakpoints",
      completed: false,
    },
    {
      id: 4,
      text: "Review with team",
      completed: false,
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

const TaskDetail: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const [activeTab, setActiveTab] = useState<
    "details" | "comments" | "attachments" | "activity"
  >("details");
  const [newComment, setNewComment] = useState("");

  // In a real app, we would fetch task data based on taskId
  // For this demo, we'll use the mock data

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col space-y-3 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                  {taskData.title}
                </h1>
                <div className="flex mt-2 sm:mt-0 sm:ml-3 space-x-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${getStatusColor(
                      taskData.status
                    )}`}
                  >
                    {taskData.status}
                  </span>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${getPriorityColor(
                      taskData.priority
                    )}`}
                  >
                    {taskData.priority}
                  </span>
                </div>
              </div>
              <div className="mt-1 flex flex-wrap items-center text-sm text-gray-500">
                <span className="mr-2 mb-1">
                  Due: {new Date(taskData.dueDate).toLocaleDateString()}
                </span>
                <span className="mr-2 mb-1">•</span>
                <span className="mb-1">
                  Project:{" "}
                  <Link
                    to={`/employer/projects/${taskData.project.id}`}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    {taskData.project.title}
                  </Link>
                </span>
              </div>
            </div>
            <div className="flex mt-2 md:mt-0 md:ml-4">
              <Link
                to="/employer/tasks"
                className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Back to Tasks
              </Link>
              <button
                type="button"
                className="ml-3 inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Edit Task
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab navigation */}
        <div className="border-b border-gray-200 mb-6 overflow-x-auto">
          <nav className="-mb-px flex space-x-4 sm:space-x-8" aria-label="Tabs">
            {["details", "comments", "attachments", "activity"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as typeof activeTab)}
                className={`
                  whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm
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

        {/* Details Tab */}
        {activeTab === "details" && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Main content */}
            <div className="lg:col-span-2">
              {/* Task Description */}
              <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Description
                  </h3>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                  <p className="text-gray-600 text-sm sm:text-base">
                    {taskData.description}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {taskData.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Checklist */}
              <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
                <div className="px-4 py-5 sm:px-6 flex justify-between items-center flex-wrap">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Checklist
                  </h3>
                  <span className="text-sm text-gray-500 mt-1 sm:mt-0">
                    {taskData.checklist.filter((item) => item.completed).length}{" "}
                    of {taskData.checklist.length} completed
                  </span>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                  <ul className="space-y-3">
                    {taskData.checklist.map((item) => (
                      <li key={item.id} className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id={`checklist-${item.id}`}
                            name={`checklist-${item.id}`}
                            type="checkbox"
                            checked={item.completed}
                            readOnly
                            className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label
                            htmlFor={`checklist-${item.id}`}
                            className={`font-medium ${
                              item.completed
                                ? "text-gray-400 line-through"
                                : "text-gray-700"
                            }`}
                          >
                            {item.text}
                          </label>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Task Info */}
              <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Task Information
                  </h3>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-1">
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">
                        Assignee
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 flex items-center">
                        <img
                          className="h-8 w-8 rounded-full mr-2"
                          src={taskData.assignee.avatar}
                          alt={taskData.assignee.name}
                        />
                        <span className="truncate">
                          {taskData.assignee.name} ({taskData.assignee.role})
                        </span>
                      </dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">
                        Status
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            taskData.status
                          )}`}
                        >
                          {taskData.status}
                        </span>
                      </dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">
                        Priority
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(
                            taskData.priority
                          )}`}
                        >
                          {taskData.priority}
                        </span>
                      </dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">
                        Created
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {new Date(taskData.createdAt).toLocaleDateString()}
                      </dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">
                        Due Date
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {new Date(taskData.dueDate).toLocaleDateString()}
                      </dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">
                        Project
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        <Link
                          to={`/employer/projects/${taskData.project.id}`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          {taskData.project.title}
                        </Link>
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Comments Tab */}
        {activeTab === "comments" && (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Comments
              </h3>
            </div>
            <div className="border-t border-gray-200">
              <ul className="divide-y divide-gray-200">
                {taskData.comments.map((comment) => (
                  <li key={comment.id} className="px-4 py-4 sm:px-6">
                    <div className="flex space-x-3">
                      <div className="flex-shrink-0">
                        <img
                          className="h-8 w-8 sm:h-10 sm:w-10 rounded-full"
                          src={comment.user.avatar}
                          alt={comment.user.name}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {comment.user.name}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500">
                          {new Date(comment.timestamp).toLocaleString()}
                        </p>
                        <p className="mt-2 text-sm text-gray-700">
                          {comment.text}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex space-x-3">
                  <div className="flex-shrink-0">
                    <img
                      className="h-8 w-8 sm:h-10 sm:w-10 rounded-full"
                      src="https://randomuser.me/api/portraits/men/1.jpg"
                      alt="Current user"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div>
                      <textarea
                        id="comment"
                        name="comment"
                        rows={3}
                        className="shadow-sm block w-full focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md"
                        placeholder="Add a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                      ></textarea>
                    </div>
                    <div className="mt-3 flex items-center justify-end">
                      <button
                        type="submit"
                        disabled={!newComment.trim()}
                        className={`inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                          newComment.trim()
                            ? "bg-indigo-600 hover:bg-indigo-700"
                            : "bg-indigo-300"
                        } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                      >
                        Comment
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Attachments Tab */}
        {activeTab === "attachments" && (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex justify-between flex-wrap">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2 sm:mb-0">
                Attachments
              </h3>
              <button
                type="button"
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Add File
              </button>
            </div>
            <div className="border-t border-gray-200">
              <ul className="divide-y divide-gray-200">
                {taskData.attachments.map((attachment) => (
                  <li
                    key={attachment.id}
                    className="px-4 py-4 sm:px-6 hover:bg-gray-50"
                  >
                    <div className="flex items-center justify-between flex-wrap">
                      <div className="flex items-center mb-2 sm:mb-0">
                        <svg
                          className="flex-shrink-0 h-5 w-5 text-gray-400"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            {attachment.name}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-500">
                            {attachment.size} •{" "}
                            {new Date(
                              attachment.uploadedAt
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <button
                          type="button"
                          className="font-medium text-indigo-600 hover:text-indigo-500"
                        >
                          Download
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
                Activity
              </h3>
            </div>
            <div className="border-t border-gray-200">
              <div className="bg-gray-50 px-4 py-6 sm:px-6">
                <div className="flow-root">
                  <ul className="-mb-8">
                    {taskData.activity.map((item, itemIdx) => (
                      <li key={item.id}>
                        <div className="relative pb-8">
                          {itemIdx !== taskData.activity.length - 1 ? (
                            <span
                              className="absolute top-5 left-4 -ml-px h-full w-0.5 bg-gray-200 sm:left-5"
                              aria-hidden="true"
                            ></span>
                          ) : null}
                          <div className="relative flex items-start space-x-2 sm:space-x-3">
                            <div className="relative">
                              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-indigo-500 flex items-center justify-center ring-8 ring-white">
                                <svg
                                  className="h-4 w-4 sm:h-5 sm:w-5 text-white"
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
                                    {item.user.name}
                                  </a>
                                </div>
                                <p className="mt-0.5 text-sm text-gray-500">
                                  {item.action}
                                </p>
                              </div>
                              <div className="mt-2 text-xs sm:text-sm text-gray-500">
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

export default TaskDetail;
