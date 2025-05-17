import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import Modal from "../../components/Modal";

// Mock data for demonstration
const dashboardData = {
  employees: 24,
  projects: 8,
  completedTasks: 149,
  pendingTasks: 31,
  topPerformer: {
    name: "Alex Johnson",
    title: "Senior Developer",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    completionRate: 98,
    projects: 5,
  },
  recentProjects: [
    { id: 1, name: "Website Redesign", progress: 75, team: 4 },
    { id: 2, name: "Mobile App Development", progress: 32, team: 6 },
    { id: 3, name: "CRM Integration", progress: 89, team: 3 },
    { id: 4, name: "Marketing Campaign", progress: 45, team: 5 },
  ],
};

// Mock notifications
const notifications = [
  {
    id: 1,
    type: "task",
    message: "New task created: Mobile App Design Review",
    time: "5 minutes ago",
    read: false,
  },
  {
    id: 2,
    type: "employee",
    message: "Jason Chen completed all assigned tasks",
    time: "1 hour ago",
    read: false,
  },
  {
    id: 3,
    type: "project",
    message: "Website Redesign project reached 75% completion",
    time: "3 hours ago",
    read: true,
  },
  {
    id: 4,
    type: "time",
    message: "5 new time entries await your approval",
    time: "Yesterday",
    read: true,
  },
];

const EmployerDashboard: React.FC = () => {
  // State for dropdowns
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsList, setNotificationsList] = useState(notifications);

  // Modal states
  const [showEmployeesModal, setShowEmployeesModal] = useState(false);
  const [showProjectsModal, setShowProjectsModal] = useState(false);
  const [showCompletedTasksModal, setShowCompletedTasksModal] = useState(false);
  const [showPendingTasksModal, setShowPendingTasksModal] = useState(false);
  const [showTopPerformerModal, setShowTopPerformerModal] = useState(false);
  const [showAllProjectsModal, setShowAllProjectsModal] = useState(false);
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);

  // Refs for click outside handlers
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      <header className="w-full bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">
            Dashboard
          </h1>
          <div className="flex items-center space-x-4">
            <Link
              to="/employer/create-project"
              className="bg-indigo-600 px-4 py-2 text-white rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors duration-200 flex items-center gap-1"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              New Project
            </Link>

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
                              {notification.type === "task" && (
                                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                                  <svg
                                    className="h-4 w-4 text-indigo-600"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                                    />
                                  </svg>
                                </div>
                              )}
                              {notification.type === "employee" && (
                                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                                  <svg
                                    className="h-4 w-4 text-green-600"
                                    xmlns="http://www.w3.org/2000/svg"
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
                                </div>
                              )}
                              {notification.type === "project" && (
                                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                                  <svg
                                    className="h-4 w-4 text-blue-600"
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
                                </div>
                              )}
                              {notification.type === "time" && (
                                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center mr-3">
                                  <svg
                                    className="h-4 w-4 text-yellow-600"
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
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-800">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {notification.time}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                        <div className="py-2 px-4 text-center">
                          <Link
                            to="/employer/notifications"
                            className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                            onClick={() => setNotificationsOpen(false)}
                          >
                            View all notifications
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="relative" ref={profileRef}>
              <button
                className="flex items-center text-sm font-medium text-gray-700 focus:outline-none hover:text-indigo-600 transition-colors"
                onClick={() => setProfileOpen(!profileOpen)}
              >
                <img
                  className="h-8 w-8 rounded-full border-2 border-gray-200"
                  src="https://randomuser.me/api/portraits/women/42.jpg"
                  alt="Profile"
                />
                <span className="ml-2 hidden sm:inline">Sarah Mitchell</span>
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
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 focus:outline-none z-10">
                  <div className="px-4 py-3">
                    <p className="text-sm">Signed in as</p>
                    <p className="text-sm font-medium text-gray-900 truncate">
                      admin@workrate.com
                    </p>
                  </div>
                  <div className="py-1">
                    <Link
                      to="/employer/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setProfileOpen(false)}
                    >
                      Your Profile
                    </Link>
                    <Link
                      to="/employer/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setProfileOpen(false)}
                    >
                      Settings
                    </Link>
                  </div>
                  <div className="py-1">
                    <Link
                      to="/login"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setProfileOpen(false)}
                    >
                      Sign out
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8 w-full">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-indigo-100 rounded-md p-3">
                  <svg
                    className="h-6 w-6 text-indigo-600"
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
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Employees
                    </dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">
                        {dashboardData.employees}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6">
              <div className="text-sm">
                <button
                  onClick={() => setShowEmployeesModal(true)}
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  View all<span className="sr-only"> employees</span>
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                  <svg
                    className="h-6 w-6 text-green-600"
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
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Active Projects
                    </dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">
                        {dashboardData.projects}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6">
              <div className="text-sm">
                <button
                  onClick={() => setShowProjectsModal(true)}
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  View all<span className="sr-only"> projects</span>
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                  <svg
                    className="h-6 w-6 text-blue-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Completed Tasks
                    </dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">
                        {dashboardData.completedTasks}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6">
              <div className="text-sm">
                <button
                  onClick={() => setShowCompletedTasksModal(true)}
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  View details
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                  <svg
                    className="h-6 w-6 text-yellow-600"
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
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Pending Tasks
                    </dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">
                        {dashboardData.pendingTasks}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6">
              <div className="text-sm">
                <button
                  onClick={() => setShowPendingTasksModal(true)}
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  View details
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 w-full">
          {/* Top Performer */}
          <div className="bg-white rounded-lg shadow overflow-hidden w-full">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Top Performer
              </h3>
            </div>
            <div className="px-4 py-5 sm:p-6 flex flex-col items-center">
              <img
                className="h-24 w-24 rounded-full mb-4"
                src={dashboardData.topPerformer.avatar}
                alt={dashboardData.topPerformer.name}
              />
              <h4 className="text-xl font-semibold text-gray-900">
                {dashboardData.topPerformer.name}
              </h4>
              <p className="text-sm text-gray-500">
                {dashboardData.topPerformer.title}
              </p>

              <div className="mt-4 w-full">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    Completion Rate
                  </span>
                  <span className="text-sm font-medium text-gray-700">
                    {dashboardData.topPerformer.completionRate}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-green-600 h-2.5 rounded-full"
                    style={{
                      width: `${dashboardData.topPerformer.completionRate}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div className="flex justify-between items-center w-full mt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {dashboardData.topPerformer.projects}
                  </div>
                  <div className="text-xs text-gray-500">Projects</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">24</div>
                  <div className="text-xs text-gray-500">Tasks</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">12</div>
                  <div className="text-xs text-gray-500">Rewards</div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-4 sm:px-6">
              <button
                onClick={() => setShowTopPerformerModal(true)}
                className="w-full text-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                View Profile
              </button>
            </div>
          </div>

          {/* Recent Projects */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg overflow-hidden w-full">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Recent Projects
                </h3>
                <button
                  onClick={() => setShowAllProjectsModal(true)}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  View All
                </button>
              </div>
              <ul className="divide-y divide-gray-200">
                {dashboardData.recentProjects.map((project) => (
                  <li key={project.id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between flex-wrap">
                      <div className="flex items-center w-full sm:w-auto mb-2 sm:mb-0">
                        <div className="bg-indigo-100 rounded-md p-2 mr-4">
                          <svg
                            className="h-6 w-6 text-indigo-600"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {project.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {project.team} team members
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center mt-2 sm:mt-0">
                        <div className="mr-4 flex flex-col items-end">
                          <div className="text-sm font-medium text-gray-900">
                            {project.progress}%
                          </div>
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
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
                        <button className="p-1 rounded-full text-gray-400 hover:text-gray-500">
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
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="bg-gray-50 px-4 py-4 sm:px-6">
                <button
                  onClick={() => setShowCreateProjectModal(true)}
                  className="w-full flex justify-center items-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
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
                  Create New Project
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modals */}
        <Modal
          isOpen={showEmployeesModal}
          onClose={() => setShowEmployeesModal(false)}
          title="All Employees"
          size="large"
          actions={
            <button
              onClick={() => setShowEmployeesModal(false)}
              className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Close
            </button>
          }
        >
          <div className="py-4">
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Employee Roster
              </h3>
              <p className="text-sm text-gray-500">
                View and manage all employees in your organization.
              </p>
            </div>
            <div className="mt-4 flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Showing {dashboardData.employees} employees
              </div>
              <Link
                to="/employer/employees"
                className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={() => setShowEmployeesModal(false)}
              >
                Go to Employees Page
              </Link>
            </div>
          </div>
        </Modal>

        <Modal
          isOpen={showProjectsModal}
          onClose={() => setShowProjectsModal(false)}
          title="All Projects"
          size="large"
          actions={
            <button
              onClick={() => setShowProjectsModal(false)}
              className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Close
            </button>
          }
        >
          <div className="py-4">
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Project Portfolio
              </h3>
              <p className="text-sm text-gray-500">
                View and manage all your active and completed projects.
              </p>
            </div>
            <div className="mt-4 flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Showing {dashboardData.projects} active projects
              </div>
              <Link
                to="/employer/projects"
                className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={() => setShowProjectsModal(false)}
              >
                Go to Projects Page
              </Link>
            </div>
          </div>
        </Modal>

        <Modal
          isOpen={showCompletedTasksModal}
          onClose={() => setShowCompletedTasksModal(false)}
          title="Completed Tasks"
          size="large"
          actions={
            <button
              onClick={() => setShowCompletedTasksModal(false)}
              className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Close
            </button>
          }
        >
          <div className="py-4">
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Task Completion Summary
              </h3>
              <p className="text-sm text-gray-500">
                Overview of all completed tasks across all projects.
              </p>
            </div>
            <div className="mt-4 flex justify-between items-center">
              <div className="text-sm text-gray-500">
                {dashboardData.completedTasks} tasks completed
              </div>
              <Link
                to="/employer/tasks"
                className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={() => setShowCompletedTasksModal(false)}
              >
                Go to Tasks Page
              </Link>
            </div>
          </div>
        </Modal>

        <Modal
          isOpen={showPendingTasksModal}
          onClose={() => setShowPendingTasksModal(false)}
          title="Pending Tasks"
          size="large"
          actions={
            <button
              onClick={() => setShowPendingTasksModal(false)}
              className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Close
            </button>
          }
        >
          <div className="py-4">
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Pending Tasks Overview
              </h3>
              <p className="text-sm text-gray-500">
                Review tasks that require attention and follow-up.
              </p>
            </div>
            <div className="mt-4 flex justify-between items-center">
              <div className="text-sm text-gray-500">
                {dashboardData.pendingTasks} tasks pending
              </div>
              <Link
                to="/employer/tasks"
                className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={() => setShowPendingTasksModal(false)}
              >
                Go to Tasks Page
              </Link>
            </div>
          </div>
        </Modal>

        <Modal
          isOpen={showTopPerformerModal}
          onClose={() => setShowTopPerformerModal(false)}
          title="Employee Profile"
          size="medium"
          actions={
            <button
              onClick={() => setShowTopPerformerModal(false)}
              className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Close
            </button>
          }
        >
          <div className="py-4 flex flex-col items-center">
            <img
              className="h-24 w-24 rounded-full mb-4"
              src={dashboardData.topPerformer.avatar}
              alt={dashboardData.topPerformer.name}
            />
            <h4 className="text-xl font-semibold text-gray-900">
              {dashboardData.topPerformer.name}
            </h4>
            <p className="text-sm text-gray-500 mb-4">
              {dashboardData.topPerformer.title}
            </p>

            <div className="mt-4 w-full max-w-md">
              <div className="bg-gray-100 p-4 rounded-lg mb-4">
                <h5 className="font-medium text-gray-900 mb-2">
                  Performance Overview
                </h5>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">
                        Completion Rate
                      </span>
                      <span className="text-sm font-medium text-gray-700">
                        {dashboardData.topPerformer.completionRate}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-green-600 h-2.5 rounded-full"
                        style={{
                          width: `${dashboardData.topPerformer.completionRate}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <Link
                  to={`/employer/employees/${dashboardData.topPerformer.name
                    .replace(/\s+/g, "-")
                    .toLowerCase()}`}
                  className="w-full inline-flex justify-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={() => setShowTopPerformerModal(false)}
                >
                  View Full Profile
                </Link>
              </div>
            </div>
          </div>
        </Modal>

        <Modal
          isOpen={showAllProjectsModal}
          onClose={() => setShowAllProjectsModal(false)}
          title="All Projects"
          size="large"
          actions={
            <button
              onClick={() => setShowAllProjectsModal(false)}
              className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Close
            </button>
          }
        >
          <div className="py-4">
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Project Portfolio
              </h3>
              <p className="text-sm text-gray-500">
                View and manage all your active and completed projects.
              </p>
            </div>
            <div className="overflow-hidden shadow border-b border-gray-200 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Project
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Team Size
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Progress
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dashboardData.recentProjects.map((project) => (
                    <tr key={project.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="bg-indigo-100 rounded-md p-2 mr-4">
                            <svg
                              className="h-5 w-5 text-indigo-600"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {project.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {project.team} members
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="mr-2 text-sm font-medium">
                            {project.progress}%
                          </div>
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
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
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            project.progress < 30
                              ? "bg-red-100 text-red-800"
                              : project.progress < 70
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {project.progress < 30
                            ? "Early Stages"
                            : project.progress < 70
                            ? "In Progress"
                            : "Near Completion"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Showing {dashboardData.recentProjects.length} of{" "}
                {dashboardData.projects} projects
              </div>
              <Link
                to="/employer/projects"
                className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={() => setShowAllProjectsModal(false)}
              >
                Go to Projects Page
              </Link>
            </div>
          </div>
        </Modal>

        <Modal
          isOpen={showCreateProjectModal}
          onClose={() => setShowCreateProjectModal(false)}
          title="Create New Project"
          size="medium"
          actions={
            <>
              <button
                onClick={() => setShowCreateProjectModal(false)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <Link
                to="/employer/create-project"
                className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={() => setShowCreateProjectModal(false)}
              >
                Continue
              </Link>
            </>
          }
        >
          <div className="py-4">
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Create a New Project
              </h3>
              <p className="text-sm text-gray-500">
                Start a new project and assign team members.
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="project-name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Project Name
                </label>
                <input
                  type="text"
                  id="project-name"
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Enter project name"
                />
              </div>
              <div>
                <label
                  htmlFor="project-description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Description
                </label>
                <textarea
                  id="project-description"
                  rows={3}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Enter project description"
                ></textarea>
              </div>
            </div>
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                For more options and detailed configuration, continue to the
                project creation page.
              </p>
            </div>
          </div>
        </Modal>
      </main>
    </div>
  );
};

export default EmployerDashboard;
