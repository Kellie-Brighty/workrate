import { useState, useEffect } from "react";
import Modal from "../../components/Modal";
import { useAuth } from "../../contexts/AuthContext";
import {
  onEmployeeTasksUpdate,
  getEmployeeByEmail,
  updateTask,
  getProject,
  getUserData,
  getEmployeesPerformance,
  deleteTask,
  createDueDateRenegotiationRequest,
  getEmployeeRenegotiationRequests,
  type DueDateRenegotiationRequest,
} from "../../services/firebase";
import type { TaskData } from "../../services/firebase";

// Define an interface for Employee data
interface EmployeeData {
  id: string;
  name: string;
  email: string;
  position?: string;
  department?: string;
  employerId?: string;
  status?: string;
  [key: string]: any; // Allow other properties
}

// Extended interface for task with additional properties set during formatting
interface FormattedTask extends TaskData {
  id: string;
  projectName?: string;
  createdByName?: string;
  createdByAvatar?: string;
  dueDateRenegotiationStatus?: "pending" | "approved" | "rejected";
  timeEstimate?: string;
  timeSpent?: number;
}

// Extended interface for project data returned from getProject
interface ProjectData {
  id: string;
  name: string;
  [key: string]: any; // Allow other properties
}

// Extended interface for user data returned from getUserData
interface UserData {
  id: string;
  fullName: string;
  avatar?: string;
  [key: string]: any; // Allow other properties
}

// Helper function to calculate time remaining
const calculateTimeRemaining = (
  dueDate: string
): { days: number; hours: number } => {
  const now = new Date();
  const due = new Date(dueDate);
  const diffMs = due.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(
    (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );

  return { days: diffDays, hours: diffHours };
};

// Helper function to get nearest upcoming task
const getUpcomingTask = (
  tasks: DisplayTask[]
): {
  task: DisplayTask | null;
  timeRemaining: { days: number; hours: number } | null;
} => {
  if (!tasks.length) return { task: null, timeRemaining: null };

  // Filter out completed tasks and sort by due date (closest first)
  const incompleteTasks = tasks.filter((task) => task.status !== "Completed");
  if (!incompleteTasks.length) return { task: null, timeRemaining: null };

  const sortedTasks = [...incompleteTasks].sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );

  const closestTask = sortedTasks[0];
  const timeRemaining = calculateTimeRemaining(closestTask.dueDate);

  return { task: closestTask, timeRemaining };
};

// Helper function to format task data from Firebase
const formatTask = async (task: FormattedTask) => {
  let projectData: ProjectData | null = null;
  let creatorData: UserData | null = null;

  // Fetch project data if projectId exists
  if (task.projectId) {
    try {
      projectData = (await getProject(task.projectId)) as ProjectData;
      // Store the project name in the task for easier access
      if (projectData) {
        task.projectName = projectData.name;
      }
    } catch (error) {
      console.error("Error fetching project:", error);
    }
  }

  // Fetch creator data if createdBy exists
  if (task.createdBy) {
    try {
      creatorData = (await getUserData(task.createdBy)) as UserData;
      // Store the creator name in the task for easier access
      if (creatorData) {
        task.createdByName = creatorData.fullName;
        task.createdByAvatar = creatorData.avatar;
      }
    } catch (error) {
      console.error("Error fetching creator:", error);
    }
  }

  return {
    id: task.id,
    title: task.title || "Untitled Task",
    description: task.description || "",
    status: task.status || "To Do",
    priority: task.priority || "Medium",
    dueDate: task.dueDate || new Date().toISOString().split("T")[0],
    project: projectData || {
      id: task.projectId || "",
      name: (projectData as any)?.name || task.projectName || "Unknown Project",
    },
    assignedBy: {
      id: task.createdBy || "",
      name: creatorData?.fullName || task.createdByName || "Unknown",
      avatar:
        creatorData?.avatar ||
        task.createdByAvatar ||
        "https://randomuser.me/api/portraits/men/1.jpg",
    },
    checklist: Array.isArray(task.checklist) ? task.checklist : [],
    attachments: Array.isArray(task.attachments) ? task.attachments : [],
    timeEstimate: task.timeEstimate || "",
    timeSpent: task.timeSpent || 0,
    createdAt: task.createdAt,
    estimatedHours: task.estimatedHours,
    timeUnit: task.timeUnit,
  };
};

// Define the type for the tasks state
type DisplayTask = {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: string;
  project: { id: string; name: string; startDate?: string };
  assignedBy: { id: string; name: string; avatar: string };
  checklist: any[];
  attachments: any[];
  timeEstimate: string;
  timeSpent: number;
  dueDateRenegotiationStatus?: "pending" | "approved" | "rejected";
  timeUnit?: "days" | "hours";
  estimatedHours?: number;
};

// Define types for other state variables
type TaskToComplete = {
  id: string;
  title: string;
  newStatus: string;
};

// Helper to format remaining time
function formatRemainingTime(endDate: Date | null): string {
  if (!endDate) return "N/A";
  const now = new Date();
  const diffMs = endDate.getTime() - now.getTime();
  const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
  if (diffHours < 0) return "Overdue";
  if (diffHours < 24) return `${diffHours} hours remaining`;
  const diffDays = Math.ceil(diffHours / 24);
  return `${diffDays} days remaining`;
}

// Helper to calculate due date for hourly-based tasks
function getTaskDueDate(task: any, _project: any) {
  if (task.timeUnit === "hours" && task.estimatedHours) {
    // Strictly use task.createdAt for hourly-based tasks
    if (!task.createdAt) return null;
    let baseTime: Date | null = null;
    if (typeof task.createdAt === "object" && "seconds" in task.createdAt) {
      baseTime = new Date(task.createdAt.seconds * 1000);
    } else {
      baseTime = new Date(task.createdAt);
    }
    if (!baseTime || isNaN(baseTime.getTime())) return null;
    const calculatedDueDate = new Date(
      baseTime.getTime() + task.estimatedHours * 60 * 60 * 1000
    );

    return calculatedDueDate;
  }
  if (!task.dueDate) return null;
  const dueDate = new Date(task.dueDate);
  if (isNaN(dueDate.getTime())) return null;
  return dueDate;
}

const Tasks = () => {
  const { userData } = useAuth();
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<DisplayTask[]>([]);
  const [selectedTask, setSelectedTask] = useState<DisplayTask | null>(null);
  const [showTaskDetails, setShowTaskDetails] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [projectFilter, setProjectFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Top performers state
  const [topPerformers, setTopPerformers] = useState<any[]>([]);
  const [loadingPerformers, setLoadingPerformers] = useState(true);

  // Modal states
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [taskToDelete, _setTaskToDelete] = useState<string | null>(null);
  const [showTaskCompleteModal, setShowTaskCompleteModal] = useState(false);
  const [taskToComplete, setTaskToComplete] = useState<TaskToComplete | null>(
    null
  );

  // Due date renegotiation states
  const [showRenegotiateModal, setShowRenegotiateModal] = useState(false);
  const [renegotiationData, setRenegotiationData] = useState({
    requestedDueDate: "",
    reason: "",
  });
  const [_renegotiationRequests, setRenegotiationRequests] = useState<
    DueDateRenegotiationRequest[]
  >([]);
  const [_loadingRenegotiations, setLoadingRenegotiations] = useState(false);

  // Upcoming task state
  const [upcomingTask, setUpcomingTask] = useState<DisplayTask | null>(null);
  const [upcomingTimeRemaining, setUpcomingTimeRemaining] = useState<{
    days: number;
    hours: number;
  } | null>(null);

  // Add state for countdown
  const [countdown, setCountdown] = useState<string>("");

  // Set up real-time listener for tasks
  useEffect(() => {
    if (!userData?.email) return;

    setLoading(true);

    const setupTasksListener = async () => {
      try {
        // Get employee record by email
        const employeeData = await getEmployeeByEmail(userData.email);

        if (!employeeData) {
          console.error("No employee record found for email:", userData.email);
          setLoading(false);
          return;
        }

        console.log("Setting up tasks listener for employee:", employeeData.id);

        // Set up the listener using the employee ID
        const unsubscribe = onEmployeeTasksUpdate(async (updatedTasks) => {
          console.log("Received tasks update:", updatedTasks.length, "tasks");

          // Process each task with detailed information
          const formattedTasksPromises = updatedTasks.map(formatTask);
          const formattedTasks = await Promise.all(formattedTasksPromises);

          setTasks(formattedTasks);
          setLoading(false);
        }, employeeData.id);

        return unsubscribe;
      } catch (error) {
        console.error("Error setting up tasks listener:", error);
        setLoading(false);
        return () => {};
      }
    };

    const unsubscribePromise = setupTasksListener();

    return () => {
      unsubscribePromise.then((unsubscribe) => unsubscribe && unsubscribe());
    };
  }, [userData?.email]);

  // Fetch top performers
  useEffect(() => {
    if (!userData?.email) return;

    const fetchTopPerformers = async () => {
      setLoadingPerformers(true);
      try {
        // First get the employee data to find their employer
        const employeeData = (await getEmployeeByEmail(
          userData.email
        )) as EmployeeData;

        if (!employeeData || !employeeData.employerId) {
          console.error("No employee record or employer found");
          setLoadingPerformers(false);
          return;
        }

        // Get performance data for all employees under the same employer
        const employeesPerformance = await getEmployeesPerformance(
          employeeData.employerId
        );

        // Cast the entire array and filter for valid entries
        const validPerformers = (employeesPerformance as any[]).filter(
          (emp) =>
            emp &&
            typeof emp.metrics === "object" &&
            emp.metrics?.progressScore > 0
        );

        // Sort by overall progress score (highest first)
        const sortedPerformance = validPerformers.sort(
          (a, b) => b.metrics.progressScore - a.metrics.progressScore
        );

        // Take the top 3 performers
        setTopPerformers(sortedPerformance.slice(0, 3));
      } catch (error) {
        console.error("Error fetching top performers:", error);
      } finally {
        setLoadingPerformers(false);
      }
    };

    fetchTopPerformers();
  }, [userData?.email]);

  // Add effect to load employee's renegotiation requests
  useEffect(() => {
    const fetchRenegotiationRequests = async () => {
      if (!userData?.email) return;

      try {
        // Get employee record by email
        const employeeData = (await getEmployeeByEmail(
          userData.email
        )) as EmployeeData;
        if (!employeeData) return;

        setLoadingRenegotiations(true);
        const requests = (await getEmployeeRenegotiationRequests(
          employeeData.id
        )) as unknown as DueDateRenegotiationRequest[];
        setRenegotiationRequests(requests);
      } catch (error) {
        console.error("Error fetching renegotiation requests:", error);
      } finally {
        setLoadingRenegotiations(false);
      }
    };

    fetchRenegotiationRequests();
  }, [userData?.email]);

  // After tasks are updated from the database, update the upcoming task/time
  useEffect(() => {
    const updateUpcoming = () => {
      const { task, timeRemaining } = getUpcomingTask(tasks);
      setUpcomingTask(task);
      setUpcomingTimeRemaining(timeRemaining);
    };
    updateUpcoming();
    const interval = setInterval(updateUpcoming, 60 * 1000); // update every minute
    return () => clearInterval(interval);
  }, [tasks]);

  // Add effect to update countdown for the upcoming deadline
  useEffect(() => {
    if (!upcomingTask) return;
    const updateCountdown = () => {
      const dueDate = getTaskDueDate(upcomingTask, upcomingTask.project);
      if (!dueDate) {
        setCountdown("N/A");
        return;
      }
      const now = new Date();
      const diffMs = dueDate.getTime() - now.getTime();
      if (diffMs <= 0) {
        setCountdown("Overdue");
        return;
      }
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
      setCountdown(`${hours}h ${minutes}m ${seconds}s`);
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [upcomingTask]);

  // Apply filters to tasks
  const filteredTasks = tasks.filter((task) => {
    // Status filter
    if (statusFilter !== "All" && task.status !== statusFilter) return false;

    // Priority filter
    if (priorityFilter !== "All" && task.priority !== priorityFilter)
      return false;

    // Project filter
    if (projectFilter !== "All" && task.project.name !== projectFilter)
      return false;

    // Search filter
    if (
      searchQuery.trim() !== "" &&
      !task.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !task.description.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    return true;
  });

  // Get unique projects for the filter
  const projects = ["All", ...new Set(tasks.map((task) => task.project.name))];

  // Handle checklist item toggle
  const handleChecklistToggle = async (
    taskId: string,
    checklistItemId: number
  ) => {
    // Find the task and updated checklist
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const updatedChecklist = task.checklist.map((item) => {
      if (item.id === checklistItemId) {
        return { ...item, completed: !item.completed };
      }
      return item;
    });

    try {
      // Update in Firebase
      await updateTask(taskId, { checklist: updatedChecklist });

      // Update in local state (will be overridden by real-time update)
      setTasks((prevTasks) =>
        prevTasks.map((t) => {
          if (t.id === taskId) {
            return { ...t, checklist: updatedChecklist };
          }
          return t;
        })
      );

      // Update selected task if it's open
      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask({ ...selectedTask, checklist: updatedChecklist });
      }
    } catch (error) {
      console.error("Error updating checklist:", error);
    }
  };

  // Handle task status change
  const handleStatusChange = (taskId: string, newStatus: string) => {
    // If task is being marked as completed, show confirmation
    if (newStatus === "Completed") {
      const task = tasks.find((t) => t.id === taskId);
      if (task) {
        setTaskToComplete({
          id: taskId,
          title: task.title,
          newStatus,
        });
        setShowTaskCompleteModal(true);
      }
    } else {
      // Otherwise, update immediately
      updateTaskStatus(taskId, newStatus);
    }
  };

  // Function to actually update task status
  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      // Update in Firebase - use type assertion for the status field
      await updateTask(taskId, {
        status: newStatus as
          | "Not Started"
          | "In Progress"
          | "Completed"
          | "Overdue",
      });

      // Update in local state (will be overridden by real-time update)
      setTasks((prevTasks) =>
        prevTasks.map((task) => {
          if (task.id === taskId) {
            return { ...task, status: newStatus };
          }
          return task;
        })
      );

      // Update selected task if it's open
      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask({ ...selectedTask, status: newStatus });
      }
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  const handleOpenTaskDetails = (task: DisplayTask) => {
    setSelectedTask(task);
    setShowTaskDetails(true);
  };

  const handleCloseTaskDetails = () => {
    setShowTaskDetails(false);
    setSelectedTask(null);
  };

  const confirmDeleteTask = async () => {
    if (taskToDelete) {
      try {
        // Call the Firebase delete function
        await deleteTask(taskToDelete);

        // Update local state
        setTasks(tasks.filter((task) => task.id !== taskToDelete));
        if (selectedTask && selectedTask.id === taskToDelete) {
          setShowTaskDetails(false);
        }
      } catch (error) {
        console.error("Error deleting task:", error);
      } finally {
        setShowDeleteConfirmModal(false);
      }
    }
  };

  // Calculate task progress based on checklist
  const calculateProgress = (task: any) => {
    if (task.checklist.length === 0) return 0;
    const completedItems = task.checklist.filter(
      (item: any) => item.completed
    ).length;
    return Math.round((completedItems / task.checklist.length) * 100);
  };

  // Handle renegotiation modal open
  const handleOpenRenegotiateModal = () => {
    if (!selectedTask) return;

    setRenegotiationData({
      requestedDueDate: selectedTask.dueDate,
      reason: "",
    });
    setShowRenegotiateModal(true);
  };

  // Handle renegotiation data change
  const handleRenegotiationChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setRenegotiationData({
      ...renegotiationData,
      [e.target.name]: e.target.value,
    });
  };

  // Submit renegotiation request
  const submitRenegotiationRequest = async () => {
    if (!selectedTask || !userData?.email) return;

    try {
      // Get employee ID from email
      const employeeData = (await getEmployeeByEmail(
        userData.email
      )) as EmployeeData;
      if (!employeeData) {
        console.error("Employee data not found");
        return;
      }

      // Create the request
      await createDueDateRenegotiationRequest({
        taskId: selectedTask.id,
        employeeId: employeeData.id,
        employeeName: employeeData.name,
        taskTitle: selectedTask.title,
        projectId: selectedTask.project.id,
        projectName: selectedTask.project.name,
        currentDueDate: selectedTask.dueDate,
        requestedDueDate: renegotiationData.requestedDueDate,
        reason: renegotiationData.reason,
        status: "pending",
      });

      // Update local state to show pending status
      setTasks(
        tasks.map((task) => {
          if (task.id === selectedTask.id) {
            return {
              ...task,
              dueDateRenegotiationStatus: "pending",
            };
          }
          return task;
        })
      );

      // Close modals
      setShowRenegotiateModal(false);

      // Refresh renegotiation requests
      const requests = (await getEmployeeRenegotiationRequests(
        employeeData.id
      )) as unknown as DueDateRenegotiationRequest[];
      setRenegotiationRequests(requests);
    } catch (error) {
      console.error("Error submitting renegotiation request:", error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-3">
        <h1 className="text-3xl font-bold text-gray-800">My Tasks</h1>
        <div className="w-full md:w-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Search tasks..."
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

      {/* Upcoming Task with Closest Due Date */}
      {!loading &&
        (() => {
          if (upcomingTask && upcomingTimeRemaining) {
            const isUrgent = upcomingTimeRemaining.days < 2;
            return (
              <div
                className={`mb-6 p-4 rounded-lg shadow ${
                  isUrgent
                    ? "bg-red-50 border border-red-200"
                    : "bg-blue-50 border-blue-200"
                }`}
              >
                <div className="flex flex-col md:flex-row justify-between">
                  <div>
                    <div className="flex items-center mb-1">
                      <svg
                        className={`h-5 w-5 mr-2 ${
                          isUrgent ? "text-red-500" : "text-blue-500"
                        }`}
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
                      <span
                        className={`font-medium ${
                          isUrgent ? "text-red-700" : "text-blue-700"
                        }`}
                      >
                        Upcoming Deadline
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {upcomingTask.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Project: {upcomingTask.project.name}
                    </p>
                  </div>
                  <div
                    className={`mt-3 md:mt-0 text-right ${
                      isUrgent ? "text-red-700" : "text-blue-700"
                    }`}
                  >
                    <div className="text-xl font-bold">
                      {upcomingTimeRemaining.days > 0
                        ? `${upcomingTimeRemaining.days} day${
                            upcomingTimeRemaining.days !== 1 ? "s" : ""
                          }`
                        : ""}
                      {upcomingTimeRemaining.hours > 0 ||
                      upcomingTimeRemaining.days === 0
                        ? ` ${upcomingTimeRemaining.hours} hour${
                            upcomingTimeRemaining.hours !== 1 ? "s" : ""
                          }`
                        : ""}
                    </div>

                    <div className="text-xs text-gray-500 mt-1">
                      Due on{" "}
                      {new Date(upcomingTask.dueDate).toLocaleDateString()}
                    </div>
                    {upcomingTask && (
                      <div className="text-sm font-semibold">
                        Remaining:{" "}
                        {formatRemainingTime(
                          getTaskDueDate(upcomingTask, upcomingTask.project)
                        )}
                      </div>
                    )}
                    <div className="text-sm font-semibold">
                      Countdown: {countdown}
                    </div>
                  </div>
                </div>
                <div className="mt-2 flex justify-end">
                  <button
                    onClick={() => handleOpenTaskDetails(upcomingTask)}
                    className={`text-sm px-3 py-1 rounded ${
                      isUrgent
                        ? "bg-red-200 text-red-800 hover:bg-red-300"
                        : "bg-blue-200 text-blue-800 hover:bg-blue-300"
                    }`}
                  >
                    View Task
                  </button>
                </div>
              </div>
            );
          }
          return null;
        })()}

      {/* Top Performers Section */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Top Performers
        </h2>

        {loadingPerformers ? (
          <div className="flex space-x-6 py-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex-1 animate-pulse flex flex-col items-center"
              >
                <div className="rounded-full bg-gray-200 h-16 w-16 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-20 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-16 mb-3"></div>
                <div className="h-2 bg-gray-200 rounded w-full mb-2"></div>
              </div>
            ))}
          </div>
        ) : topPerformers.length > 0 ? (
          <div className="flex flex-wrap gap-4">
            {topPerformers.map((performer) => (
              <div
                key={performer.employeeId}
                className="flex-1 min-w-[240px] bg-gray-50 rounded-lg p-4 flex flex-col items-center"
              >
                <img
                  src={performer.employeeAvatar}
                  alt={performer.employeeName}
                  className="h-16 w-16 rounded-full mb-2"
                />
                <h3 className="font-medium text-gray-900">
                  {performer.employeeName}
                </h3>
                <p className="text-sm text-gray-500 mb-3">
                  {performer.employeePosition}
                </p>

                <div className="w-full mb-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Task Completion</span>
                    <span className="font-medium">
                      {Math.round(performer.metrics.taskCompletionRate)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-green-500 h-1.5 rounded-full"
                      style={{
                        width: `${performer.metrics.taskCompletionRate}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="w-full mb-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span>On-Time Completion</span>
                    <span className="font-medium">
                      {Math.round(performer.metrics.onTimeCompletionRate)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-blue-500 h-1.5 rounded-full"
                      style={{
                        width: `${performer.metrics.onTimeCompletionRate}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-500">No performance data available yet.</p>
          </div>
        )}
      </div>

      {/* Filter section */}
      <div className="bg-white shadow rounded-lg p-4 mb-6 overflow-x-auto">
        <div className="flex space-x-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="All">All</option>
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Priority
            </label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="All">All</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Project
            </label>
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              {projects.map((project) => (
                <option key={project} value={project}>
                  {project}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <>
          {/* Tasks grid */}
          {filteredTasks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleOpenTaskDetails(task)}
                >
                  <div className="p-5">
                    <div className="flex justify-between mb-2">
                      <span
                        className={`text-xs font-medium px-2.5 py-0.5 rounded ${
                          task.priority === "Low"
                            ? "bg-blue-100 text-blue-800"
                            : task.priority === "Medium"
                            ? "bg-yellow-100 text-yellow-800"
                            : task.priority === "High"
                            ? "bg-orange-100 text-orange-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {task.priority}
                      </span>
                      <span
                        className={`text-xs font-medium px-2.5 py-0.5 rounded ${
                          task.status === "To Do"
                            ? "bg-yellow-50 text-yellow-700"
                            : task.status === "In Progress"
                            ? "bg-indigo-100 text-indigo-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {task.status}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-800 line-clamp-1">
                      {task.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {task.description}
                    </p>

                    <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
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
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      </div>
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
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span className="text-xs text-gray-500">
                          {task.timeUnit === "hours"
                            ? `Est: ${task.estimatedHours} hours`
                            : `Est: ${task.timeEstimate}`}
                        </span>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                      <div
                        className="bg-indigo-600 h-2 rounded-full"
                        style={{ width: `${calculateProgress(task)}%` }}
                      ></div>
                    </div>

                    <div className="flex justify-between items-center flex-wrap gap-2">
                      <div className="flex items-center">
                        <img
                          src={task.assignedBy.avatar}
                          alt={task.assignedBy.name}
                          className="w-6 h-6 rounded-full mr-2"
                        />
                        <span className="text-xs text-gray-500">
                          From: {task.assignedBy.name}
                        </span>
                      </div>
                      <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded">
                        {task.project.name}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Empty state
            <div className="bg-white shadow rounded-lg p-8 text-center">
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
                  strokeWidth="1.5"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No tasks found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery ||
                statusFilter !== "All" ||
                priorityFilter !== "All" ||
                projectFilter !== "All"
                  ? "Try adjusting your search or filter settings."
                  : "You don't have any tasks assigned yet."}
              </p>
            </div>
          )}
        </>
      )}

      {/* Task Detail Modal - with Delete button updated */}
      {showTaskDetails && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overscroll-contain overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 flex-shrink-0 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span
                      className={`text-xs font-medium px-2.5 py-0.5 rounded ${
                        selectedTask.priority === "Low"
                          ? "bg-blue-100 text-blue-800"
                          : selectedTask.priority === "Medium"
                          ? "bg-yellow-100 text-yellow-800"
                          : selectedTask.priority === "High"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {selectedTask.priority}
                    </span>
                    <span
                      className={`text-xs font-medium px-2.5 py-0.5 rounded ${
                        selectedTask.status === "To Do"
                          ? "bg-yellow-50 text-yellow-700"
                          : selectedTask.status === "In Progress"
                          ? "bg-indigo-100 text-indigo-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {selectedTask.status}
                    </span>
                    <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded">
                      {selectedTask.project.name}
                    </span>

                    {/* Show badge if there's a pending renegotiation */}
                    {selectedTask.dueDateRenegotiationStatus === "pending" && (
                      <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                        Due Date Change Requested
                      </span>
                    )}
                    {selectedTask.dueDateRenegotiationStatus === "approved" && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        Due Date Change Approved
                      </span>
                    )}
                    {selectedTask.dueDateRenegotiationStatus === "rejected" && (
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                        Due Date Change Rejected
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 break-words">
                    {selectedTask.title}
                  </h2>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCloseTaskDetails();
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
                <div className="md:col-span-2">
                  {/* Description */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-2">Description</h3>
                    <p className="text-gray-700">{selectedTask.description}</p>
                  </div>

                  {/* Checklist */}
                  <div className="mb-8">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-lg font-semibold">Checklist</h3>
                      <span className="text-sm text-gray-500">
                        {
                          selectedTask.checklist.filter(
                            (item: any) => item.completed
                          ).length
                        }{" "}
                        of {selectedTask.checklist.length} complete
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                      <div
                        className="bg-indigo-600 h-2 rounded-full"
                        style={{
                          width: `${calculateProgress(selectedTask)}%`,
                        }}
                      ></div>
                    </div>
                    <ul className="space-y-3">
                      {selectedTask.checklist.map((item: any) => (
                        <li
                          key={item.id}
                          className="flex items-center"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleChecklistToggle(selectedTask.id, item.id);
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={item.completed}
                            onChange={() => {}} // onChange handled by onClick above
                            className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 mr-3"
                          />
                          <span
                            className={`${
                              item.completed
                                ? "line-through text-gray-500"
                                : "text-gray-700"
                            }`}
                          >
                            {item.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Attachments */}
                  {selectedTask.attachments.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold mb-2">
                        Attachments
                      </h3>
                      <ul className="space-y-2">
                        {selectedTask.attachments.map((attachment: any) => (
                          <li
                            key={attachment.id}
                            className="flex items-center p-2 bg-gray-50 rounded"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 text-gray-500 mr-3"
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
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-indigo-600 truncate">
                                {attachment.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {attachment.size} • Added on{" "}
                                {new Date(attachment.date).toLocaleDateString()}
                              </p>
                            </div>
                            <button className="ml-2 text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                              Download
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  {/* Task Info */}
                  <h3 className="text-lg font-semibold mb-4">Task Info</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">
                        Status
                      </h4>
                      <select
                        value={selectedTask.status}
                        onChange={(e) =>
                          handleStatusChange(selectedTask.id, e.target.value)
                        }
                        onClick={(e) => e.stopPropagation()}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                      >
                        <option value="To Do">To Do</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-500">
                        Project
                      </h4>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedTask.project.name}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-500">
                        Assigned By
                      </h4>
                      <div className="mt-1 flex items-center">
                        <img
                          src={selectedTask.assignedBy.avatar}
                          alt={selectedTask.assignedBy.name}
                          className="h-8 w-8 rounded-full mr-2"
                        />
                        <span className="text-sm text-gray-900">
                          {selectedTask.assignedBy.name}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-500">
                        Due Date
                      </h4>
                      <div className="mt-1 flex items-center justify-between">
                        <p className="text-sm text-gray-900">
                          {new Date(selectedTask.dueDate).toLocaleDateString(
                            undefined,
                            {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </p>

                        {/* Renegotiate button - only show if not already pending */}
                        {!selectedTask.dueDateRenegotiationStatus && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenRenegotiateModal();
                            }}
                            className="text-xs text-indigo-600 hover:text-indigo-800"
                          >
                            Request Change
                          </button>
                        )}
                      </div>

                      {/* Show renegotiation status if applicable */}
                      {selectedTask.dueDateRenegotiationStatus && (
                        <div className="mt-2 text-xs">
                          {selectedTask.dueDateRenegotiationStatus ===
                            "pending" && (
                            <span className="text-yellow-600">
                              Due date change request is pending approval
                            </span>
                          )}
                          {selectedTask.dueDateRenegotiationStatus ===
                            "approved" && (
                            <span className="text-green-600">
                              Due date change was approved
                            </span>
                          )}
                          {selectedTask.dueDateRenegotiationStatus ===
                            "rejected" && (
                            <span className="text-red-600">
                              Due date change was rejected
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-500">
                        Time
                      </h4>
                      <div className="mt-1 grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-xs text-gray-500">Estimated</p>
                          <p className="text-sm text-gray-900">
                            {selectedTask.timeUnit === "hours"
                              ? `${selectedTask.estimatedHours} hours`
                              : selectedTask.timeEstimate}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Spent</p>
                          <p className="text-sm text-gray-900">
                            {selectedTask.timeSpent}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t flex-shrink-0 bg-gray-50">
              <div className="flex flex-col sm:flex-row justify-between gap-3">
                <div className="flex space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCloseTaskDetails();
                    }}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Close
                  </button>
                </div>
                {selectedTask && selectedTask.status !== "Completed" && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenRenegotiateModal();
                    }}
                    className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-center"
                    disabled={
                      selectedTask.dueDateRenegotiationStatus === "pending"
                    }
                  >
                    {selectedTask.dueDateRenegotiationStatus === "pending"
                      ? "Request Pending"
                      : selectedTask.dueDateRenegotiationStatus === "rejected"
                      ? "Request New Due Date"
                      : "Request Due Date Change"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirmModal}
        onClose={() => setShowDeleteConfirmModal(false)}
        title="Confirm Deletion"
        size="small"
        actions={
          <>
            <button
              onClick={() => setShowDeleteConfirmModal(false)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              onClick={confirmDeleteTask}
              className="px-4 py-2 bg-red-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Delete
            </button>
          </>
        }
      >
        <p className="text-gray-700">
          Are you sure you want to delete this task?
        </p>
        <p className="text-gray-500 text-sm mt-2">
          This action cannot be undone.
        </p>
      </Modal>

      {/* Task Complete Confirmation Modal */}
      <Modal
        isOpen={showTaskCompleteModal}
        onClose={() => setShowTaskCompleteModal(false)}
        title="Mark Task as Complete"
        size="small"
        actions={
          <>
            <button
              onClick={() => setShowTaskCompleteModal(false)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (taskToComplete) {
                  updateTaskStatus(taskToComplete.id, taskToComplete.newStatus);
                }
                setShowTaskCompleteModal(false);
              }}
              className="px-4 py-2 bg-green-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Complete Task
            </button>
          </>
        }
      >
        <p className="text-gray-700">
          Are you sure you want to mark "{taskToComplete?.title || ""}" as
          completed?
        </p>
        <p className="text-gray-500 text-sm mt-2">
          This will update the task status to Completed.
        </p>
      </Modal>

      {/* Due Date Renegotiation Modal */}
      <Modal
        isOpen={showRenegotiateModal}
        onClose={() => setShowRenegotiateModal(false)}
        title="Request Due Date Change"
        size="medium"
        actions={
          <>
            <button
              onClick={() => setShowRenegotiateModal(false)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              onClick={submitRenegotiationRequest}
              disabled={
                !renegotiationData.requestedDueDate || !renegotiationData.reason
              }
              className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                !renegotiationData.requestedDueDate || !renegotiationData.reason
                  ? "bg-indigo-300 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              Submit Request
            </button>
          </>
        }
      >
        {selectedTask && (
          <div className="space-y-4 py-4">
            <div>
              <label
                htmlFor="currentDueDate"
                className="block text-sm font-medium text-gray-700"
              >
                Current Due Date
              </label>
              <input
                type="text"
                id="currentDueDate"
                className="mt-1 bg-gray-50 block w-full sm:text-sm border-gray-300 rounded-md cursor-not-allowed"
                value={new Date(selectedTask.dueDate).toLocaleDateString()}
                readOnly
              />
            </div>

            <div>
              <label
                htmlFor="requestedDueDate"
                className="block text-sm font-medium text-gray-700"
              >
                Requested Due Date
              </label>
              <input
                type="date"
                id="requestedDueDate"
                name="requestedDueDate"
                className="mt-1 block w-full sm:text-sm border-gray-300 rounded-md"
                value={renegotiationData.requestedDueDate}
                onChange={handleRenegotiationChange}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>

            <div>
              <label
                htmlFor="reason"
                className="block text-sm font-medium text-gray-700"
              >
                Reason for Change (Required)
              </label>
              <textarea
                id="reason"
                name="reason"
                rows={4}
                className="mt-1 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="Please explain why you need to change the due date..."
                value={renegotiationData.reason}
                onChange={handleRenegotiationChange}
              />
            </div>

            <div className="bg-yellow-50 p-3 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-yellow-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Important Note
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      Your request will need to be approved by your manager. The
                      task due date will remain unchanged until the request is
                      approved.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Task Button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => {
            // Create a new empty task template
            const newTask: DisplayTask = {
              id: String(Math.max(...tasks.map((t) => Number(t.id))) + 1),
              title: "New Task",
              description: "",
              status: "To Do",
              priority: "Medium",
              dueDate: new Date().toISOString().split("T")[0],
              project: {
                id: String(tasks[0]?.project?.id || "1"),
                name: tasks[0]?.project?.name || "Default Project",
              },
              assignedBy: {
                id: userData?.id || "1",
                name: userData?.fullName || "Me",
                avatar:
                  (userData as any)?.avatar ||
                  "https://randomuser.me/api/portraits/men/1.jpg",
              },
              checklist: [],
              attachments: [],
              timeEstimate: "0 hours",
              timeSpent: 0,
            };

            // Add it to tasks and open it for editing
            setTasks([newTask, ...tasks]);
            setSelectedTask(newTask);
            setShowTaskDetails(true);
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center"
        >
          <svg
            className="w-5 h-5 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            ></path>
          </svg>
          Add Task
        </button>
      </div>
    </div>
  );
};

export default Tasks;
