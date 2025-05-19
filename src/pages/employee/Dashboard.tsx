import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  useErrorNotification,
  useSuccessNotification,
} from "../../contexts/NotificationContext";

// Mock data
const employeeData = {
  name: "Jason Chen",
  title: "UI/UX Designer",
  avatar: "https://randomuser.me/api/portraits/men/42.jpg",
  performanceScore: 83,
  assignedTasks: 12,
  completedTasks: 8,
  currentProjects: [
    { id: 1, name: "Website Redesign", progress: 65, dueDate: "2023-12-15" },
    {
      id: 2,
      name: "Mobile App Development",
      progress: 30,
      dueDate: "2024-01-10",
    },
  ],
  upcomingTasks: [
    {
      id: 1,
      title: "Design Mobile App Wireframes",
      project: "Mobile App Development",
      dueDate: "2023-12-05",
      priority: "high",
    },
    {
      id: 2,
      title: "Create Icon Set",
      project: "Website Redesign",
      dueDate: "2023-12-07",
      priority: "medium",
    },
    {
      id: 3,
      title: "UI Component Library",
      project: "Website Redesign",
      dueDate: "2023-12-12",
      priority: "high",
    },
  ],
  recentActivity: [
    {
      id: 1,
      type: "task_completed",
      description: "Completed Homepage Mockup",
      time: "2 hours ago",
    },
    {
      id: 2,
      type: "comment",
      description: "Commented on User Flow Diagram",
      time: "1 day ago",
    },
    {
      id: 3,
      type: "reward",
      description: "Received Star Performer badge",
      time: "3 days ago",
    },
    {
      id: 4,
      type: "task_assigned",
      description: "Assigned to Mobile App Development",
      time: "1 week ago",
    },
  ],
};

// Mock notifications
const notifications = [
  {
    id: 1,
    type: "task",
    message: "New task assigned: Design Mobile App Wireframes",
    time: "10 minutes ago",
    read: false,
  },
  {
    id: 2,
    type: "message",
    message: "John Manager commented on your design",
    time: "1 hour ago",
    read: false,
  },
  {
    id: 3,
    type: "alert",
    message: "Project deadline approaching: Website Redesign",
    time: "3 hours ago",
    read: true,
  },
];

const EmployeeDashboard: React.FC = () => {
  // State for dropdowns
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsList, setNotificationsList] = useState(notifications);

  // Refs for click outside handlers
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const showError = useErrorNotification();
  const showSuccess = useSuccessNotification();

  // Count unread notifications
  const unreadCount = notificationsList.filter((notif) => !notif.read).length;

  // Mark notification as read
  const markAsRead = (id: number) => {
    setNotificationsList(
      notificationsList.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  // Mark all as read
  const markAllAsRead = () => {
    setNotificationsList(
      notificationsList.map((notification) => ({
        ...notification,
        read: true,
      }))
    );
  };

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target as Node)
      ) {
        setNotificationsOpen(false);
      }
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      <header className="w-full bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">
            My Dashboard
          </h1>
          <div className="flex items-center space-x-4">
            {/* Notifications dropdown */}
            <div className="relative" ref={notificationsRef}>
              <button
                className="p-1 text-gray-400 rounded-full hover:bg-gray-100 focus:outline-none transition-colors duration-200"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                aria-label="Notifications"
              >
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
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications panel */}
              {notificationsOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10 transition ease-out duration-200 max-w-[calc(100vw-16px)] left-auto">
                  <div className="py-2 px-4 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-medium text-gray-900">
                        Notifications
                      </h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notificationsList.length === 0 ? (
                      <div className="py-4 px-4 text-center text-sm text-gray-500">
                        No notifications
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-200">
                        {notificationsList.map((notification) => (
                          <div
                            key={notification.id}
                            className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors duration-150 ${
                              notification.read ? "" : "bg-blue-50"
                            }`}
                            onClick={() => markAsRead(notification.id)}
                          >
                            <div className="flex items-start">
                              <div className="flex-shrink-0 pt-0.5">
                                {notification.type === "task" && (
                                  <span className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-5 w-5 text-indigo-600"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                                      />
                                    </svg>
                                  </span>
                                )}
                                {notification.type === "message" && (
                                  <span className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-5 w-5 text-green-600"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                                      />
                                    </svg>
                                  </span>
                                )}
                                {notification.type === "alert" && (
                                  <span className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-5 w-5 text-yellow-600"
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
                                  </span>
                                )}
                              </div>
                              <div className="ml-3 flex-1">
                                <p className="text-sm text-gray-900">
                                  {notification.message}
                                </p>
                                <p className="mt-1 text-xs text-gray-500">
                                  {notification.time}
                                </p>
                              </div>
                              {!notification.read && (
                                <div className="flex-shrink-0 ml-2">
                                  <span className="inline-block h-2 w-2 rounded-full bg-blue-500"></span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="py-2 px-4 border-t border-gray-200 text-center">
                    <Link
                      to="/employee/notifications"
                      className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors duration-150"
                    >
                      View all notifications
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Profile dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                className="flex items-center text-sm font-medium text-gray-700 hover:bg-gray-50 p-2 rounded-md transition-colors duration-200 focus:outline-none"
                onClick={() => setProfileOpen(!profileOpen)}
                aria-label="User menu"
              >
                <img
                  className="h-8 w-8 rounded-full border-2 border-gray-200 object-cover"
                  src={employeeData.avatar}
                  alt="Profile"
                />
                <span className="ml-2 hidden sm:inline">
                  {employeeData.name}
                </span>
                <svg
                  className={`ml-1 h-5 w-5 text-gray-400 transition-transform duration-200 ${
                    profileOpen ? "transform rotate-180" : ""
                  }`}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {/* Profile dropdown menu */}
              {profileOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10 transition ease-out duration-200">
                  <div className="py-3 px-4 border-b border-gray-200">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <img
                          className="h-10 w-10 rounded-full object-cover"
                          src={employeeData.avatar}
                          alt={employeeData.name}
                        />
                      </div>
                      <div className="ml-3">
                        <div className="text-base font-medium text-gray-800">
                          {employeeData.name}
                        </div>
                        <div className="text-sm font-medium text-gray-500">
                          {employeeData.title}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="py-1" role="menu" aria-orientation="vertical">
                    <Link
                      to="/employee/profile"
                      className="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700"
                      role="menuitem"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="mr-3 h-5 w-5 text-gray-400 group-hover:text-indigo-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      Your Profile
                    </Link>
                    <Link
                      to="/employee/timetracking"
                      className="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700"
                      role="menuitem"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="mr-3 h-5 w-5 text-gray-400 group-hover:text-indigo-500"
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
                      Time Tracking
                    </Link>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={async () => {
                        try {
                          await logout();
                          showSuccess(
                            "Logout Successful",
                            "You have been logged out successfully"
                          );
                          navigate("/login");
                        } catch (error) {
                          console.error("Logout failed:", error);
                          showError(
                            "Logout Failed",
                            "There was a problem logging you out"
                          );
                        }
                      }}
                      className="group flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700"
                      role="menuitem"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="mr-3 h-5 w-5 text-gray-400 group-hover:text-red-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Welcome & Stats Section */}
        <div className="bg-white shadow rounded-lg overflow-hidden mb-6 sm:mb-8 w-full">
          <div className="p-4 sm:p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex items-center">
                <img
                  className="h-16 w-16 rounded-full mr-4 border-4 border-indigo-50"
                  src={employeeData.avatar}
                  alt={employeeData.name}
                />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Welcome back, {employeeData.name}
                  </h2>
                  <p className="text-gray-500">{employeeData.title}</p>
                </div>
              </div>

              <div className="mt-6 md:mt-0 flex items-center">
                <div className="mr-6 text-center">
                  <div className="text-2xl font-bold text-indigo-600">
                    {employeeData.performanceScore}%
                  </div>
                  <div className="text-xs text-gray-500">Performance</div>
                </div>
                <div className="mr-6 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {employeeData.completedTasks}
                  </div>
                  <div className="text-xs text-gray-500">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-500">
                    {employeeData.assignedTasks - employeeData.completedTasks}
                  </div>
                  <div className="text-xs text-gray-500">Pending</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 w-full">
          {/* Current Projects Section */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg overflow-hidden mb-6 sm:mb-8 w-full">
              <div className="flex justify-between items-center p-4 sm:p-6 border-b">
                <h3 className="text-lg font-medium text-gray-900">
                  My Current Projects
                </h3>
                <Link
                  to="/employee/projects"
                  className="text-indigo-600 text-sm font-medium hover:text-indigo-800"
                >
                  View All
                </Link>
              </div>
              <div className="p-4 sm:p-6">
                {employeeData.currentProjects.map((project) => (
                  <div key={project.id} className="mb-6 last:mb-0">
                    <div className="flex justify-between mb-2">
                      <div>
                        <h4 className="text-base font-medium text-gray-900">
                          {project.name}
                        </h4>
                        <p className="text-sm text-gray-500">
                          Due: {project.dueDate}
                        </p>
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {project.progress}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full ${
                          project.progress < 30
                            ? "bg-red-500"
                            : project.progress < 70
                            ? "bg-yellow-500"
                            : "bg-green-500"
                        }`}
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Tasks Section */}
            <div className="bg-white shadow rounded-lg overflow-hidden w-full">
              <div className="flex justify-between items-center p-4 sm:p-6 border-b">
                <h3 className="text-lg font-medium text-gray-900">
                  Upcoming Tasks
                </h3>
                <Link
                  to="/employee/tasks"
                  className="text-indigo-600 text-sm font-medium hover:text-indigo-800"
                >
                  View All
                </Link>
              </div>
              <div className="overflow-hidden">
                <ul className="divide-y divide-gray-200">
                  {employeeData.upcomingTasks.map((task) => (
                    <li key={task.id} className="p-4 sm:p-6">
                      <div className="flex items-center justify-between flex-wrap">
                        <div className="flex items-center w-full sm:w-auto mb-3 sm:mb-0">
                          <div
                            className={`p-2 rounded-full mr-4 ${
                              task.priority === "high"
                                ? "bg-red-100"
                                : task.priority === "medium"
                                ? "bg-yellow-100"
                                : "bg-green-100"
                            }`}
                          >
                            <svg
                              className={`h-5 w-5 ${
                                task.priority === "high"
                                  ? "text-red-600"
                                  : task.priority === "medium"
                                  ? "text-yellow-600"
                                  : "text-green-600"
                              }`}
                              xmlns="http://www.w3.org/2000/svg"
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
                          </div>
                          <div>
                            <h4 className="text-base font-medium text-gray-900">
                              {task.title}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {task.project} • Due {task.dueDate}
                            </p>
                          </div>
                        </div>
                        <div>
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              task.priority === "high"
                                ? "bg-red-100 text-red-800"
                                : task.priority === "medium"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {task.priority.charAt(0).toUpperCase() +
                              task.priority.slice(1)}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-gray-50 px-4 sm:px-6 py-4">
                <Link
                  to="/employee/tasks?action=new"
                  className="w-full flex justify-center items-center text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  <svg
                    className="h-5 w-5 mr-1"
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
                  Add New Task
                </Link>
              </div>
            </div>
          </div>

          {/* Activity Feed Section */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg overflow-hidden h-full w-full">
              <div className="p-4 sm:p-6 border-b">
                <h3 className="text-lg font-medium text-gray-900">
                  Recent Activity
                </h3>
              </div>
              <div className="p-4 sm:p-6">
                <ul className="space-y-6">
                  {employeeData.recentActivity.map((activity) => (
                    <li key={activity.id} className="relative">
                      <div className="relative flex items-start space-x-3">
                        <div className="relative">
                          <div
                            className={`h-8 w-8 rounded-full flex items-center justify-center ${
                              activity.type === "task_completed"
                                ? "bg-green-100"
                                : activity.type === "comment"
                                ? "bg-blue-100"
                                : activity.type === "reward"
                                ? "bg-purple-100"
                                : "bg-gray-100"
                            }`}
                          >
                            {activity.type === "task_completed" && (
                              <svg
                                className="h-5 w-5 text-green-600"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            )}
                            {activity.type === "comment" && (
                              <svg
                                className="h-5 w-5 text-blue-600"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                />
                              </svg>
                            )}
                            {activity.type === "reward" && (
                              <svg
                                className="h-5 w-5 text-purple-600"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                            )}
                            {activity.type === "task_assigned" && (
                              <svg
                                className="h-5 w-5 text-gray-600"
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
                            )}
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div>
                            <p className="text-sm text-gray-900">
                              {activity.description}
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                              {activity.time}
                            </p>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-gray-50 px-4 sm:px-6 py-4 text-center">
                <Link
                  to="/employee/performance"
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                >
                  View all activity
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EmployeeDashboard;
