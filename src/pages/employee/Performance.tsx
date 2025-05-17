import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

// Mock performance data
const MOCK_PERFORMANCE = {
  summary: {
    productivity: 85,
    taskCompletion: 92,
    onTimeDelivery: 78,
    qualityRating: 90,
    overallRating: "Excellent",
  },
  productivityTrend: {
    labels: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    datasets: [
      {
        label: "Productivity Score",
        data: [78, 81, 80, 75, 82, 84, 87, 85, 88, 90, 89, 85],
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.5)",
        tension: 0.4,
      },
      {
        label: "Team Average",
        data: [75, 76, 77, 75, 78, 80, 81, 79, 82, 83, 82, 80],
        borderColor: "rgb(153, 102, 255)",
        backgroundColor: "rgba(153, 102, 255, 0.5)",
        borderDash: [5, 5],
        tension: 0.4,
      },
    ],
  },
  taskCompletionTrend: {
    labels: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    datasets: [
      {
        label: "Tasks Completed",
        data: [12, 15, 14, 18, 20, 22, 19, 21, 25, 23, 24, 20],
        backgroundColor: "rgba(54, 162, 235, 0.5)",
        borderColor: "rgb(54, 162, 235)",
        borderWidth: 1,
      },
    ],
  },
  skillsDistribution: {
    labels: [
      "Technical",
      "Communication",
      "Problem Solving",
      "Teamwork",
      "Initiative",
    ],
    datasets: [
      {
        label: "Skill Ratings",
        data: [85, 70, 90, 75, 80],
        backgroundColor: [
          "rgba(255, 99, 132, 0.7)",
          "rgba(54, 162, 235, 0.7)",
          "rgba(255, 206, 86, 0.7)",
          "rgba(75, 192, 192, 0.7)",
          "rgba(153, 102, 255, 0.7)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
        ],
        borderWidth: 1,
      },
    ],
  },
  feedback: [
    {
      id: 1,
      from: "John Manager",
      avatar: "https://randomuser.me/api/portraits/men/1.jpg",
      date: "2023-11-05",
      rating: 5,
      text: "Excellent work on the website redesign project. Your attention to detail and ability to solve complex problems resulted in a superior product.",
    },
    {
      id: 2,
      from: "Sarah Director",
      avatar: "https://randomuser.me/api/portraits/women/2.jpg",
      date: "2023-10-20",
      rating: 4,
      text: "Great job on the market research project. Your insights were valuable and your presentation was clear and informative.",
    },
    {
      id: 3,
      from: "Bob Designer",
      avatar: "https://randomuser.me/api/portraits/men/2.jpg",
      date: "2023-09-15",
      rating: 5,
      text: "Your collaborative approach and technical skills made the landing page redesign a success. The team greatly appreciates your contributions.",
    },
  ],
  achievements: [
    {
      id: 1,
      title: "Top Performer",
      date: "November 2023",
      description: "Recognized as the top performer in the development team",
      icon: "🏆",
    },
    {
      id: 2,
      title: "Project Excellence",
      date: "October 2023",
      description: "Delivered the website redesign project ahead of schedule",
      icon: "🌟",
    },
    {
      id: 3,
      title: "Innovation Award",
      date: "August 2023",
      description:
        "Implemented an innovative solution that improved workflow efficiency",
      icon: "💡",
    },
  ],
  timeTracking: {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Logged Hours",
        data: [8.5, 7.75, 8.25, 9, 7.5, 2, 0],
        backgroundColor: "rgba(153, 102, 255, 0.5)",
        borderColor: "rgb(153, 102, 255)",
        borderWidth: 1,
      },
    ],
  },
};

const Performance = () => {
  const [performanceData, _setPerformanceData] = useState(MOCK_PERFORMANCE);
  const [activeTab, setActiveTab] = useState("overview");
  const [chartType, setChartType] = useState({
    productivity: "line",
    taskCompletion: "bar",
    timeTracking: "bar",
  });

  // Chart options
  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
      },
    },
    scales: {
      y: {
        min: 0,
        max: 100,
      },
    },
    interaction: {
      mode: "nearest" as const,
      axis: "x" as const,
      intersect: false,
    },
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
  };

  const toggleChartType = (chart: string) => {
    setChartType((prev) => ({
      ...prev,
      [chart]: prev[chart as keyof typeof prev] === "line" ? "bar" : "line",
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">My Performance</h1>

      {/* Tabs - Changed to scrollable on mobile */}
      <div className="border-b border-gray-200 mb-6 overflow-x-auto">
        <nav className="flex -mb-px whitespace-nowrap">
          <button
            onClick={() => setActiveTab("overview")}
            className={`py-4 px-3 sm:px-6 font-medium text-sm ${
              activeTab === "overview"
                ? "border-b-2 border-indigo-500 text-indigo-600"
                : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("skills")}
            className={`py-4 px-3 sm:px-6 font-medium text-sm ${
              activeTab === "skills"
                ? "border-b-2 border-indigo-500 text-indigo-600"
                : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Skills & Ratings
          </button>
          <button
            onClick={() => setActiveTab("feedback")}
            className={`py-4 px-3 sm:px-6 font-medium text-sm ${
              activeTab === "feedback"
                ? "border-b-2 border-indigo-500 text-indigo-600"
                : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Feedback
          </button>
          <button
            onClick={() => setActiveTab("time")}
            className={`py-4 px-3 sm:px-6 font-medium text-sm ${
              activeTab === "time"
                ? "border-b-2 border-indigo-500 text-indigo-600"
                : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Time & Activity
          </button>
        </nav>
      </div>

      {/* Overview Tab Content */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Performance Summary Cards - Mobile responsive grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                Overall Rating
              </h3>
              <p className="text-2xl font-bold text-indigo-600">
                {performanceData.summary.overallRating}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                Productivity
              </h3>
              <div className="flex items-center">
                <p className="text-2xl font-bold text-gray-800">
                  {performanceData.summary.productivity}%
                </p>
                <div className="ml-auto w-12 h-12">
                  <Doughnut
                    data={{
                      datasets: [
                        {
                          data: [
                            performanceData.summary.productivity,
                            100 - performanceData.summary.productivity,
                          ],
                          backgroundColor: [
                            "rgba(99, 102, 241, 0.8)",
                            "rgba(229, 231, 235, 0.5)",
                          ],
                          borderWidth: 0,
                        },
                      ],
                    }}
                    options={{
                      cutout: "70%",
                      plugins: {
                        legend: {
                          display: false,
                        },
                        tooltip: {
                          enabled: false,
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                Task Completion
              </h3>
              <div className="flex items-center">
                <p className="text-2xl font-bold text-gray-800">
                  {performanceData.summary.taskCompletion}%
                </p>
                <div className="ml-auto w-12 h-12">
                  <Doughnut
                    data={{
                      datasets: [
                        {
                          data: [
                            performanceData.summary.taskCompletion,
                            100 - performanceData.summary.taskCompletion,
                          ],
                          backgroundColor: [
                            "rgba(59, 130, 246, 0.8)",
                            "rgba(229, 231, 235, 0.5)",
                          ],
                          borderWidth: 0,
                        },
                      ],
                    }}
                    options={{
                      cutout: "70%",
                      plugins: {
                        legend: {
                          display: false,
                        },
                        tooltip: {
                          enabled: false,
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                On-Time Delivery
              </h3>
              <div className="flex items-center">
                <p className="text-2xl font-bold text-gray-800">
                  {performanceData.summary.onTimeDelivery}%
                </p>
                <div className="ml-auto w-12 h-12">
                  <Doughnut
                    data={{
                      datasets: [
                        {
                          data: [
                            performanceData.summary.onTimeDelivery,
                            100 - performanceData.summary.onTimeDelivery,
                          ],
                          backgroundColor: [
                            "rgba(16, 185, 129, 0.8)",
                            "rgba(229, 231, 235, 0.5)",
                          ],
                          borderWidth: 0,
                        },
                      ],
                    }}
                    options={{
                      cutout: "70%",
                      plugins: {
                        legend: {
                          display: false,
                        },
                        tooltip: {
                          enabled: false,
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                Quality Rating
              </h3>
              <div className="flex items-center">
                <p className="text-2xl font-bold text-gray-800">
                  {performanceData.summary.qualityRating}%
                </p>
                <div className="ml-auto w-12 h-12">
                  <Doughnut
                    data={{
                      datasets: [
                        {
                          data: [
                            performanceData.summary.qualityRating,
                            100 - performanceData.summary.qualityRating,
                          ],
                          backgroundColor: [
                            "rgba(249, 115, 22, 0.8)",
                            "rgba(229, 231, 235, 0.5)",
                          ],
                          borderWidth: 0,
                        },
                      ],
                    }}
                    options={{
                      cutout: "70%",
                      plugins: {
                        legend: {
                          display: false,
                        },
                        tooltip: {
                          enabled: false,
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Performance Trend Charts - Made charts responsive with fixed heights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
                <h3 className="text-lg font-semibold text-gray-800">
                  Productivity Trend
                </h3>
                <button
                  onClick={() => toggleChartType("productivity")}
                  className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 py-1 px-2 rounded-md"
                >
                  Switch to {chartType.productivity === "line" ? "Bar" : "Line"}{" "}
                  Chart
                </button>
              </div>
              <div className="h-64">
                {chartType.productivity === "line" ? (
                  <Line
                    data={performanceData.productivityTrend}
                    options={lineOptions}
                  />
                ) : (
                  <Bar
                    data={performanceData.productivityTrend}
                    options={barOptions}
                  />
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
                <h3 className="text-lg font-semibold text-gray-800">
                  Task Completion
                </h3>
                <button
                  onClick={() => toggleChartType("taskCompletion")}
                  className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 py-1 px-2 rounded-md"
                >
                  Switch to{" "}
                  {chartType.taskCompletion === "bar" ? "Line" : "Bar"} Chart
                </button>
              </div>
              <div className="h-64">
                {chartType.taskCompletion === "bar" ? (
                  <Bar
                    data={performanceData.taskCompletionTrend}
                    options={barOptions}
                  />
                ) : (
                  <Line
                    data={performanceData.taskCompletionTrend}
                    options={{
                      ...lineOptions,
                      scales: {
                        y: {
                          beginAtZero: true,
                        },
                      },
                    }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Recent Achievements - Updated for mobile */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Recent Achievements
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {performanceData.achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="bg-indigo-50 p-4 rounded-lg"
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 bg-indigo-100 rounded-full p-3 text-2xl">
                      {achievement.icon}
                    </div>
                    <div className="ml-4">
                      <h4 className="text-base font-medium text-gray-900">
                        {achievement.title}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {achievement.date}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {achievement.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Skills & Ratings Tab Content */}
      {activeTab === "skills" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Skill Assessment
              </h3>
              <div className="h-80">
                <Bar
                  data={performanceData.skillsDistribution}
                  options={{
                    responsive: true,
                    indexAxis: "y" as const,
                    plugins: {
                      legend: {
                        display: false,
                      },
                    },
                    scales: {
                      x: {
                        max: 100,
                        title: {
                          display: true,
                          text: "Rating",
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Skills Distribution
              </h3>
              <div className="h-64">
                <Doughnut
                  data={performanceData.skillsDistribution}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: "bottom" as const,
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Skills Breakdown
            </h3>
            <div className="space-y-4">
              {performanceData.skillsDistribution.labels.map((skill, index) => (
                <div key={index}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      {skill}
                    </span>
                    <span className="text-sm font-medium text-gray-700">
                      {
                        performanceData.skillsDistribution.datasets[0].data[
                          index
                        ]
                      }
                      %
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${performanceData.skillsDistribution.datasets[0].data[index]}%`,
                        backgroundColor: performanceData.skillsDistribution
                          .datasets[0].backgroundColor[index] as string,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Feedback & Recognition Tab Content */}
      {activeTab === "feedback" && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Recent Feedback
            </h3>
            <div className="space-y-6">
              {performanceData.feedback.map((item) => (
                <div
                  key={item.id}
                  className="border-l-4 border-indigo-500 pl-4 py-2"
                >
                  <div className="flex items-center mb-2">
                    <img
                      src={item.avatar}
                      alt={item.from}
                      className="w-8 h-8 rounded-full mr-2"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {item.from}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(item.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="ml-auto flex">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          xmlns="http://www.w3.org/2000/svg"
                          className={`h-4 w-4 ${
                            i < item.rating
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }`}
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-700">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Achievements
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {performanceData.achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-indigo-500 hover:shadow-md transition-all"
                >
                  <div className="flex items-center mb-2">
                    <div className="flex-shrink-0 bg-indigo-100 rounded-full p-3 text-2xl">
                      {achievement.icon}
                    </div>
                    <div className="ml-3">
                      <h4 className="text-base font-medium text-gray-900">
                        {achievement.title}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {achievement.date}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    {achievement.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 text-center">
            <Link
              to="/employee/achievements"
              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
            >
              View All Achievements
            </Link>
          </div>
        </div>
      )}

      {/* Time & Activity Tab Content */}
      {activeTab === "time" && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
              <h3 className="text-lg font-semibold text-gray-800">
                Weekly Time Report
              </h3>
              <button
                onClick={() => toggleChartType("timeTracking")}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 py-1 px-2 rounded-md"
              >
                Switch to {chartType.timeTracking === "bar" ? "Line" : "Bar"}{" "}
                Chart
              </button>
            </div>
            <div className="h-64">
              {chartType.timeTracking === "bar" ? (
                <Bar data={performanceData.timeTracking} options={barOptions} />
              ) : (
                <Line
                  data={performanceData.timeTracking}
                  options={{
                    ...lineOptions,
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: 10,
                        title: {
                          display: true,
                          text: "Hours",
                        },
                      },
                    },
                  }}
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                Total Hours This Week
              </h3>
              <p className="text-2xl font-bold text-gray-800">
                {performanceData.timeTracking.datasets[0].data
                  .reduce((a, b) => a + b, 0)
                  .toFixed(1)}{" "}
                hours
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                Daily Average
              </h3>
              <p className="text-2xl font-bold text-gray-800">
                {(
                  performanceData.timeTracking.datasets[0].data.reduce(
                    (a, b) => a + b,
                    0
                  ) / 5
                ).toFixed(1)}{" "}
                hours
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                Overtime
              </h3>
              <p className="text-2xl font-bold text-gray-800">
                {Math.max(
                  performanceData.timeTracking.datasets[0].data.reduce(
                    (a, b) => a + b,
                    0
                  ) - 40,
                  0
                ).toFixed(1)}{" "}
                hours
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">
                Time Allocation by Project
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Project
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Hours
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Percentage
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Distribution
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        Website Redesign
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">18.5</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">44%</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-indigo-600 h-2.5 rounded-full"
                          style={{ width: "44%" }}
                        ></div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        User Authentication
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">12.0</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">29%</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-blue-500 h-2.5 rounded-full"
                          style={{ width: "29%" }}
                        ></div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        Market Research
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">7.5</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">18%</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-green-500 h-2.5 rounded-full"
                          style={{ width: "18%" }}
                        ></div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        E-commerce Platform
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">4.0</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">9%</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-yellow-500 h-2.5 rounded-full"
                          style={{ width: "9%" }}
                        ></div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Performance;
