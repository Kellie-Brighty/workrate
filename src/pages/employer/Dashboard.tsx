import React from "react";

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

const EmployerDashboard: React.FC = () => {
  return (
    <div className="w-full bg-gray-50 min-h-screen">
      <header className="w-full bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">
            Dashboard
          </h1>
          <div className="flex items-center space-x-4">
            <button className="bg-indigo-600 px-4 py-2 text-white rounded-md text-sm font-medium hover:bg-indigo-700">
              + New Project
            </button>
            <div className="relative">
              <button className="flex items-center text-sm font-medium text-gray-700 focus:outline-none">
                <img
                  className="h-8 w-8 rounded-full border-2 border-gray-200"
                  src="https://randomuser.me/api/portraits/women/42.jpg"
                  alt="Profile"
                />
                <span className="ml-2 hidden sm:inline">Sarah Mitchell</span>
                <svg
                  className="ml-1 h-5 w-5 text-gray-400"
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
                <a
                  href="#"
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  View all<span className="sr-only"> employees</span>
                </a>
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
                <a
                  href="#"
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  View all<span className="sr-only"> projects</span>
                </a>
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
                <a
                  href="#"
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  View details
                </a>
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
                <a
                  href="#"
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  View details
                </a>
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
              <button className="w-full text-center text-sm font-medium text-indigo-600 hover:text-indigo-500">
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
                <button className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
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
                <button className="w-full flex justify-center items-center text-sm font-medium text-indigo-600 hover:text-indigo-500">
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
      </main>
    </div>
  );
};

export default EmployerDashboard;
