import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Modal from "../../components/Modal";

import { useAuth } from "../../contexts/AuthContext";
import {
  useErrorNotification,
  useSuccessNotification,
} from "../../contexts/NotificationContext";
import {
  getEmployees,
  getProjects,
  getTasks,
  getEmployeesPerformance,
  onEmployeePerformanceUpdate,
  recalculateAllProjectsProgress,
  getEmployee,
  getEmployeeProjects,
  getEmployeeTasks,
} from "../../services/firebase";

// Dashboard interface
interface DashboardData {
  employees: number;
  projects: number;
  tasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueProjects: number;
  upcomingDeadlines: number;
  topPerformer: {
    name: string;
    title: string;
    avatar: string;
    completionRate: number;
    projects: number;
    completedTasks?: number;
  } | null;
  recentProjects: {
    id: string;
    name: string;
    progress: number;
    team: number;
  }[];
}

// Mock notifications - we'll keep these for now
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

// Define a type for employee performance metrics for clarity
interface EmployeePerformanceData {
  employeeId?: string;
  id?: string;
  employeeName?: string;
  employeeEmail?: string;
  employeeAvatar?: string;
  employeePosition?: string;
  employeeDepartment?: string;
  metrics: {
    taskCompletionRate: number;
    onTimeCompletionRate: number;
    averageCompletionTime: number;
    checklistItemCompletionRate: number;
    progressScore: number;
    completedTasksCount: number;
    totalTasksCount: number;
  };
}

const EmployerDashboard: React.FC = () => {
  // Auth context
  const { userData, logout } = useAuth() as {
    userData: { id: string; email: string } | null;
    logout: () => Promise<void>;
  };
  const navigate = useNavigate();
  const showError = useErrorNotification();
  const showSuccess = useSuccessNotification();

  // State
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    projects: 0,
    tasks: 0,
    employees: 0,
    completedTasks: 0,
    overdueProjects: 0,
    upcomingDeadlines: 0,
    pendingTasks: 0,
    topPerformer: null,
    recentProjects: [],
  });

  // State for tracking the top performer's employee ID
  const [topPerformerEmpId, _setTopPerformerEmpId] = useState<string | null>(
    null
  );

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

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!userData) return;

      try {
        setLoading(true);

        // Explicitly type userData to fix type issues
        const typedUserData = userData as { id: string; email: string };

        // Get projects for this employer
        const userProjects = await getProjects();
        const filteredProjects = userProjects.filter(
          (p: any) => p.createdBy === typedUserData.id
        );

        // Fetch employees count
        const employeesData = await getEmployees(typedUserData.id);
        // Type assertion for employee data
        const activeEmployees = employeesData.filter(
          (emp: any) => emp.status === "active"
        ).length;

        // Fetch tasks
        const tasksData = await getTasks();
        // Type assertion for task data
        const userTasks = tasksData.filter((task: any) =>
          filteredProjects.some((p: any) => p.id === task.projectId)
        );

        // Calculate stats
        const completedTasks = userTasks.filter(
          (task: any) => task.status === "Completed"
        ).length;
        const pendingTasks = userTasks.length - completedTasks;

        const now = new Date();
        const overdueProjects = filteredProjects.filter((project: any) => {
          const endDate = new Date(project.endDate);
          return endDate < now && project.status !== "Completed";
        }).length;

        // Get upcoming deadlines (projects due in next 7 days)
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
        const upcomingDeadlines = filteredProjects.filter((project: any) => {
          const endDate = new Date(project.endDate);
          return endDate > now && endDate <= sevenDaysFromNow;
        }).length;

        // Mock recent projects for now
        const recentProjects = filteredProjects
          .slice(0, 3)
          .map((project: any) => ({
            id: project.id,
            name: project.name,
            progress: project.progress || 0,
            team: (project.team && project.team.length) || 0,
          }));

        // Get employee performance data
        const employeesPerformance = (await getEmployeesPerformance(
          typedUserData.id
        )) as any[];

        // Find the top performer with highest progress score
        let topPerformerData = null;
        if (employeesPerformance.length > 0) {
          // Filter to only include employees with valid metrics data and cast to known type
          const performersWithMetrics = employeesPerformance
            .filter(
              (emp) =>
                emp &&
                typeof emp.metrics === "object" &&
                emp.metrics?.progressScore > 0
            )
            .map((emp) => emp as unknown as EmployeePerformanceData);

          if (performersWithMetrics.length > 0) {
            // Now TypeScript knows the shape of these objects
            const sortedPerformers = [...performersWithMetrics].sort(
              (a, b) => b.metrics.progressScore - a.metrics.progressScore
            );

            const topPerformer = sortedPerformers[0];

            // Get employee-specific project data
            const employeeId = topPerformer.employeeId || topPerformer.id || "";
            const employeeData = (await getEmployee(employeeId)) as any;
            const employeeProjects = await getEmployeeProjects(employeeId);

            // Get employee tasks data
            const userTasks = await getEmployeeTasks(employeeId);

            topPerformerData = {
              name: employeeData?.name || topPerformer.employeeName,
              title: employeeData?.position || topPerformer.employeePosition,
              avatar: employeeData?.avatar || topPerformer.employeeAvatar,
              completionRate: topPerformer.metrics.taskCompletionRate,
              projects: employeeProjects.length,
              completedTasks:
                topPerformer.metrics.completedTasksCount ||
                userTasks.filter((task: any) => task.status === "Completed")
                  .length,
            };
          }
        }

        // Update dashboard data
        setDashboardData({
          ...dashboardData,
          employees: activeEmployees,
          projects: filteredProjects.length,
          tasks: userTasks.length,
          completedTasks,
          pendingTasks,
          overdueProjects,
          upcomingDeadlines,
          topPerformer: topPerformerData,
          recentProjects: recentProjects || [],
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        // @ts-ignore - Ignore type checking for this call
        showError("Error", "Failed to load dashboard data");

        // In case of error, ensure recentProjects is at least an empty array
        setDashboardData((prev) => ({
          ...prev,
          recentProjects: [],
          topPerformer: null,
        }));
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [userData]);

  // Real-time listener for top performer updates
  useEffect(() => {
    if (!topPerformerEmpId) return;

    console.log(
      "Setting up real-time listener for top performer:",
      topPerformerEmpId
    );

    // Set up the real-time listener for the top performer's metrics
    const unsubscribe = onEmployeePerformanceUpdate((performanceData) => {
      if (performanceData && performanceData.metrics) {
        console.log("Received real-time performance update:", performanceData);

        // Update only the top performer's completion rate in the dashboard data
        setDashboardData((prevData) => {
          if (!prevData.topPerformer) return prevData;

          return {
            ...prevData,
            topPerformer: {
              ...prevData.topPerformer,
              completionRate: Math.round(
                performanceData.metrics.taskCompletionRate
              ),
            },
          };
        });
      }
    }, topPerformerEmpId);

    // Cleanup listener on component unmount
    return () => {
      console.log("Cleaning up top performer listener");
      unsubscribe();
    };
  }, [topPerformerEmpId]);

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

  // Add effect to update all projects' progress
  useEffect(() => {
    const updateAllProjectsProgress = async () => {
      if (!userData?.id) return;

      try {
        // Use the new function to recalculate all projects progress
        const result = await recalculateAllProjectsProgress(userData.id);
        console.log(`Updated progress for ${result.count} projects`);
      } catch (error) {
        console.error("Error updating project progress:", error);
      }
    };

    // Run the update when the dashboard loads
    updateAllProjectsProgress();
  }, [userData?.id]);

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
                    <button
                      onClick={async () => {
                        try {
                          await logout();
                          showSuccess(
                            "Logout Successful",
                            "You have been logged out successfully"
                          );
                          setProfileOpen(false);
                          navigate("/login");
                        } catch (error) {
                          console.error("Logout failed:", error);
                          showError(
                            "Logout Failed",
                            "There was a problem logging you out"
                          );
                        }
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Employees Card */}
          <div
            className="relative bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow duration-200 cursor-pointer"
            onClick={() => setShowEmployeesModal(true)}
          >
            {loading ? (
              <div className="p-6 flex flex-col items-center justify-center min-h-[160px]">
                <div className="animate-pulse w-16 h-16 bg-gray-200 rounded-full mb-4"></div>
                <div className="animate-pulse w-1/2 h-4 bg-gray-200 rounded"></div>
              </div>
            ) : (
              <div className="p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-indigo-50 text-indigo-600">
                    <svg
                      className="h-8 w-8"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                  </div>
                  <div className="ml-5">
                    <h2 className="text-lg font-medium text-gray-900">
                      Total Employees
                    </h2>
                    <div className="mt-1 flex items-baseline">
                      <p className="text-2xl font-semibold text-indigo-600">
                        {dashboardData.employees}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Projects Card */}
          <div
            className="relative bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow duration-200 cursor-pointer"
            onClick={() => setShowProjectsModal(true)}
          >
            {loading ? (
              <div className="p-6 flex flex-col items-center justify-center min-h-[160px]">
                <div className="animate-pulse w-16 h-16 bg-gray-200 rounded-full mb-4"></div>
                <div className="animate-pulse w-1/2 h-4 bg-gray-200 rounded"></div>
              </div>
            ) : (
              <div className="p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-50 text-blue-600">
                    <svg
                      className="h-8 w-8"
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
                  <div className="ml-5">
                    <h2 className="text-lg font-medium text-gray-900">
                      Active Projects
                    </h2>
                    <div className="mt-1 flex items-baseline">
                      <p className="text-2xl font-semibold text-blue-600">
                        {dashboardData.projects}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Completed Tasks Card */}
          <div
            className="relative bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow duration-200 cursor-pointer"
            onClick={() => setShowCompletedTasksModal(true)}
          >
            {loading ? (
              <div className="p-6 flex flex-col items-center justify-center min-h-[160px]">
                <div className="animate-pulse w-16 h-16 bg-gray-200 rounded-full mb-4"></div>
                <div className="animate-pulse w-1/2 h-4 bg-gray-200 rounded"></div>
              </div>
            ) : (
              <div className="p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-50 text-green-600">
                    <svg
                      className="h-8 w-8"
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
                  <div className="ml-5">
                    <h2 className="text-lg font-medium text-gray-900">
                      Completed Tasks
                    </h2>
                    <div className="mt-1 flex items-baseline">
                      <p className="text-2xl font-semibold text-green-600">
                        {dashboardData.completedTasks}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Pending Tasks Card */}
          <div
            className="relative bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow duration-200 cursor-pointer"
            onClick={() => setShowPendingTasksModal(true)}
          >
            {loading ? (
              <div className="p-6 flex flex-col items-center justify-center min-h-[160px]">
                <div className="animate-pulse w-16 h-16 bg-gray-200 rounded-full mb-4"></div>
                <div className="animate-pulse w-1/2 h-4 bg-gray-200 rounded"></div>
              </div>
            ) : (
              <div className="p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-amber-50 text-amber-600">
                    <svg
                      className="h-8 w-8"
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
                  <div className="ml-5">
                    <h2 className="text-lg font-medium text-gray-900">
                      Pending Tasks
                    </h2>
                    <div className="mt-1 flex items-baseline">
                      <p className="text-2xl font-semibold text-amber-600">
                        {dashboardData.pendingTasks}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Top Performer Card - 1/3 width on large screens */}
          <div
            className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow duration-200 cursor-pointer"
            onClick={() => setShowTopPerformerModal(true)}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">
                Top Performer
              </h3>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTopPerformerModal(true);
                }}
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
              >
                View details
              </button>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center">
                <div className="animate-pulse w-24 h-24 bg-gray-200 rounded-full mb-4"></div>
                <div className="animate-pulse w-2/3 h-4 bg-gray-200 rounded mb-2"></div>
                <div className="animate-pulse w-1/2 h-3 bg-gray-200 rounded mb-6"></div>
                <div className="animate-pulse w-full h-4 bg-gray-200 rounded mb-4"></div>
                <div className="animate-pulse w-full h-16 bg-gray-200 rounded mb-4"></div>
              </div>
            ) : dashboardData.topPerformer ? (
              <div className="flex flex-col items-center">
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

                <div className="w-full mt-8">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-500">
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

                  <div className="mt-6 grid grid-cols-1 gap-1">
                    <div className="flex justify-between p-2 bg-gray-50 rounded">
                      <div className="text-sm text-gray-500">
                        Active Projects
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {dashboardData.topPerformer.projects}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64">
                <svg
                  className="h-16 w-16 text-gray-300 mb-4"
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
                <p className="text-gray-500">
                  No top performer data available yet
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  Data will appear once employees complete tasks
                </p>
              </div>
            )}
          </div>

          {/* Recent Projects Card - 2/3 width on large screens */}
          <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">
                Recent Projects
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowAllProjectsModal(true)}
                  className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                >
                  View all
                </button>
                <button
                  onClick={() => setShowCreateProjectModal(true)}
                  className="ml-2 px-3 py-1 bg-indigo-600 text-white text-sm font-medium rounded hover:bg-indigo-700 transition-colors duration-200"
                >
                  New Project
                </button>
              </div>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse flex flex-col space-y-3"
                  >
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                    <div className="h-6 bg-gray-200 rounded w-full"></div>
                  </div>
                ))}
              </div>
            ) : dashboardData.recentProjects &&
              dashboardData.recentProjects.length > 0 ? (
              <div className="overflow-hidden">
                <ul className="divide-y divide-gray-200">
                  {dashboardData.recentProjects.map((project) => (
                    <li key={project.id} className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {project.name}
                          </p>
                          <div className="mt-2 flex items-center text-sm text-gray-500">
                            <svg
                              className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span>{project.team} team members</span>
                          </div>
                        </div>
                        <div className="flex-shrink-0 ml-5">
                          <p className="text-sm font-medium text-gray-900">
                            {project.progress}%
                          </p>
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="flex items-center">
                          <div className="flex-1">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`${
                                  project.progress < 30
                                    ? "bg-red-500"
                                    : project.progress < 70
                                    ? "bg-yellow-500"
                                    : "bg-green-500"
                                } h-2 rounded-full`}
                                style={{ width: `${project.progress}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64">
                <svg
                  className="h-16 w-16 text-gray-300 mb-4"
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
                <p className="text-gray-500">No projects available yet</p>
                <button
                  onClick={() => setShowCreateProjectModal(true)}
                  className="mt-4 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded hover:bg-indigo-700 transition-colors duration-200"
                >
                  Create your first project
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal for Top Performer details */}
      <Modal
        isOpen={showTopPerformerModal}
        onClose={() => setShowTopPerformerModal(false)}
        title="Top Performer Details"
      >
        {loading ? (
          <div className="animate-pulse flex flex-col items-center py-8">
            <div className="w-24 h-24 bg-gray-200 rounded-full mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="w-full h-4 bg-gray-200 rounded mb-2"></div>
            <div className="w-full h-4 bg-gray-200 rounded mb-4"></div>
            <div className="w-full h-32 bg-gray-200 rounded"></div>
          </div>
        ) : dashboardData.topPerformer ? (
          <div className="py-8 flex flex-col items-center">
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

            <div className="w-full max-w-md">
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h5 className="text-sm font-medium text-gray-700 mb-3">
                  Performance Metrics
                </h5>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-500">
                        Task Completion Rate
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

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white p-4 border border-gray-200 rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {dashboardData.topPerformer.projects}
                    </div>
                    <div className="text-xs text-gray-500">Projects</div>
                  </div>
                </div>
                <div className="bg-white p-4 border border-gray-200 rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {dashboardData.topPerformer.completedTasks || 0}
                    </div>
                    <div className="text-xs text-gray-500">Tasks Completed</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-8 flex flex-col items-center">
            <svg
              className="h-20 w-20 text-gray-300 mb-4"
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
            <h4 className="text-xl font-semibold text-gray-900">
              No Top Performer Yet
            </h4>
            <p className="text-gray-500 mb-8 text-center">
              Once your team completes more tasks, we'll identify your top
              performer based on task completion, efficiency, and quality of
              work.
            </p>
            <Link
              to="/employer/employees"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              View All Employees
            </Link>
          </div>
        )}
      </Modal>

      {/* Other modals remain the same */}
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
    </div>
  );
};

export default EmployerDashboard;
