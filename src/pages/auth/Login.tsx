import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  useErrorNotification,
  useSuccessNotification,
} from "../../contexts/NotificationContext";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, signInWithGoogle, setError, userData, currentUser } =
    useAuth();
  const [loading, setLoading] = useState(false);
  const showError = useErrorNotification();
  const showSuccess = useSuccessNotification();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  // Effect to navigate when userData is loaded
  useEffect(() => {
    if (currentUser && userData) {
      // Navigate based on user type
      if (userData.userType === "employer" || userData.userType === "manager") {
        navigate("/employer/dashboard");
      } else {
        navigate("/employee/dashboard");
      }
    }
  }, [userData, currentUser, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setError(null);
      showError("Sign in needed", "Please enter your email and password");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Call Firebase login
      await login(formData.email, formData.password);
      showSuccess("Login Successful", "You have been logged in successfully");

      // Store rememberMe preference if needed
      if (formData.rememberMe) {
        localStorage.setItem("rememberMe", formData.email);
      } else {
        localStorage.removeItem("rememberMe");
      }

      // Navigation will happen in the useEffect when userData is available
    } catch (err) {
      console.error("Login error:", err);
      // Display error notification here since we removed it from AuthContext
      showError(
        "Login Failed",
        err instanceof Error ? err.message : "Failed to login"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);

      // Call Firebase Google login
      await signInWithGoogle();
      showSuccess(
        "Login Successful",
        "You have been logged in with Google successfully"
      );

      // Navigation will happen in the useEffect when userData is available
    } catch (err) {
      console.error("Google login error:", err);
      // Display error notification here since we removed it from AuthContext
      showError(
        "Login Failed",
        err instanceof Error ? err.message : "Failed to login with Google"
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
              {/* Background circles */}
              <circle
                cx="400"
                cy="300"
                r="250"
                fill="#EEF2FF"
                className="animate-pulse"
                style={{ animationDuration: "5s" }}
              />
              <circle
                cx="400"
                cy="300"
                r="200"
                fill="#E0E7FF"
                className="animate-pulse"
                style={{ animationDuration: "6s" }}
              />

              {/* Animated elements */}
              <g
                className="animate-bounce"
                style={{
                  animationDuration: "3s",
                  transformOrigin: "center",
                  transformBox: "fill-box",
                }}
              >
                <rect
                  x="300"
                  y="220"
                  width="200"
                  height="140"
                  rx="10"
                  fill="#4F46E5"
                />
                <rect
                  x="320"
                  y="250"
                  width="160"
                  height="15"
                  rx="5"
                  fill="white"
                />
                <rect
                  x="320"
                  y="280"
                  width="160"
                  height="15"
                  rx="5"
                  fill="white"
                />
                <rect
                  x="320"
                  y="310"
                  width="100"
                  height="15"
                  rx="5"
                  fill="white"
                />
              </g>

              {/* Person working on computer - animated */}
              <g className="animate-pulse" style={{ animationDuration: "4s" }}>
                <circle cx="400" cy="150" r="40" fill="#818CF8" />
                <path
                  d="M380 190 L420 190 L440 290 L360 290 Z"
                  fill="#4F46E5"
                />
                <rect
                  x="340"
                  y="380"
                  width="120"
                  height="60"
                  rx="5"
                  fill="#4F46E5"
                />
                <rect x="370" y="290" width="60" height="90" fill="#818CF8" />
              </g>

              {/* Small floating elements */}
              <circle
                cx="500"
                cy="150"
                r="15"
                fill="#818CF8"
                className="animate-ping"
                style={{ animationDuration: "3s" }}
              />
              <circle
                cx="300"
                cy="200"
                r="10"
                fill="#4F46E5"
                className="animate-ping"
                style={{ animationDuration: "2s" }}
              />
              <circle
                cx="550"
                cy="400"
                r="12"
                fill="#4F46E5"
                className="animate-ping"
                style={{ animationDuration: "4s" }}
              />
              <circle
                cx="250"
                cy="400"
                r="8"
                fill="#818CF8"
                className="animate-ping"
                style={{ animationDuration: "5s" }}
              />
            </svg>

            <h2 className="mt-6 text-center text-3xl font-extrabold text-indigo-700">
              Welcome to WorkRate
            </h2>
            <p className="mt-2 text-center text-gray-600 text-lg">
              Track, manage, and optimize your team's productivity
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Login form */}
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
                style={{ animationDuration: "5s" }}
              />
              <circle
                cx="125"
                cy="90"
                r="60"
                fill="#E0E7FF"
                className="animate-pulse"
                style={{ animationDuration: "6s" }}
              />

              {/* Simplified elements for mobile */}
              <g className="animate-bounce" style={{ animationDuration: "3s" }}>
                <rect
                  x="95"
                  y="70"
                  width="60"
                  height="40"
                  rx="5"
                  fill="#4F46E5"
                />
                <rect
                  x="105"
                  y="80"
                  width="40"
                  height="5"
                  rx="2"
                  fill="white"
                />
                <rect
                  x="105"
                  y="90"
                  width="40"
                  height="5"
                  rx="2"
                  fill="white"
                />
                <rect
                  x="105"
                  y="100"
                  width="25"
                  height="5"
                  rx="2"
                  fill="white"
                />
              </g>

              {/* Person icon - simplified */}
              <circle
                cx="125"
                cy="45"
                r="15"
                fill="#818CF8"
                className="animate-pulse"
                style={{ animationDuration: "4s" }}
              />
              <path
                d="M115 60 L135 60 L140 90 L110 90 Z"
                fill="#4F46E5"
                className="animate-pulse"
                style={{ animationDuration: "4s" }}
              />

              {/* Small floating elements */}
              <circle
                cx="165"
                cy="50"
                r="6"
                fill="#818CF8"
                className="animate-ping"
                style={{ animationDuration: "3s" }}
              />
              <circle
                cx="85"
                cy="60"
                r="4"
                fill="#4F46E5"
                className="animate-ping"
                style={{ animationDuration: "2s" }}
              />
              <circle
                cx="175"
                cy="110"
                r="5"
                fill="#4F46E5"
                className="animate-ping"
                style={{ animationDuration: "4s" }}
              />
              <circle
                cx="75"
                cy="120"
                r="3"
                fill="#818CF8"
                className="animate-ping"
                style={{ animationDuration: "5s" }}
              />
            </svg>

            <div className="text-center">
              <h2 className="text-xl font-bold text-indigo-700">
                Welcome to WorkRate
              </h2>
              {/* <p className="text-sm text-gray-600">
                Track, manage, optimize
              </p> */}
            </div>
          </div>
        </div>

        <div className="w-full max-w-md mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Sign in</h2>
            <p className="text-gray-500">
              Enter your credentials to access your account
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
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
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="rememberMe"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a
                  href="#"
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Forgot password?
                </a>
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
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gradient-to-br from-indigo-50 via-white to-blue-50 text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className={`w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors duration-200 ${
                  loading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12.545 10.239v3.821h5.445c-.712 2.315-2.647 3.972-5.445 3.972-3.332 0-6.033-2.701-6.033-6.032s2.701-6.032 6.033-6.032c1.498 0 2.866.549 3.921 1.453l2.814-2.814C17.503 2.988 15.139 2 12.545 2 7.021 2 2.543 6.477 2.543 12s4.478 10 10.002 10c8.396 0 10.249-7.85 9.426-11.748l-9.426-.013z" />
                </svg>
              </button>

              <a
                href="#"
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors duration-200"
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z" />
                </svg>
              </a>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Need an account?{" "}
                <Link
                  to="/signup"
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Sign up now
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
