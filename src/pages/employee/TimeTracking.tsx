import React, { useState, useEffect, useRef } from "react";

// Mock data for time entries
const mockTimeEntries = [
  {
    id: 1,
    projectId: 1,
    projectName: "Website Redesign",
    taskId: 3,
    taskName: "Design homepage",
    date: "2023-11-15",
    startTime: "09:00:00",
    endTime: "12:30:00",
    duration: 12600, // in seconds (3.5 hours)
    notes: "Worked on homepage mockups and responsive designs",
    status: "approved",
  },
  {
    id: 2,
    projectId: 1,
    projectName: "Website Redesign",
    taskId: 5,
    taskName: "Create backend API",
    date: "2023-11-16",
    startTime: "13:00:00",
    endTime: "17:45:00",
    duration: 17100, // in seconds (4.75 hours)
    notes: "Implemented authentication endpoints",
    status: "pending",
  },
  {
    id: 3,
    projectId: 2,
    projectName: "Mobile App Development",
    taskId: 6,
    taskName: "Develop mobile app UI",
    date: "2023-11-17",
    startTime: "10:15:00",
    endTime: "15:30:00",
    duration: 18900, // in seconds (5.25 hours)
    notes: "Created UI components for the mobile app",
    status: "approved",
  },
  {
    id: 4,
    projectId: 2,
    projectName: "Mobile App Development",
    taskId: 6,
    taskName: "Develop mobile app UI",
    date: "2023-11-18",
    startTime: "09:30:00",
    endTime: "16:45:00",
    duration: 26100, // in seconds (7.25 hours)
    notes: "Continued work on UI components and animations",
    status: "pending",
  },
  {
    id: 5,
    projectId: 3,
    projectName: "CRM Integration",
    taskId: 8,
    taskName: "CRM data migration",
    date: "2023-11-19",
    startTime: "08:00:00",
    endTime: "11:30:00",
    duration: 12600, // in seconds (3.5 hours)
    notes: "Worked on data migration scripts",
    status: "rejected",
    rejectionReason: "Please provide more details on the migration process",
  },
];

// Mock data for projects and tasks
const mockProjects = [
  { id: 1, name: "Website Redesign" },
  { id: 2, name: "Mobile App Development" },
  { id: 3, name: "CRM Integration" },
  { id: 4, name: "Marketing Campaign" },
];

const mockTasks = {
  1: [
    { id: 2, name: "Create wireframes" },
    { id: 3, name: "Design homepage" },
    { id: 4, name: "Implement responsive layout" },
    { id: 5, name: "Create backend API" },
  ],
  2: [
    { id: 6, name: "Develop mobile app UI" },
    { id: 11, name: "App navigation implementation" },
    { id: 12, name: "User authentication screens" },
  ],
  3: [
    { id: 8, name: "CRM data migration" },
    { id: 13, name: "API integration" },
    { id: 14, name: "User sync setup" },
  ],
  4: [
    { id: 9, name: "User testing" },
    { id: 10, name: "Set up analytics" },
    { id: 15, name: "Campaign tracking" },
  ],
};

// Format seconds to HH:MM:SS
const formatTime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return [hours, minutes, secs]
    .map((val) => (val < 10 ? `0${val}` : val))
    .join(":");
};

// Convert HH:MM:SS to seconds
const timeToSeconds = (time: string) => {
  const [hours, minutes, seconds] = time.split(":").map(Number);
  return hours * 3600 + minutes * 60 + seconds;
};

// Calculate total hours for a specific status
const calculateTotalHours = (entries: any[], status?: string) => {
  const filteredEntries = status
    ? entries.filter((entry) => entry.status === status)
    : entries;

  const totalSeconds = filteredEntries.reduce(
    (acc, entry) => acc + entry.duration,
    0
  );
  return (totalSeconds / 3600).toFixed(2);
};

const TimeTracking: React.FC = () => {
  // State for timer
  const [isRunning, setIsRunning] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentTimeDisplay, setCurrentTimeDisplay] = useState("00:00:00");
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [selectedTask, setSelectedTask] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [availableTasks, setAvailableTasks] = useState<
    { id: number; name: string }[]
  >([]);
  const [timeEntries, setTimeEntries] = useState(mockTimeEntries);

  // State for filters
  const [dateFilter, setDateFilter] = useState("");
  const [projectFilter, setProjectFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Manage the timer interval
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Update available tasks when project changes
  useEffect(() => {
    if (selectedProject && mockTasks[selectedProject]) {
      setAvailableTasks(mockTasks[selectedProject]);
      setSelectedTask(null); // Reset task selection
    } else {
      setAvailableTasks([]);
      setSelectedTask(null);
    }
  }, [selectedProject]);

  // Timer effect
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          const newTime = prev + 1;
          setCurrentTimeDisplay(formatTime(newTime));
          return newTime;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning]);

  // Handle start/pause/stop timer
  const handleStartTimer = () => {
    if (!selectedProject || !selectedTask) {
      alert("Please select a project and task first");
      return;
    }
    setIsRunning(true);
  };

  const handlePauseTimer = () => {
    setIsRunning(false);
  };

  const handleStopTimer = () => {
    // Create a new time entry
    if (currentTime > 0 && selectedProject && selectedTask) {
      const now = new Date();
      const today = now.toISOString().split("T")[0];
      const endTime = now.toTimeString().split(" ")[0];

      // Calculate start time by subtracting the duration from current time
      const startDate = new Date(now.getTime() - currentTime * 1000);
      const startTime = startDate.toTimeString().split(" ")[0];

      const newEntry = {
        id: timeEntries.length + 1,
        projectId: selectedProject,
        projectName:
          mockProjects.find((p) => p.id === selectedProject)?.name || "",
        taskId: selectedTask,
        taskName: availableTasks.find((t) => t.id === selectedTask)?.name || "",
        date: today,
        startTime,
        endTime,
        duration: currentTime,
        notes: notes,
        status: "pending",
      };

      setTimeEntries([newEntry, ...timeEntries]);
    }

    // Reset timer and form
    setIsRunning(false);
    setCurrentTime(0);
    setCurrentTimeDisplay("00:00:00");
    setNotes("");
  };

  // Handle manual time entry
  const handleManualEntry = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic for manual time entry form submission would go here
  };

  // Filter time entries based on selected filters
  const filteredEntries = timeEntries.filter((entry) => {
    const matchesDate = dateFilter ? entry.date === dateFilter : true;
    const matchesProject = projectFilter
      ? entry.projectId === parseInt(projectFilter)
      : true;
    const matchesStatus = statusFilter ? entry.status === statusFilter : true;

    return matchesDate && matchesProject && matchesStatus;
  });

  return (
    <div className="w-full bg-gray-50 min-h-screen pb-12">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">Time Tracking</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Time Tracker Section */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Time Tracker
                </h3>
              </div>
              <div className="p-6">
                <div className="mb-6 text-center">
                  <div className="text-5xl font-mono font-bold text-indigo-600 mb-4">
                    {currentTimeDisplay}
                  </div>
                  <div className="flex justify-center space-x-3 mb-6">
                    {!isRunning ? (
                      <button
                        onClick={handleStartTimer}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        <svg
                          className="h-5 w-5 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Start
                      </button>
                    ) : (
                      <button
                        onClick={handlePauseTimer}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                      >
                        <svg
                          className="h-5 w-5 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Pause
                      </button>
                    )}
                    <button
                      onClick={handleStopTimer}
                      disabled={currentTime === 0}
                      className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                        currentTime === 0
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      }`}
                    >
                      <svg
                        className="h-5 w-5 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
                        />
                      </svg>
                      Stop
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Project
                    </label>
                    <select
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                      value={selectedProject || ""}
                      onChange={(e) =>
                        setSelectedProject(
                          e.target.value ? parseInt(e.target.value) : null
                        )
                      }
                      disabled={isRunning}
                    >
                      <option value="">Select a project</option>
                      {mockProjects.map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Task
                    </label>
                    <select
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                      value={selectedTask || ""}
                      onChange={(e) =>
                        setSelectedTask(
                          e.target.value ? parseInt(e.target.value) : null
                        )
                      }
                      disabled={!selectedProject || isRunning}
                    >
                      <option value="">Select a task</option>
                      {availableTasks.map((task) => (
                        <option key={task.id} value={task.id}>
                          {task.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Notes
                    </label>
                    <textarea
                      rows={3}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="What are you working on?"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Manual Time Entry Section */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Manual Time Entry
                </h3>
              </div>
              <div className="p-6">
                <form onSubmit={handleManualEntry} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Date
                    </label>
                    <input
                      type="date"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Start Time
                      </label>
                      <input
                        type="time"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        End Time
                      </label>
                      <input
                        type="time"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Project
                    </label>
                    <select
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                      required
                    >
                      <option value="">Select a project</option>
                      {mockProjects.map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Task
                    </label>
                    <select
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                      disabled={!selectedProject}
                      required
                    >
                      <option value="">Select a task</option>
                      {availableTasks.map((task) => (
                        <option key={task.id} value={task.id}>
                          {task.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Notes
                    </label>
                    <textarea
                      rows={2}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="What did you work on?"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Add Time Entry
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Time Entries Section */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex flex-wrap justify-between items-center">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Time Entries
                </h3>
                <div className="flex space-x-2 items-center text-sm text-gray-500">
                  <div className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-green-400 mr-1"></div>
                    <span>
                      Approved: {calculateTotalHours(timeEntries, "approved")}h
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-yellow-400 mr-1"></div>
                    <span>
                      Pending: {calculateTotalHours(timeEntries, "pending")}h
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-red-400 mr-1"></div>
                    <span>
                      Rejected: {calculateTotalHours(timeEntries, "rejected")}h
                    </span>
                  </div>
                </div>
              </div>

              {/* Filters */}
              <div className="px-4 py-4 sm:px-6 border-b border-gray-200 bg-gray-50">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700">
                      Date
                    </label>
                    <input
                      type="date"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700">
                      Project
                    </label>
                    <select
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                      value={projectFilter}
                      onChange={(e) => setProjectFilter(e.target.value)}
                    >
                      <option value="">All Projects</option>
                      {mockProjects.map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700">
                      Status
                    </label>
                    <select
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="">All Statuses</option>
                      <option value="approved">Approved</option>
                      <option value="pending">Pending</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Time Entries Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Date & Time
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Project & Task
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Duration
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredEntries.length > 0 ? (
                      filteredEntries.map((entry) => (
                        <tr key={entry.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {entry.date}
                            </div>
                            <div className="text-sm text-gray-500">
                              {entry.startTime} - {entry.endTime}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {entry.projectName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {entry.taskName}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {formatTime(entry.duration)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {(entry.duration / 3600).toFixed(2)} hours
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                entry.status === "approved"
                                  ? "bg-green-100 text-green-800"
                                  : entry.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {entry.status.charAt(0).toUpperCase() +
                                entry.status.slice(1)}
                            </span>
                            {entry.status === "rejected" &&
                              entry.rejectionReason && (
                                <div className="text-xs text-red-500 mt-1">
                                  {entry.rejectionReason}
                                </div>
                              )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button className="text-indigo-600 hover:text-indigo-900 mr-3">
                              Edit
                            </button>
                            <button className="text-red-600 hover:text-red-900">
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-6 py-10 text-center text-sm text-gray-500"
                        >
                          No time entries found. Adjust your filters or add a
                          new time entry.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TimeTracking;
