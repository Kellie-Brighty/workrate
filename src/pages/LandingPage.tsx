import React from "react";
import { Link } from "react-router-dom";

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="w-full max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
        <header className="flex flex-col md:flex-row justify-between items-center mb-10 md:mb-16">
          <div className="text-3xl font-bold text-indigo-600 mb-4 md:mb-0">
            Workrate
          </div>
          <div className="space-x-2 md:space-x-4">
            <Link
              to="/login"
              className="px-4 py-2 text-indigo-600 font-medium rounded hover:bg-indigo-50 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="px-4 py-2 bg-indigo-600 text-white font-medium rounded hover:bg-indigo-700 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </header>

        <main className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Smart Employee Management & Tracking
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8">
              Boost productivity, track projects, and reward your team with our
              intelligent workplace management platform.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Link
                to="/signup"
                className="w-full sm:w-auto px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors text-center"
              >
                Create Your Workspace
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-center"
              >
                Learn More
              </Link>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="flex justify-center">
              <svg
                className="w-full max-w-2xl"
                viewBox="0 0 650 400"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect width="650" height="400" rx="10" fill="#F3F4F6" />
                {/* Dashboard Frame */}
                <rect
                  x="50"
                  y="50"
                  width="550"
                  height="300"
                  rx="8"
                  fill="white"
                  stroke="#E5E7EB"
                  strokeWidth="2"
                />

                {/* Top navigation bar */}
                <rect
                  x="50"
                  y="50"
                  width="550"
                  height="50"
                  rx="8 8 0 0"
                  fill="#4F46E5"
                />
                <circle cx="85" cy="75" r="10" fill="#9EA3F9" />
                <rect
                  x="105"
                  y="70"
                  width="100"
                  height="10"
                  rx="2"
                  fill="#9EA3F9"
                />
                <circle cx="565" cy="75" r="15" fill="#9EA3F9" />

                {/* Sidebar */}
                <rect x="50" y="100" width="120" height="250" fill="#F9FAFB" />
                {/* Sidebar menu items */}
                <rect
                  x="70"
                  y="130"
                  width="80"
                  height="8"
                  rx="2"
                  fill="#4F46E5"
                />
                <rect
                  x="70"
                  y="160"
                  width="80"
                  height="8"
                  rx="2"
                  fill="#D1D5DB"
                />
                <rect
                  x="70"
                  y="190"
                  width="80"
                  height="8"
                  rx="2"
                  fill="#D1D5DB"
                />
                <rect
                  x="70"
                  y="220"
                  width="80"
                  height="8"
                  rx="2"
                  fill="#D1D5DB"
                />

                {/* Main content area */}
                <rect
                  x="190"
                  y="120"
                  width="380"
                  height="80"
                  rx="4"
                  fill="#F3F4F6"
                />
                <rect
                  x="210"
                  y="140"
                  width="100"
                  height="10"
                  rx="2"
                  fill="#4F46E5"
                />
                <rect
                  x="210"
                  y="160"
                  width="150"
                  height="6"
                  rx="1"
                  fill="#9CA3AF"
                />
                <rect
                  x="400"
                  y="140"
                  width="150"
                  height="40"
                  rx="4"
                  fill="#EEF2FF"
                />
                <rect
                  x="420"
                  y="155"
                  width="60"
                  height="10"
                  rx="2"
                  fill="#4F46E5"
                />
                <rect
                  x="500"
                  y="155"
                  width="30"
                  height="10"
                  rx="2"
                  fill="#4F46E5"
                />

                {/* Stats widgets */}
                <rect
                  x="190"
                  y="220"
                  width="120"
                  height="100"
                  rx="4"
                  fill="#EEF2FF"
                />
                <rect
                  x="210"
                  y="240"
                  width="80"
                  height="20"
                  rx="2"
                  fill="#4F46E5"
                />
                <rect
                  x="210"
                  y="270"
                  width="60"
                  height="8"
                  rx="1"
                  fill="#9CA3AF"
                />
                <rect
                  x="210"
                  y="290"
                  width="80"
                  height="8"
                  rx="1"
                  fill="#9CA3AF"
                />

                <rect
                  x="320"
                  y="220"
                  width="120"
                  height="100"
                  rx="4"
                  fill="#ECFDF5"
                />
                <rect
                  x="340"
                  y="240"
                  width="80"
                  height="20"
                  rx="2"
                  fill="#10B981"
                />
                <rect
                  x="340"
                  y="270"
                  width="60"
                  height="8"
                  rx="1"
                  fill="#9CA3AF"
                />
                <rect
                  x="340"
                  y="290"
                  width="80"
                  height="8"
                  rx="1"
                  fill="#9CA3AF"
                />

                <rect
                  x="450"
                  y="220"
                  width="120"
                  height="100"
                  rx="4"
                  fill="#FEF2F2"
                />
                <rect
                  x="470"
                  y="240"
                  width="80"
                  height="20"
                  rx="2"
                  fill="#EF4444"
                />
                <rect
                  x="470"
                  y="270"
                  width="60"
                  height="8"
                  rx="1"
                  fill="#9CA3AF"
                />
                <rect
                  x="470"
                  y="290"
                  width="80"
                  height="8"
                  rx="1"
                  fill="#9CA3AF"
                />
              </svg>
            </div>
          </div>
        </main>

        <section className="mt-16 md:mt-24 w-full">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-8 md:mb-12">
            Why Choose Workrate?
          </h2>
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            <div className="p-6 bg-white rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4">
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
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Smart Task Management
              </h3>
              <p className="text-gray-600">
                Our AI automatically breaks down projects into manageable tasks
                based on employee roles.
              </p>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4">
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
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Performance Analytics
              </h3>
              <p className="text-gray-600">
                Track employee performance with comprehensive dashboards and
                actionable insights.
              </p>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4">
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
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Reward & Recognition
              </h3>
              <p className="text-gray-600">
                Motivate your team with a built-in recognition system that
                rewards great performance.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LandingPage;
