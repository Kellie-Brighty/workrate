import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    companyName: "",
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted with:", formData);
    // Navigate to employer dashboard after form submission
    navigate("/employer/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex w-screen">
      {/* Left side - Fixed Illustration (desktop only) */}
      <div className="hidden lg:block lg:w-1/2 fixed top-0 left-0 h-full bg-indigo-600 bg-opacity-10">
        <div className="flex items-center justify-center h-full p-12">
          <div className="max-w-md w-full">
            {/* Animated SVG Illustration */}
            <svg
              className="w-full"
              viewBox="0 0 800 600"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Background elements */}
              <circle
                cx="400"
                cy="300"
                r="250"
                fill="#EEF2FF"
                className="animate-pulse"
                style={{ animationDuration: "6s" }}
              />
              <circle
                cx="400"
                cy="300"
                r="200"
                fill="#E0E7FF"
                className="animate-pulse"
                style={{ animationDuration: "7s" }}
              />

              {/* Company elements */}
              <g className="animate-pulse" style={{ animationDuration: "4s" }}>
                <rect
                  x="250"
                  y="200"
                  width="300"
                  height="200"
                  rx="20"
                  fill="#4F46E5"
                />
                <rect
                  x="280"
                  y="240"
                  width="240"
                  height="20"
                  rx="5"
                  fill="white"
                />
                <rect
                  x="280"
                  y="280"
                  width="240"
                  height="20"
                  rx="5"
                  fill="white"
                />
                <rect
                  x="280"
                  y="320"
                  width="160"
                  height="20"
                  rx="5"
                  fill="white"
                />
              </g>

              {/* Abstract floating elements */}
              <circle
                cx="200"
                cy="200"
                r="20"
                fill="#818CF8"
                className="animate-bounce"
                style={{ animationDuration: "2s" }}
              />
              <circle
                cx="600"
                cy="200"
                r="15"
                fill="#C7D2FE"
                className="animate-bounce"
                style={{ animationDuration: "3s" }}
              />
              <circle
                cx="200"
                cy="400"
                r="25"
                fill="#C7D2FE"
                className="animate-bounce"
                style={{ animationDuration: "4s" }}
              />
              <circle
                cx="600"
                cy="400"
                r="18"
                fill="#818CF8"
                className="animate-bounce"
                style={{ animationDuration: "3.5s" }}
              />

              {/* Team members */}
              <g className="animate-pulse" style={{ animationDuration: "5s" }}>
                <circle cx="300" cy="150" r="30" fill="#4F46E5" />
                <circle cx="400" cy="130" r="30" fill="#818CF8" />
                <circle cx="500" cy="150" r="30" fill="#4F46E5" />

                {/* Connection lines */}
                <line
                  x1="330"
                  y1="150"
                  x2="370"
                  y2="130"
                  stroke="#C7D2FE"
                  strokeWidth="4"
                />
                <line
                  x1="430"
                  y1="130"
                  x2="470"
                  y2="150"
                  stroke="#C7D2FE"
                  strokeWidth="4"
                />

                {/* Data lines - animated */}
                <g className="animate-ping" style={{ animationDuration: "4s" }}>
                  <circle cx="350" cy="140" r="5" fill="white" />
                  <circle cx="450" cy="140" r="5" fill="white" />
                </g>
              </g>
            </svg>

            <h2 className="mt-6 text-center text-3xl font-extrabold text-indigo-700">
              Create your WorkRate account
            </h2>
            <p className="mt-2 text-center text-gray-600 text-lg">
              Start tracking and optimizing your team's performance
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Sign Up form */}
      <div className="w-full lg:w-1/2 lg:ml-auto overflow-y-auto p-8">
        {/* Mobile illustration */}
        <div className="lg:hidden mb-8">
          <div className="relative w-full max-w-[250px] h-[180px] mx-auto">
            {/* Animated mobile illustration */}
            <svg
              className="w-full"
              viewBox="0 0 250 180"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Background gradient */}
              <circle
                cx="125"
                cy="90"
                r="80"
                fill="#EEF2FF"
                className="animate-pulse"
                style={{ animationDuration: "6s" }}
              />
              <circle
                cx="125"
                cy="90"
                r="60"
                fill="#E0E7FF"
                className="animate-pulse"
                style={{ animationDuration: "7s" }}
              />

              {/* Simplified document elements for mobile */}
              <g className="animate-pulse" style={{ animationDuration: "4s" }}>
                <rect
                  x="85"
                  y="60"
                  width="80"
                  height="60"
                  rx="8"
                  fill="#4F46E5"
                />
                <rect x="95" y="75" width="60" height="5" rx="2" fill="white" />
                <rect x="95" y="85" width="60" height="5" rx="2" fill="white" />
                <rect x="95" y="95" width="40" height="5" rx="2" fill="white" />
              </g>

              {/* Team members - simplified */}
              <g className="animate-bounce" style={{ animationDuration: "3s" }}>
                <circle cx="95" cy="45" r="12" fill="#4F46E5" />
                <circle cx="125" cy="38" r="12" fill="#818CF8" />
                <circle cx="155" cy="45" r="12" fill="#4F46E5" />

                {/* Connection lines */}
                <line
                  x1="107"
                  y1="45"
                  x2="113"
                  y2="38"
                  stroke="#C7D2FE"
                  strokeWidth="2"
                />
                <line
                  x1="137"
                  y1="38"
                  x2="143"
                  y2="45"
                  stroke="#C7D2FE"
                  strokeWidth="2"
                />
              </g>

              {/* Data transmission dots - animated */}
              <g className="animate-ping" style={{ animationDuration: "4s" }}>
                <circle cx="110" cy="42" r="3" fill="white" />
                <circle cx="140" cy="42" r="3" fill="white" />
              </g>

              {/* Small floating elements */}
              <circle
                cx="70"
                cy="60"
                r="5"
                fill="#818CF8"
                className="animate-ping"
                style={{ animationDuration: "2s" }}
              />
              <circle
                cx="180"
                cy="60"
                r="4"
                fill="#C7D2FE"
                className="animate-ping"
                style={{ animationDuration: "3s" }}
              />
              <circle
                cx="70"
                cy="120"
                r="6"
                fill="#C7D2FE"
                className="animate-ping"
                style={{ animationDuration: "4s" }}
              />
              <circle
                cx="180"
                cy="120"
                r="5"
                fill="#818CF8"
                className="animate-ping"
                style={{ animationDuration: "3.5s" }}
              />
            </svg>

            <div className="text-center">
              <h2 className="text-xl font-bold text-indigo-700">
                Join WorkRate
              </h2>
              {/* <p className="text-sm text-gray-600">Create your account today</p> */}
            </div>
          </div>
        </div>

        <div className="w-full max-w-md mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Sign up</h2>
            <p className="text-gray-500">
              Create an employer account to get started
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="companyName"
                className="block text-sm font-medium text-gray-700"
              >
                Company Name
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4zm3 1h6v4H7V5zm6 6H7v2h6v-2z"
                      clipRule="evenodd"
                    />
                    <path d="M7 14h6v2H7v-2z" />
                  </svg>
                </div>
                <input
                  id="companyName"
                  name="companyName"
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={handleChange}
                  className="pl-10 appearance-none block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Your company name"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-gray-700"
              >
                Full Name
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
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
                </div>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  className="pl-10 appearance-none block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Your full name"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10 appearance-none block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10 appearance-none block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Password must be at least 8 characters long
              </p>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Confirm Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="pl-10 appearance-none block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
              >
                Create Account
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Sign in
              </Link>
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-center text-gray-500">
              By creating an account, you agree to our{" "}
              <a href="#" className="text-indigo-600 hover:text-indigo-500">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-indigo-600 hover:text-indigo-500">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
