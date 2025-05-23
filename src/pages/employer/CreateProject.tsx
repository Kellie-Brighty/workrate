import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createProject, getEmployees } from "../../services/firebase";
import { useAuth } from "../../contexts/AuthContext";
import {
  useSuccessNotification,
  useErrorNotification,
} from "../../contexts/NotificationContext";

// Will be replaced with real data

const CreateProject: React.FC = () => {
  const navigate = useNavigate();
  const { userData } = useAuth();
  const showSuccess = useSuccessNotification();
  const showError = useErrorNotification();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    timeUnit: "days" as "days" | "hours",
    estimatedHours: 0,
    priority: "medium",
    category: "",
  });

  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [showEmployeeSelector, setShowEmployeeSelector] = useState(false);
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);

  // AI Task Generation options
  const [taskGenOptions, setTaskGenOptions] = useState({
    autoAssign: false,
    setDeadlines: false,
    createDependencies: false,
  });

  // Fetch employees when component loads
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        if (userData?.id) {
          setLoadingEmployees(true);
          const employeeData = await getEmployees(userData.id);
          setEmployees(employeeData);
        }
      } catch (error) {
        console.error("Error fetching employees:", error);
        showError("Error", "Failed to load employees");
      } finally {
        setLoadingEmployees(false);
      }
    };

    fetchEmployees();
  }, [userData?.id]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle AI task generation options change
  const handleTaskGenOptionChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, checked } = e.target;
    setTaskGenOptions((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const toggleEmployeeSelection = (employeeId: string) => {
    setSelectedEmployees((prev) =>
      prev.includes(employeeId)
        ? prev.filter((id) => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userData?.id) {
      showError("Error", "User information not available");
      return;
    }

    setLoading(true);

    try {
      // Use the selectedEmployees directly as they are now Firebase IDs
      const teamMembers = selectedEmployees;

      // Determine startDate value
      let startDateToUse = formData.startDate;
      if (formData.timeUnit === "hours") {
        // Use current timestamp for hourly-based projects
        startDateToUse = new Date().toISOString();
      }

      // Map form data to ProjectData structure
      const projectData = {
        name: formData.title,
        description: formData.description,
        startDate: startDateToUse,
        endDate: formData.endDate,
        priority: formData.priority,
        category: formData.category,
        team: teamMembers,
        status: "Not Started",
        progress: 0,
        createdBy: userData.id,
        timeUnit: formData.timeUnit,
        estimatedHours:
          formData.timeUnit === "hours" ? formData.estimatedHours : undefined,
        // Add AI task generation options
        taskGeneration: {
          autoAssign: taskGenOptions.autoAssign,
          setDeadlines: taskGenOptions.setDeadlines,
          createDependencies: taskGenOptions.createDependencies,
        },
      };

      // Create project in Firebase
      await createProject(projectData);

      showSuccess(
        "Project Created",
        `Project "${formData.title}" was created successfully!`
      );

      // Navigate to the projects page
      navigate("/employer/projects");
    } catch (error) {
      console.error("Error creating project:", error);
      showError(
        "Project Creation Failed",
        "There was a problem creating your project. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Use real employee data instead of mock data
  const selectedEmployeesData = employees.filter((employee) =>
    selectedEmployees.includes(employee.id)
  );

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Create New Project
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Project Information
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Fill out the details below to create a new project
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="px-4 py-5 sm:p-6">
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-4">
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Project Title
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="title"
                      id="title"
                      required
                      value={formData.title}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="e.g. Website Redesign"
                    />
                  </div>
                </div>

                <div className="sm:col-span-6">
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Description
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="description"
                      name="description"
                      required
                      rows={4}
                      value={formData.description}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="Describe the project goals, scope, and deliverables..."
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="timeUnit"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Time Unit
                  </label>
                  <div className="mt-1">
                    <select
                      id="timeUnit"
                      name="timeUnit"
                      required
                      value={formData.timeUnit}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    >
                      <option value="days">Days</option>
                      <option value="hours">Hours</option>
                    </select>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="startDate"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Start Date
                  </label>
                  <div className="mt-1">
                    <input
                      type="date"
                      name="startDate"
                      id="startDate"
                      required
                      value={formData.startDate}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                {formData.timeUnit === "hours" ? (
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="estimatedHours"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Estimated Hours
                    </label>
                    <div className="mt-1">
                      <input
                        type="number"
                        name="estimatedHours"
                        id="estimatedHours"
                        min="0"
                        step="0.5"
                        required
                        value={formData.estimatedHours}
                        onChange={handleChange}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="endDate"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Estimated End Date
                    </label>
                    <div className="mt-1">
                      <input
                        type="date"
                        name="endDate"
                        id="endDate"
                        required
                        value={formData.endDate}
                        onChange={handleChange}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                )}

                <div className="sm:col-span-2">
                  <label
                    htmlFor="priority"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Priority
                  </label>
                  <div className="mt-1">
                    <select
                      id="priority"
                      name="priority"
                      required
                      value={formData.priority}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label
                    htmlFor="category"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Category
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="category"
                      id="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="e.g. Development, Marketing, Design"
                    />
                  </div>
                </div>

                <div className="sm:col-span-6">
                  <div className="flex justify-between items-center">
                    <label className="block text-sm font-medium text-gray-700">
                      Team Members
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setShowEmployeeSelector(!showEmployeeSelector)
                      }
                      className="text-sm text-indigo-600 hover:text-indigo-900"
                    >
                      {showEmployeeSelector ? "Close" : "Add Team Members"}
                    </button>
                  </div>

                  {selectedEmployeesData.length > 0 && (
                    <div className="mt-2 mb-4">
                      <div className="flex flex-wrap -m-1">
                        {selectedEmployeesData.map((employee) => (
                          <div
                            key={employee.id}
                            className="m-1 pl-2 pr-1 py-1 flex items-center bg-indigo-100 rounded-full"
                          >
                            <img
                              src={employee.avatar}
                              alt={employee.name}
                              className="h-6 w-6 rounded-full mr-2"
                            />
                            <span className="text-sm text-indigo-800">
                              {employee.name}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                toggleEmployeeSelection(employee.id)
                              }
                              className="ml-1 p-1 rounded-full text-indigo-500 hover:bg-indigo-200"
                            >
                              <svg
                                className="h-4 w-4"
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
                        ))}
                      </div>
                    </div>
                  )}

                  {showEmployeeSelector && (
                    <div className="mt-2 border border-gray-200 rounded-md overflow-hidden">
                      <div className="max-h-60 overflow-y-auto">
                        {loadingEmployees ? (
                          <div className="p-4 text-center text-gray-500">
                            Loading employees...
                          </div>
                        ) : employees.length === 0 ? (
                          <div className="p-4 text-center text-gray-500">
                            No employees found
                          </div>
                        ) : (
                          <ul className="divide-y divide-gray-200">
                            {employees.map((employee) => (
                              <li
                                key={employee.id}
                                className="p-3 hover:bg-gray-50"
                              >
                                <div className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={selectedEmployees.includes(
                                      employee.id
                                    )}
                                    onChange={() =>
                                      toggleEmployeeSelection(employee.id)
                                    }
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                  />
                                  <div className="ml-3 flex items-center">
                                    <img
                                      src={employee.avatar}
                                      alt={employee.name}
                                      className="h-8 w-8 rounded-full mr-3"
                                    />
                                    <div>
                                      <div className="text-sm font-medium text-gray-900">
                                        {employee.name}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {employee.position}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="px-4 py-3 bg-gray-50 text-right sm:px-6 flex justify-end">
              <button
                type="button"
                onClick={() => navigate("/employer/projects")}
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-3"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                  loading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Creating Project...
                  </span>
                ) : (
                  "Create Project"
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Smart Task Generation
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Our AI system will analyze your project and automatically break it
              down into tasks
            </p>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <fieldset>
              <legend className="text-base font-medium text-gray-900">
                Task Generation Options
              </legend>
              <div className="mt-4 space-y-4">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="autoAssign"
                      name="autoAssign"
                      type="checkbox"
                      checked={taskGenOptions.autoAssign}
                      onChange={handleTaskGenOptionChange}
                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label
                      htmlFor="autoAssign"
                      className="font-medium text-gray-700"
                    >
                      Auto-assign tasks based on skills
                    </label>
                    <p className="text-gray-500">
                      The system will automatically assign tasks to team members
                      based on their skills and workload.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="setDeadlines"
                      name="setDeadlines"
                      type="checkbox"
                      checked={taskGenOptions.setDeadlines}
                      onChange={handleTaskGenOptionChange}
                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label
                      htmlFor="setDeadlines"
                      className="font-medium text-gray-700"
                    >
                      Set task deadlines automatically
                    </label>
                    <p className="text-gray-500">
                      The system will automatically set deadlines for tasks
                      based on project timeline and dependencies.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="createDependencies"
                      name="createDependencies"
                      type="checkbox"
                      checked={taskGenOptions.createDependencies}
                      onChange={handleTaskGenOptionChange}
                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label
                      htmlFor="createDependencies"
                      className="font-medium text-gray-700"
                    >
                      Create task dependencies
                    </label>
                    <p className="text-gray-500">
                      The system will analyze and create dependencies between
                      tasks automatically.
                    </p>
                  </div>
                </div>
              </div>
            </fieldset>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateProject;
