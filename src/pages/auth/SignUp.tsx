import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  useErrorNotification,
  useSuccessNotification,
} from "../../contexts/NotificationContext";

const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const { register, error, setError, userData, currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const showError = useErrorNotification();
  const showSuccess = useSuccessNotification();
  const [formData, setFormData] = useState({
    companyName: "",
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    userType: "employer" as "employer" | "employee", // Default to employer
  });

  // Effect to navigate when userData is loaded
  useEffect(() => {
    if (currentUser && userData) {
      // Navigate based on user type
      if (userData.userType === "employer") {
        navigate("/employer/dashboard");
      } else {
        navigate("/employee/dashboard");
      }
    }
  }, [userData, currentUser, navigate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Form validation
    if (
      !formData.companyName ||
      !formData.fullName ||
      !formData.email ||
      !formData.password
    ) {
      setError("Please fill in all required fields");
      showError("Registration Failed", "Please fill in all required fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      showError("Registration Failed", "Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      showError(
        "Registration Failed",
        "Password must be at least 6 characters"
      );
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Register with Firebase and store additional data in Firestore
      const userData = {
        companyName: formData.companyName,
        fullName: formData.fullName,
        userType: formData.userType,
      };

      await register(formData.email, formData.password, userData);
      showSuccess(
        "Registration Successful",
        "Your account has been created successfully"
      );

      // Navigation will happen in the useEffect when userData is available
    } catch (err) {
      console.error("Sign up error:", err);
      // Display error notification here since we removed it from AuthContext
      showError(
        "Registration Failed",
        err instanceof Error ? err.message : "Failed to register"
      );
    } finally {
      setLoading(false);
    }
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

              {/* Simplified company element */}
              <g className="animate-pulse" style={{ animationDuration: "4s" }}>
                <rect
                  x="85"
                  y="75"
                  width="80"
                  height="50"
                  rx="5"
                  fill="#4F46E5"
                />
                <rect x="95" y="85" width="60" height="5" rx="1" fill="white" />
                <rect x="95" y="95" width="60" height="5" rx="1" fill="white" />
                <rect
                  x="95"
                  y="105"
                  width="40"
                  height="5"
                  rx="1"
                  fill="white"
                />
              </g>

              {/* Simplified team members */}
              <circle
                cx="100"
                cy="55"
                r="8"
                fill="#4F46E5"
                className="animate-pulse"
              />
              <circle
                cx="125"
                cy="50"
                r="8"
                fill="#818CF8"
                className="animate-pulse"
              />
              <circle
                cx="150"
                cy="55"
                r="8"
                fill="#4F46E5"
                className="animate-pulse"
              />

              {/* Connection lines */}
              <line
                x1="108"
                y1="55"
                x2="117"
                y2="50"
                stroke="#C7D2FE"
                strokeWidth="1"
              />
              <line
                x1="133"
                y1="50"
                x2="142"
                y2="55"
                stroke="#C7D2FE"
                strokeWidth="1"
              />
            </svg>

            <div className="text-center">
              <h2 className="text-xl font-bold text-indigo-700">
                Create your account
              </h2>
              <p className="text-sm text-gray-600">Track, optimize, succeed</p>
            </div>
          </div>
        </div>

        <div className="w-full max-w-md mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Sign up</h2>
            <p className="text-gray-500">
              Create your account to start tracking productivity
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-100 border border-red-200 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="userType"
                className="block text-sm font-medium text-gray-700"
              >
                Account Type
              </label>
              <div className="mt-1">
                <select
                  id="userType"
                  name="userType"
                  value={formData.userType}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="employer">Employer (Manager)</option>
                  <option value="employee">Employee</option>
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="companyName"
                className="block text-sm font-medium text-gray-700"
              >
                Company Name
              </label>
              <div className="mt-1">
                <input
                  id="companyName"
                  name="companyName"
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Acme Inc."
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
              <div className="mt-1">
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="John Doe"
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
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Password must be at least 6 characters
              </p>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Confirm Password
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 ${
                  loading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {loading ? "Creating Account..." : "Sign up"}
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
        </div>
      </div>
    </div>
  );
};

export default SignUp;
