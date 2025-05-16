import React, { useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
  BarController,
  PieController,
} from "chart.js";
import { Line, Bar, Doughnut, Pie } from "react-chartjs-2";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  BarController,
  PieController
);

// Mock data for analytics
const projectProgressData = {
  labels: [
    "Website Redesign",
    "Mobile App Development",
    "CRM Integration",
    "Marketing Campaign",
  ],
  datasets: [
    {
      label: "Progress %",
      data: [75, 45, 60, 30],
      backgroundColor: "rgba(99, 102, 241, 0.5)",
      borderColor: "rgb(99, 102, 241)",
      borderWidth: 1,
    },
  ],
};

const taskCompletionData = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  datasets: [
    {
      label: "Completed",
      data: [25, 40, 30, 35, 55, 42],
      backgroundColor: "rgba(34, 197, 94, 0.5)",
      borderColor: "rgb(34, 197, 94)",
      borderWidth: 1,
    },
    {
      label: "Pending",
      data: [15, 20, 12, 14, 10, 8],
      backgroundColor: "rgba(234, 179, 8, 0.5)",
      borderColor: "rgb(234, 179, 8)",
      borderWidth: 1,
    },
  ],
};

const employeeProductivityData = {
  labels: ["Jason Chen", "Sarah Johnson", "Michael Brown", "Emily Davis"],
  datasets: [
    {
      label: "Tasks Completed",
      data: [12, 9, 8, 11],
      backgroundColor: [
        "rgba(99, 102, 241, 0.7)",
        "rgba(34, 197, 94, 0.7)",
        "rgba(234, 179, 8, 0.7)",
        "rgba(239, 68, 68, 0.7)",
      ],
      borderColor: [
        "rgb(99, 102, 241)",
        "rgb(34, 197, 94)",
        "rgb(234, 179, 8)",
        "rgb(239, 68, 68)",
      ],
      borderWidth: 1,
    },
  ],
};

const timeTrackingData = {
  labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
  datasets: [
    {
      label: "Hours Tracked",
      data: [120, 145, 132, 149],
      fill: true,
      backgroundColor: "rgba(99, 102, 241, 0.2)",
      borderColor: "rgb(99, 102, 241)",
      tension: 0.1,
    },
  ],
};

// New chart data
const taskTypeDistributionData = {
  labels: ["Development", "Design", "Testing", "Documentation", "Meetings"],
  datasets: [
    {
      label: "Hours Spent",
      data: [45, 25, 20, 15, 10],
      backgroundColor: [
        "rgba(99, 102, 241, 0.7)",
        "rgba(34, 197, 94, 0.7)",
        "rgba(234, 179, 8, 0.7)",
        "rgba(239, 68, 68, 0.7)",
        "rgba(16, 185, 129, 0.7)",
      ],
      borderColor: [
        "rgb(99, 102, 241)",
        "rgb(34, 197, 94)",
        "rgb(234, 179, 8)",
        "rgb(239, 68, 68)",
        "rgb(16, 185, 129)",
      ],
      borderWidth: 1,
    },
  ],
};

const deadlineComplianceData = {
  labels: ["On Time", "Delayed (1-2 days)", "Delayed (3+ days)"],
  datasets: [
    {
      label: "Tasks",
      data: [65, 25, 10],
      backgroundColor: [
        "rgba(34, 197, 94, 0.7)",
        "rgba(234, 179, 8, 0.7)",
        "rgba(239, 68, 68, 0.7)",
      ],
      borderColor: ["rgb(34, 197, 94)", "rgb(234, 179, 8)", "rgb(239, 68, 68)"],
      borderWidth: 1,
    },
  ],
};

const Analytics: React.FC = () => {
  const [timeframe, setTimeframe] = useState("month");
  const [projectFilter, setProjectFilter] = useState("all");
  const [dateRange, setDateRange] = useState({
    from: "2023-06-01",
    to: "2023-06-30",
  });
  const [chartType, setChartType] = useState({
    projectProgress: "bar",
    taskCompletion: "bar",
    employeeProductivity: "doughnut",
    timeTracking: "line",
  });

  // Mock function to handle export as PDF
  const handleExportPDF = () => {
    // In a real-world scenario, this would generate and download a PDF
    alert(
      "Exporting as PDF...\nIn a real implementation, this would use a library like jsPDF to generate a PDF report."
    );
  };

  // Mock function to handle export as CSV
  const handleExportCSV = () => {
    // In a real-world scenario, this would generate and download a CSV
    alert(
      "Exporting as CSV...\nIn a real implementation, this would generate CSV data from the charts' datasets."
    );
  };

  // Function to toggle chart types
  const toggleChartType = (chart) => {
    const types = {
      projectProgress: ["bar", "line"],
      taskCompletion: ["bar", "line"],
      employeeProductivity: ["doughnut", "pie"],
      timeTracking: ["line", "bar"],
    };

    setChartType((prev) => {
      const currentType = prev[chart];
      const typeOptions = types[chart];
      const nextTypeIndex =
        (typeOptions.indexOf(currentType) + 1) % typeOptions.length;
      return { ...prev, [chart]: typeOptions[nextTypeIndex] };
    });
  };

  return (
    <div className="w-full bg-gray-50 min-h-screen pb-12">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="mb-6 bg-white shadow rounded-lg p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-lg font-medium text-gray-900">Dashboard</h2>
            <div className="flex flex-wrap gap-4">
              <div>
                <label
                  htmlFor="timeframe"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Timeframe
                </label>
                <select
                  id="timeframe"
                  name="timeframe"
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="week">Last Week</option>
                  <option value="month">Last Month</option>
                  <option value="quarter">Last Quarter</option>
                  <option value="year">Last Year</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="project"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Project
                </label>
                <select
                  id="project"
                  name="project"
                  value={projectFilter}
                  onChange={(e) => setProjectFilter(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="all">All Projects</option>
                  <option value="1">Website Redesign</option>
                  <option value="2">Mobile App Development</option>
                  <option value="3">CRM Integration</option>
                  <option value="4">Marketing Campaign</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="date-from"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  From
                </label>
                <input
                  type="date"
                  id="date-from"
                  name="date-from"
                  value={dateRange.from}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, from: e.target.value })
                  }
                  className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                />
              </div>
              <div>
                <label
                  htmlFor="date-to"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  To
                </label>
                <input
                  type="date"
                  id="date-to"
                  name="date-to"
                  value={dateRange.to}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, to: e.target.value })
                  }
                  className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                  <svg
                    className="h-6 w-6 text-white"
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
                      Total Projects
                    </dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">4</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                  <svg
                    className="h-6 w-6 text-white"
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
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Completed Tasks
                    </dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">
                        42
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                  <svg
                    className="h-6 w-6 text-white"
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
                      Hours Tracked
                    </dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">
                        546
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-red-500 rounded-md p-3">
                  <svg
                    className="h-6 w-6 text-white"
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
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Team Members
                    </dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">4</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 mb-6">
          {/* Project Progress */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Project Progress
              </h3>
              <button
                onClick={() => toggleChartType("projectProgress")}
                className="text-indigo-600 hover:text-indigo-900"
              >
                Switch to {chartType.projectProgress === "bar" ? "Line" : "Bar"}{" "}
                Chart
              </button>
            </div>
            <div className="h-80">
              {chartType.projectProgress === "bar" ? (
                <Bar
                  data={projectProgressData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                          display: true,
                          text: "Completion %",
                        },
                      },
                      x: {
                        title: {
                          display: true,
                          text: "Projects",
                        },
                      },
                    },
                  }}
                />
              ) : (
                <Line
                  data={projectProgressData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                          display: true,
                          text: "Completion %",
                        },
                      },
                      x: {
                        title: {
                          display: true,
                          text: "Projects",
                        },
                      },
                    },
                  }}
                />
              )}
            </div>
          </div>

          {/* Task Completion */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Task Completion Trends
              </h3>
              <button
                onClick={() => toggleChartType("taskCompletion")}
                className="text-indigo-600 hover:text-indigo-900"
              >
                Switch to {chartType.taskCompletion === "bar" ? "Line" : "Bar"}{" "}
                Chart
              </button>
            </div>
            <div className="h-80">
              {chartType.taskCompletion === "bar" ? (
                <Bar
                  data={taskCompletionData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: "Number of Tasks",
                        },
                      },
                      x: {
                        title: {
                          display: true,
                          text: "Month",
                        },
                      },
                    },
                  }}
                />
              ) : (
                <Line
                  data={taskCompletionData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: "Number of Tasks",
                        },
                      },
                      x: {
                        title: {
                          display: true,
                          text: "Month",
                        },
                      },
                    },
                  }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 mb-6">
          {/* Employee Productivity */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Employee Productivity
              </h3>
              <button
                onClick={() => toggleChartType("employeeProductivity")}
                className="text-indigo-600 hover:text-indigo-900"
              >
                Switch to{" "}
                {chartType.employeeProductivity === "doughnut"
                  ? "Pie"
                  : "Doughnut"}{" "}
                Chart
              </button>
            </div>
            <div className="h-80 flex items-center justify-center">
              <div className="w-3/4 h-full">
                {chartType.employeeProductivity === "doughnut" ? (
                  <Doughnut
                    data={employeeProductivityData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: "right",
                        },
                      },
                    }}
                  />
                ) : (
                  <Pie
                    data={employeeProductivityData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: "right",
                        },
                      },
                    }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Time Tracking */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Time Tracking
              </h3>
              <button
                onClick={() => toggleChartType("timeTracking")}
                className="text-indigo-600 hover:text-indigo-900"
              >
                Switch to {chartType.timeTracking === "line" ? "Bar" : "Line"}{" "}
                Chart
              </button>
            </div>
            <div className="h-80">
              {chartType.timeTracking === "line" ? (
                <Line
                  data={timeTrackingData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: "Hours",
                        },
                      },
                      x: {
                        title: {
                          display: true,
                          text: "Week",
                        },
                      },
                    },
                  }}
                />
              ) : (
                <Bar
                  data={timeTrackingData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: "Hours",
                        },
                      },
                      x: {
                        title: {
                          display: true,
                          text: "Week",
                        },
                      },
                    },
                  }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Charts Row 3 - New Charts */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 mb-6">
          {/* Task Type Distribution */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Task Type Distribution
            </h3>
            <div className="h-80 flex items-center justify-center">
              <div className="w-3/4 h-full">
                <Pie
                  data={taskTypeDistributionData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "right",
                      },
                      title: {
                        display: true,
                        text: "Hours Spent by Task Type",
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>

          {/* Deadline Compliance */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Deadline Compliance
            </h3>
            <div className="h-80 flex items-center justify-center">
              <div className="w-3/4 h-full">
                <Doughnut
                  data={deadlineComplianceData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "right",
                      },
                      title: {
                        display: true,
                        text: "Task Completion Status",
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Export Options */}
        <div className="flex justify-end space-x-4 mb-6">
          <button
            type="button"
            onClick={handleExportPDF}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg
              className="-ml-1 mr-2 h-5 w-5 text-gray-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Export as PDF
          </button>
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg
              className="-ml-1 mr-2 h-5 w-5 text-gray-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Export as CSV
          </button>
        </div>
      </main>
    </div>
  );
};

export default Analytics;
