import React, { useState, useEffect } from "react";
import Modal from "../../components/Modal";
import BulkEmployeeUpload from "../../components/BulkEmployeeUpload";
import { useAuth } from "../../contexts/AuthContext";
import {
  useSuccessNotification,
  useErrorNotification,
} from "../../contexts/NotificationContext";
import {
  getEmployees,
  createEmployee,
  updateEmployee,
  getEmployeePerformance,
} from "../../services/firebase";

// Define EmployeeData interface locally
interface EmployeeData {
  name: string;
  email: string;
  position: string;
  department: string;
  status?: "active" | "inactive";
  joinDate?: string;
  avatar?: string;
  employerId?: string;
  tempPassword?: string;
  accountCreated?: boolean;
}

// Predefined list of common departments
const PREDEFINED_DEPARTMENTS = [
  "Engineering",
  "Product",
  "Marketing",
  "Sales",
  "Customer Support",
  "Human Resources",
  "Finance",
  "Operations",
  "Research and Development",
  "Legal",
  "IT",
  "Administration",
  "Design",
  "Quality Assurance",
  "Business Development",
];

const Employees: React.FC = () => {
  const { userData } = useAuth();
  const showSuccess = useSuccessNotification();
  const showError = useErrorNotification();

  // Check if user is a manager
  const isManager = userData?.userType === "manager";

  // Get the relevant employer ID (either the user's ID or the manager's employerId)
  const relevantEmployerId = isManager ? userData?.employerId : userData?.id;

  const [employees, setEmployees] = useState<any[]>([]);
  const [_loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null);
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    email: "",
    position: "",
    department: "",
  });

  // Add loading states for actions
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>(
    {}
  );

  // State for employee performance data
  const [selectedEmployeePerformance, setSelectedEmployeePerformance] =
    useState<any>(null);
  const [loadingPerformance, setLoadingPerformance] = useState(false);

  // Fetch employees on component mount
  useEffect(() => {
    const fetchEmployees = async () => {
      if (!relevantEmployerId) return;

      try {
        setLoading(true);
        const employeesData = await getEmployees(relevantEmployerId);
        setEmployees(employeesData);
      } catch (error) {
        console.error("Error fetching employees:", error);
        showError("Error", "Failed to load employees");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [relevantEmployerId]);

  // Filter employees based on search term and filters
  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.position.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || employee.status === statusFilter;

    const matchesDepartment =
      departmentFilter === "all" || employee.department === departmentFilter;

    return matchesSearch && matchesStatus && matchesDepartment;
  });

  // Get unique departments for filter dropdown
  const departments = [...new Set(employees.map((emp) => emp.department))];

  // Toggle employee status
  const toggleEmployeeStatus = async (id: string) => {
    try {
      // Set loading state for this specific action
      setActionLoading((prev) => ({ ...prev, [id]: true }));

      // Find employee to toggle
      const employeeToUpdate = employees.find((emp) => emp.id === id);

      if (!employeeToUpdate) {
        showError("Error", "Employee not found");
        return;
      }

      // Determine the new status
      const newStatus =
        employeeToUpdate.status === "active" ? "inactive" : "active";

      // Update in Firebase
      await updateEmployee(id, { status: newStatus });

      // Update local state
      setEmployees(
        employees.map((emp) =>
          emp.id === id ? { ...emp, status: newStatus } : emp
        )
      );

      showSuccess(
        "Status Updated",
        `Employee ${employeeToUpdate.name} ${
          newStatus === "active" ? "activated" : "deactivated"
        } successfully`
      );
    } catch (error) {
      console.error("Error toggling employee status:", error);
      showError("Error", "Failed to update employee status. Please try again.");
    } finally {
      // Clear loading state
      setActionLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  // View employee details
  const viewEmployeeDetails = async (employee: any) => {
    setSelectedEmployee(employee);
    setShowDetailsModal(true);

    // Fetch performance data for the selected employee
    try {
      setLoadingPerformance(true);
      const performanceData = await getEmployeePerformance(employee.id);
      setSelectedEmployeePerformance(performanceData);
    } catch (error) {
      console.error("Error fetching employee performance:", error);
      setSelectedEmployeePerformance(null);
    } finally {
      setLoadingPerformance(false);
    }
  };

  // Handle new employee input change
  const handleNewEmployeeChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setNewEmployee({
      ...newEmployee,
      [e.target.name]: e.target.value,
    });
  };

  // Add new employee
  const addEmployee = async () => {
    if (!relevantEmployerId) {
      // @ts-ignore - Ignore type checking for this call
      showError("Error", "User information not available");
      return;
    }

    try {
      const employeeData: EmployeeData = {
        ...newEmployee,
        employerId: relevantEmployerId,
      };

      const newEmployeeObj = await createEmployee(employeeData);
      setEmployees([...employees, newEmployeeObj]);
      // @ts-ignore - Ignore type checking for this call
      showSuccess("Success", "Employee added successfully!");
      setShowAddModal(false);
      setNewEmployee({
        name: "",
        email: "",
        position: "",
        department: "",
      });

      // Open the employee details modal to show the credentials
      if (newEmployeeObj.accountCreated && newEmployeeObj.tempPassword) {
        console.log(
          "Setting selected employee with credentials:",
          newEmployeeObj
        );
        setSelectedEmployee(newEmployeeObj);
        setShowDetailsModal(true);
      }
    } catch (error) {
      console.error("Error adding employee:", error);
      // @ts-ignore - Ignore type checking for this call
      showError("Error", "Failed to add employee. Please try again.");
    }
  };

  const handleBulkUploadComplete = (newEmployees: EmployeeData[]) => {
    setEmployees([...employees, ...newEmployees]);
    setShowBulkUploadModal(false);
    // @ts-ignore - Ignore type checking for this call
    showSuccess(
      "Success",
      `Successfully added ${newEmployees.length} employees!`
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your company's employees and their access
          </p>
        </div>
        {!isManager && (
          <div className="flex space-x-3">
            <button
              onClick={() => setShowBulkUploadModal(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Bulk Upload
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Add Employee
            </button>
          </div>
        )}
      </div>

      {/* Filters Section */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <label htmlFor="search" className="sr-only">
                Search
              </label>
              <div className="relative rounded-md shadow-sm">
                <input
                  type="text"
                  name="search"
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pr-10 sm:text-sm border-gray-300 rounded-md"
                  placeholder="Search employees..."
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>
            <div className="flex space-x-4">
              <div className="w-48">
                <select
                  id="status"
                  name="status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="w-48">
                <select
                  id="department"
                  name="department"
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="all">All Departments</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Employee List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredEmployees.map((employee) => (
            <li key={employee.id}>
              <div className="px-4 py-4 flex items-center sm:px-6">
                <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-12 w-12">
                      <img
                        className="h-12 w-12 rounded-full"
                        src={employee.avatar}
                        alt={employee.name}
                      />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-indigo-600">
                        {employee.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {employee.email}
                      </div>
                      <div className="text-sm text-gray-500">
                        {employee.position} • {employee.department}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="ml-5 flex items-center space-x-4">
                  <button
                    onClick={() => viewEmployeeDetails(employee)}
                    className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                  >
                    View Details
                  </button>
                  {!isManager && (
                    <>
                      <button
                        onClick={() => toggleEmployeeStatus(employee.id)}
                        className={`${
                          employee.status === "active"
                            ? "text-red-600 hover:text-red-900"
                            : "text-green-600 hover:text-green-900"
                        } text-sm font-medium`}
                        disabled={actionLoading[employee.id]}
                      >
                        {actionLoading[employee.id] ? (
                          <span>Processing...</span>
                        ) : employee.status === "active" ? (
                          "Deactivate"
                        ) : (
                          "Activate"
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Keep existing modals but conditionally render based on isManager */}
      {!isManager && (
        <>
          {/* Add Employee Modal */}
          <Modal
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
            title="Add New Employee"
            size="medium"
            actions={
              <>
                <button
                  className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="ml-3 px-4 py-2 bg-indigo-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={addEmployee}
                >
                  Add Employee
                </button>
              </>
            }
          >
            <div className="py-4 space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={newEmployee.name}
                  onChange={handleNewEmployeeChange}
                  className="mt-1 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={newEmployee.email}
                  onChange={handleNewEmployeeChange}
                  className="mt-1 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md"
                  placeholder="john.doe@example.com"
                />
              </div>
              <div>
                <label
                  htmlFor="position"
                  className="block text-sm font-medium text-gray-700"
                >
                  Position
                </label>
                <input
                  type="text"
                  name="position"
                  id="position"
                  value={newEmployee.position}
                  onChange={handleNewEmployeeChange}
                  className="mt-1 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md"
                  placeholder="Frontend Developer"
                />
              </div>
              <div>
                <label
                  htmlFor="department"
                  className="block text-sm font-medium text-gray-700"
                >
                  Department
                </label>
                <select
                  id="department"
                  name="department"
                  value={newEmployee.department}
                  onChange={handleNewEmployeeChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="">Select Department</option>
                  {/* Show predefined departments first */}
                  {PREDEFINED_DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}

                  {/* Show existing departments that aren't in the predefined list */}
                  {departments
                    .filter(
                      (dept) => !!dept && !PREDEFINED_DEPARTMENTS.includes(dept)
                    )
                    .map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </Modal>

          {/* Bulk Upload Modal */}
          <Modal
            isOpen={showBulkUploadModal}
            onClose={() => setShowBulkUploadModal(false)}
            title="Bulk Upload Employees"
            size="large"
          >
            <BulkEmployeeUpload
              onUploadComplete={handleBulkUploadComplete}
              onCancel={() => setShowBulkUploadModal(false)}
            />
          </Modal>
        </>
      )}

      {/* Employee Details Modal - Available to both employers and managers */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Employee Details"
        size="medium"
        actions={
          <button
            className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={() => setShowDetailsModal(false)}
          >
            Close
          </button>
        }
      >
        {selectedEmployee && (
          <div className="py-4">
            {(() => {
              console.log("Showing details for employee:", selectedEmployee);
              return null;
            })()}
            <div className="flex flex-col items-center mb-6">
              <img
                className="h-24 w-24 rounded-full mb-4"
                src={selectedEmployee.avatar}
                alt={selectedEmployee.name}
              />
              <h3 className="text-lg font-medium text-gray-900">
                {selectedEmployee.name}
              </h3>
              <p className="text-sm text-gray-500">{selectedEmployee.email}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    Position
                  </h4>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedEmployee.position}
                  </p>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    Department
                  </h4>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedEmployee.department}
                  </p>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    Status
                  </h4>
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      selectedEmployee.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {selectedEmployee.status
                      ? selectedEmployee.status.charAt(0).toUpperCase() +
                        selectedEmployee.status.slice(1)
                      : "Unknown"}
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    Join Date
                  </h4>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(selectedEmployee.joinDate).toLocaleDateString()}
                  </p>
                </div>

                {/* Display account credentials if available */}
                {selectedEmployee.tempPassword ? (
                  <div className="sm:col-span-2">
                    <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                      Account Credentials
                    </h4>
                    <div className="mt-1 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                      <p className="text-sm text-gray-700 mb-1">
                        <span className="font-medium">Email:</span>{" "}
                        {selectedEmployee.email}
                      </p>
                      <div className="flex items-center">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">
                            Temporary Password:
                          </span>{" "}
                          {selectedEmployee.tempPassword}
                        </p>
                        <button
                          type="button"
                          className="ml-3 inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          onClick={() => {
                            navigator.clipboard.writeText(
                              `Email: ${selectedEmployee.email}\nPassword: ${selectedEmployee.tempPassword}`
                            );
                            showSuccess(
                              "Copied",
                              "Login credentials copied to clipboard"
                            );
                          }}
                        >
                          <svg
                            className="h-3 w-3 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                            />
                          </svg>
                          Copy
                        </button>
                      </div>
                      <p className="text-xs text-yellow-600 mt-2">
                        <svg
                          className="inline-block h-3 w-3 mr-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Please share these credentials with the employee. They
                        can use them to log in.
                      </p>
                    </div>
                  </div>
                ) : (
                  selectedEmployee.accountCreated === false && (
                    <div className="sm:col-span-2">
                      <p className="text-sm text-gray-500">
                        This employee already had an existing account. No new
                        credentials were generated.
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>{" "}
            {/* Performance Metrics Section */}{" "}
            {selectedEmployeePerformance &&
              selectedEmployeePerformance.metrics && (
                <div className="mb-6">
                  {" "}
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    {" "}
                    Performance Metrics{" "}
                  </h4>{" "}
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    {" "}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {" "}
                      <div>
                        {" "}
                        <div className="flex justify-between mb-1">
                          {" "}
                          <span className="text-xs font-medium text-gray-500">
                            {" "}
                            Task Completion Rate{" "}
                          </span>{" "}
                          <span className="text-xs font-medium text-gray-700">
                            {" "}
                            {selectedEmployeePerformance.metrics.taskCompletionRate.toFixed(
                              1
                            )}
                            %{" "}
                          </span>{" "}
                        </div>{" "}
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          {" "}
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${selectedEmployeePerformance.metrics.taskCompletionRate}%`,
                            }}
                          ></div>{" "}
                        </div>{" "}
                      </div>{" "}
                      <div>
                        {" "}
                        <div className="flex justify-between mb-1">
                          {" "}
                          <span className="text-xs font-medium text-gray-500">
                            {" "}
                            On-Time Completion{" "}
                          </span>{" "}
                          <span className="text-xs font-medium text-gray-700">
                            {" "}
                            {selectedEmployeePerformance.metrics.onTimeCompletionRate.toFixed(
                              1
                            )}
                            %{" "}
                          </span>{" "}
                        </div>{" "}
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          {" "}
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{
                              width: `${selectedEmployeePerformance.metrics.onTimeCompletionRate}%`,
                            }}
                          ></div>{" "}
                        </div>{" "}
                      </div>{" "}
                      <div>
                        {" "}
                        <div className="flex justify-between mb-1">
                          {" "}
                          <span className="text-xs font-medium text-gray-500">
                            {" "}
                            Checklist Completion{" "}
                          </span>{" "}
                          <span className="text-xs font-medium text-gray-700">
                            {" "}
                            {selectedEmployeePerformance.metrics.checklistItemCompletionRate.toFixed(
                              1
                            )}
                            %{" "}
                          </span>{" "}
                        </div>{" "}
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          {" "}
                          <div
                            className="bg-purple-600 h-2 rounded-full"
                            style={{
                              width: `${selectedEmployeePerformance.metrics.checklistItemCompletionRate}%`,
                            }}
                          ></div>{" "}
                        </div>{" "}
                      </div>{" "}
                      <div>
                        {" "}
                        <div className="flex justify-between mb-1">
                          {" "}
                          <span className="text-xs font-medium text-gray-500">
                            {" "}
                            Overall Score{" "}
                          </span>{" "}
                          <span className="text-xs font-medium text-gray-700">
                            {" "}
                            {selectedEmployeePerformance.metrics.progressScore.toFixed(
                              1
                            )}
                            %{" "}
                          </span>{" "}
                        </div>{" "}
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          {" "}
                          <div
                            className="bg-indigo-600 h-2 rounded-full"
                            style={{
                              width: `${selectedEmployeePerformance.metrics.progressScore}%`,
                            }}
                          ></div>{" "}
                        </div>{" "}
                      </div>{" "}
                    </div>{" "}
                  </div>{" "}
                </div>
              )}{" "}
            {loadingPerformance && (
              <div className="flex justify-center items-center py-4">
                {" "}
                <div className="w-6 h-6 border-t-2 border-b-2 border-indigo-500 rounded-full animate-spin mr-2"></div>{" "}
                <span className="text-sm text-gray-500">
                  Loading performance metrics...
                </span>{" "}
              </div>
            )}{" "}
            <div className="flex justify-between items-center">
              <button
                type="button"
                disabled={actionLoading[selectedEmployee.id]}
                className={`inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md ${
                  actionLoading[selectedEmployee.id]
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                }`}
                onClick={async () => {
                  await toggleEmployeeStatus(selectedEmployee.id);
                  // Update the selected employee's status in the modal
                  setSelectedEmployee({
                    ...selectedEmployee,
                    status:
                      selectedEmployee.status === "active"
                        ? "inactive"
                        : "active",
                  });
                }}
              >
                {actionLoading[selectedEmployee.id] ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-400"
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
                    Processing...
                  </span>
                ) : selectedEmployee.status === "active" ? (
                  "Deactivate Employee"
                ) : (
                  "Activate Employee"
                )}
              </button>

              <button
                type="button"
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={() => {
                  // Would navigate to employee profile in a real implementation
                  setShowDetailsModal(false);
                }}
              >
                View Full Profile
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Employees;
