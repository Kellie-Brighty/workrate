import React, { useState } from "react";

// Mock data
const employeesList = [
  {
    id: 1,
    name: "Jason Chen",
    title: "UI/UX Designer",
    avatar: "https://randomuser.me/api/portraits/men/42.jpg",
  },
  {
    id: 2,
    name: "Sarah Johnson",
    title: "Frontend Developer",
    avatar: "https://randomuser.me/api/portraits/women/43.jpg",
  },
  {
    id: 3,
    name: "Michael Brown",
    title: "Backend Developer",
    avatar: "https://randomuser.me/api/portraits/men/44.jpg",
  },
  {
    id: 4,
    name: "Emily Davis",
    title: "Product Manager",
    avatar: "https://randomuser.me/api/portraits/women/45.jpg",
  },
  {
    id: 5,
    name: "David Wilson",
    title: "QA Engineer",
    avatar: "https://randomuser.me/api/portraits/men/46.jpg",
  },
  {
    id: 6,
    name: "Lisa Martinez",
    title: "Data Analyst",
    avatar: "https://randomuser.me/api/portraits/women/47.jpg",
  },
];

const CreateProject: React.FC = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    priority: "medium",
    category: "",
  });

  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
  const [showEmployeeSelector, setShowEmployeeSelector] = useState(false);

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

  const toggleEmployeeSelection = (employeeId: number) => {
    setSelectedEmployees((prev) =>
      prev.includes(employeeId)
        ? prev.filter((id) => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted with:", formData);
    console.log("Selected employees:", selectedEmployees);
    // Here we would send the data to the backend to create the project
  };

  const selectedEmployeesData = employeesList.filter((employee) =>
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
                        <ul className="divide-y divide-gray-200">
                          {employeesList.map((employee) => (
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
                                      {employee.title}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="px-4 py-3 bg-gray-50 text-right sm:px-6 flex justify-end">
              <button
                type="button"
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-3"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Create Project
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
                      id="auto-assign"
                      name="auto-assign"
                      type="checkbox"
                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label
                      htmlFor="auto-assign"
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
                      id="set-deadlines"
                      name="set-deadlines"
                      type="checkbox"
                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label
                      htmlFor="set-deadlines"
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
                      id="dependency-analysis"
                      name="dependency-analysis"
                      type="checkbox"
                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label
                      htmlFor="dependency-analysis"
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
