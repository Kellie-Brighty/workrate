import { useState } from "react";
import { Link } from "react-router-dom";
import Modal from "../../components/Modal";

// Mock task data
const MOCK_TASKS = [
  {
    id: 1,
    title: "Design new landing page mockups",
    description: "Create mockups for the new marketing campaign landing page",
    status: "In Progress",
    priority: "High",
    dueDate: "2023-11-15",
    project: {
      id: 1,
      name: "Website Redesign",
    },
    assignedBy: {
      id: 1,
      name: "John Manager",
      avatar: "https://randomuser.me/api/portraits/men/1.jpg",
    },
    checklist: [
      { id: 1, text: "Research competitor landing pages", completed: true },
      { id: 2, text: "Create wireframes", completed: true },
      { id: 3, text: "Design mobile version", completed: false },
      { id: 4, text: "Get feedback from team", completed: false },
    ],
    attachments: [
      { id: 1, name: "wireframe.pdf", size: "2.4 MB", date: "2023-11-01" },
    ],
    timeEstimate: "6 hours",
    timeSpent: "2.5 hours",
  },
  {
    id: 2,
    title: "Implement authentication API",
    description:
      "Connect the frontend with the new authentication API endpoints",
    status: "To Do",
    priority: "Medium",
    dueDate: "2023-11-20",
    project: {
      id: 2,
      name: "User Authentication",
    },
    assignedBy: {
      id: 1,
      name: "John Manager",
      avatar: "https://randomuser.me/api/portraits/men/1.jpg",
    },
    checklist: [
      { id: 1, text: "Review API documentation", completed: false },
      { id: 2, text: "Implement login function", completed: false },
      { id: 3, text: "Implement register function", completed: false },
      { id: 4, text: "Add error handling", completed: false },
    ],
    attachments: [
      { id: 1, name: "api_docs.pdf", size: "1.7 MB", date: "2023-11-03" },
    ],
    timeEstimate: "8 hours",
    timeSpent: "0 hours",
  },
  {
    id: 3,
    title: "Fix checkout page bugs",
    description: "Address the reported bugs in the checkout flow",
    status: "To Do",
    priority: "Critical",
    dueDate: "2023-11-10",
    project: {
      id: 3,
      name: "E-commerce Platform",
    },
    assignedBy: {
      id: 2,
      name: "Sarah Director",
      avatar: "https://randomuser.me/api/portraits/women/2.jpg",
    },
    checklist: [
      { id: 1, text: "Fix payment processing error", completed: false },
      { id: 2, text: "Fix address validation", completed: false },
      { id: 3, text: "Test on multiple browsers", completed: false },
    ],
    attachments: [
      { id: 1, name: "bug_report.txt", size: "0.3 MB", date: "2023-11-05" },
      { id: 2, name: "screenshot.png", size: "0.5 MB", date: "2023-11-05" },
    ],
    timeEstimate: "4 hours",
    timeSpent: "0 hours",
  },
  {
    id: 4,
    title: "Update user documentation",
    description: "Update the user documentation with new features",
    status: "Completed",
    priority: "Low",
    dueDate: "2023-11-05",
    project: {
      id: 2,
      name: "User Authentication",
    },
    assignedBy: {
      id: 1,
      name: "John Manager",
      avatar: "https://randomuser.me/api/portraits/men/1.jpg",
    },
    checklist: [
      { id: 1, text: "Update login documentation", completed: true },
      { id: 2, text: "Update registration documentation", completed: true },
      { id: 3, text: "Add screenshots", completed: true },
      { id: 4, text: "Proofread", completed: true },
    ],
    attachments: [
      { id: 1, name: "old_docs.pdf", size: "1.2 MB", date: "2023-10-28" },
      { id: 2, name: "new_docs.pdf", size: "1.4 MB", date: "2023-11-04" },
    ],
    timeEstimate: "5 hours",
    timeSpent: "4.5 hours",
  },
  {
    id: 5,
    title: "Research competitor features",
    description:
      "Analyze competitor products and identify key features we should implement",
    status: "In Progress",
    priority: "Medium",
    dueDate: "2023-11-25",
    project: {
      id: 4,
      name: "Market Research",
    },
    assignedBy: {
      id: 2,
      name: "Sarah Director",
      avatar: "https://randomuser.me/api/portraits/women/2.jpg",
    },
    checklist: [
      { id: 1, text: "Identify top 5 competitors", completed: true },
      { id: 2, text: "Document key features", completed: true },
      { id: 3, text: "Compare pricing models", completed: false },
      { id: 4, text: "Prepare presentation", completed: false },
    ],
    attachments: [],
    timeEstimate: "10 hours",
    timeSpent: "5 hours",
  },
];

const Tasks = () => {
  const [tasks, setTasks] = useState(MOCK_TASKS);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [showTaskDetails, setShowTaskDetails] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [projectFilter, setProjectFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal states
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<number | null>(null);
  const [showTaskCompleteModal, setShowTaskCompleteModal] = useState(false);
  const [taskToComplete, setTaskToComplete] = useState<any | null>(null);

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
  const handleChecklistToggle = (taskId: number, checklistItemId: number) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.id === taskId) {
          const updatedChecklist = task.checklist.map((item) => {
            if (item.id === checklistItemId) {
              return { ...item, completed: !item.completed };
            }
            return item;
          });
          return { ...task, checklist: updatedChecklist };
        }
        return task;
      })
    );

    // Update selected task if it's open
    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask((prevTask: any) => {
        const updatedChecklist = prevTask.checklist.map((item: any) => {
          if (item.id === checklistItemId) {
            return { ...item, completed: !item.completed };
          }
          return item;
        });
        return { ...prevTask, checklist: updatedChecklist };
      });
    }
  };

  // Handle task status change
  const handleStatusChange = (taskId: number, newStatus: string) => {
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
        return;
      }
    }

    // Otherwise update directly
    updateTaskStatus(taskId, newStatus);
  };

  // Function to actually update task status
  const updateTaskStatus = (taskId: number, newStatus: string) => {
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
      setSelectedTask((prevTask: any) => ({
        ...prevTask,
        status: newStatus,
      }));
    }

    setTaskToComplete(null);
    setShowTaskCompleteModal(false);
  };

  // Open task details
  const handleOpenTaskDetails = (task: any) => {
    setSelectedTask(task);
    setShowTaskDetails(true);
  };

  // Close task details
  const handleCloseTaskDetails = () => {
    setShowTaskDetails(false);
  };

  // Delete task handler
  const handleDeleteTask = (taskId: number) => {
    setTaskToDelete(taskId);
    setShowDeleteConfirmModal(true);
  };

  // Confirm delete task
  const confirmDeleteTask = () => {
    if (taskToDelete) {
      setTasks(tasks.filter((task) => task.id !== taskToDelete));
      if (selectedTask && selectedTask.id === taskToDelete) {
        setShowTaskDetails(false);
      }
      setShowDeleteConfirmModal(false);
      setTaskToDelete(null);
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
        <h1 className="text-3xl font-bold text-gray-800">My Tasks</h1>
        <div className="w-full sm:w-auto">
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

      {/* Filter section - Made responsive */}
      <div className="bg-white shadow rounded-lg p-4 mb-6 overflow-x-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-wrap">
          <div>
            <label
              htmlFor="status-filter"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Status
            </label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 min-w-[150px]"
            >
              <option value="All">All Statuses</option>
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="priority-filter"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Priority
            </label>
            <select
              id="priority-filter"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="border rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 min-w-[150px]"
            >
              <option value="All">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="project-filter"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Project
            </label>
            <select
              id="project-filter"
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="border rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 min-w-[150px]"
            >
              {projects.map((project, index) => (
                <option key={index} value={project}>
                  {project}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Task list - Updated grid for better mobile experience */}
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
                      ? "bg-gray-100 text-gray-800"
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
                    Est: {task.timeEstimate}
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

        {filteredTasks.length === 0 && (
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
              No tasks found
            </h3>
            <p className="text-gray-500 mt-1">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>

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
                          ? "bg-gray-100 text-gray-800"
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
                      <p className="mt-1 text-sm text-gray-900">
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
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-500">
                        Time
                      </h4>
                      <div className="mt-1 grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-xs text-gray-500">Estimated</p>
                          <p className="text-sm text-gray-900">
                            {selectedTask.timeEstimate}
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
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTask(selectedTask.id);
                    }}
                    className="px-4 py-2 bg-red-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Delete Task
                  </button>
                </div>
                <Link
                  to="/employee/timetracking"
                  className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCloseTaskDetails();
                  }}
                >
                  Track Time for This Task
                </Link>
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
              onClick={() =>
                taskToComplete &&
                updateTaskStatus(taskToComplete.id, taskToComplete.newStatus)
              }
              className="px-4 py-2 bg-green-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Complete Task
            </button>
          </>
        }
      >
        <p className="text-gray-700">
          Are you sure you want to mark "{taskToComplete?.title}" as completed?
        </p>
        <p className="text-gray-500 text-sm mt-2">
          This will update the task status to Completed.
        </p>
      </Modal>

      {/* Add Task Button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => {
            // Create a new empty task template
            const newTask = {
              id: Math.max(...tasks.map((t) => t.id)) + 1,
              title: "New Task",
              description: "",
              status: "To Do",
              priority: "Medium",
              dueDate: new Date().toISOString().split("T")[0],
              project: {
                id: 1,
                name: "Website Redesign",
              },
              assignedBy: {
                id: 1,
                name: "John Manager",
                avatar: "https://randomuser.me/api/portraits/men/1.jpg",
              },
              checklist: [],
              attachments: [],
              timeEstimate: "0 hours",
              timeSpent: "0 hours",
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
