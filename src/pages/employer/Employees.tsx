import React, { useState } from "react";
import Modal from "../../components/Modal";

// Mock employee data
const initialEmployees = [
  {
    id: 1,
    name: "Jason Chen",
    email: "jason.chen@example.com",
    position: "Frontend Developer",
    department: "Engineering",
    status: "active",
    joinDate: "2022-03-15",
    avatar: "https://randomuser.me/api/portraits/men/1.jpg",
  },
  {
    id: 2,
    name: "Sarah Johnson",
    email: "sarah.johnson@example.com",
    position: "UX Designer",
    department: "Design",
    status: "active",
    joinDate: "2021-11-02",
    avatar: "https://randomuser.me/api/portraits/women/2.jpg",
  },
  {
    id: 3,
    name: "Michael Brown",
    email: "michael.brown@example.com",
    position: "Backend Developer",
    department: "Engineering",
    status: "active",
    joinDate: "2022-01-10",
    avatar: "https://randomuser.me/api/portraits/men/3.jpg",
  },
  {
    id: 4,
    name: "Emily Davis",
    email: "emily.davis@example.com",
    position: "Project Manager",
    department: "Management",
    status: "active",
    joinDate: "2021-08-22",
    avatar: "https://randomuser.me/api/portraits/women/4.jpg",
  },
  {
    id: 5,
    name: "David Wilson",
    email: "david.wilson@example.com",
    position: "DevOps Engineer",
    department: "Operations",
    status: "inactive",
    joinDate: "2021-05-18",
    avatar: "https://randomuser.me/api/portraits/men/5.jpg",
  },
];

const Employees: React.FC = () => {
  const [employees, setEmployees] = useState(initialEmployees);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null);
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    email: "",
    position: "",
    department: "",
  });

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
  const toggleEmployeeStatus = (id: number) => {
    setEmployees(
      employees.map((emp) =>
        emp.id === id
          ? { ...emp, status: emp.status === "active" ? "inactive" : "active" }
          : emp
      )
    );
  };

  // View employee details
  const viewEmployeeDetails = (employee: any) => {
    setSelectedEmployee(employee);
    setShowDetailsModal(true);
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
  const addEmployee = () => {
    const newEmployeeObj = {
      id: employees.length + 1,
      ...newEmployee,
      status: "active",
      joinDate: new Date().toISOString().split("T")[0],
      avatar: `https://randomuser.me/api/portraits/${
        Math.random() > 0.5 ? "men" : "women"
      }/${Math.floor(Math.random() * 70) + 1}.jpg`,
    };

    setEmployees([...employees, newEmployeeObj]);
    setShowAddModal(false);
    setNewEmployee({
      name: "",
      email: "",
      position: "",
      department: "",
    });
  };

  return (
    <div className="w-full bg-gray-50 min-h-screen pb-12">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and search */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="w-full md:w-1/3">
              <label htmlFor="search" className="sr-only">
                Search
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
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
                <input
                  id="search"
                  name="search"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Search employees"
                  type="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div>
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-gray-700"
                >
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
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
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                >
                  <option value="all">All Departments</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <svg
                    className="-ml-1 mr-2 h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Add Employee
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Employee List */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredEmployees.map((employee) => (
              <li key={employee.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
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
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          employee.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {employee.status.charAt(0).toUpperCase() +
                          employee.status.slice(1)}
                      </span>
                      <div className="ml-2 flex-shrink-0 flex">
                        <button
                          type="button"
                          className="ml-2 text-indigo-600 hover:text-indigo-900"
                          onClick={() => viewEmployeeDetails(employee)}
                        >
                          Details
                        </button>
                        <button
                          type="button"
                          className="ml-2 text-gray-600 hover:text-gray-900"
                          onClick={() => toggleEmployeeStatus(employee.id)}
                        >
                          {employee.status === "active"
                            ? "Deactivate"
                            : "Activate"}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <div className="flex items-center text-sm text-gray-500">
                        <svg
                          className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z"
                            clipRule="evenodd"
                          />
                          <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                        </svg>
                        {employee.position}
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                        <svg
                          className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 01-1.581.814l-4.419-3.35-4.419 3.35A1 1 0 014 16V4zm6 10.5l4 3V4H6v13.5l4-3z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {employee.department}
                      </div>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <svg
                        className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>
                        Joined on{" "}
                        <time dateTime={employee.joinDate}>
                          {new Date(employee.joinDate).toLocaleDateString()}
                        </time>
                      </span>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

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
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </Modal>

        {/* Employee Details Modal */}
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
              <div className="flex flex-col items-center mb-6">
                <img
                  className="h-24 w-24 rounded-full mb-4"
                  src={selectedEmployee.avatar}
                  alt={selectedEmployee.name}
                />
                <h3 className="text-lg font-medium text-gray-900">
                  {selectedEmployee.name}
                </h3>
                <p className="text-sm text-gray-500">
                  {selectedEmployee.email}
                </p>
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
                      {selectedEmployee.status.charAt(0).toUpperCase() +
                        selectedEmployee.status.slice(1)}
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
                </div>
              </div>

              <div className="flex justify-between items-center">
                <button
                  type="button"
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={() => {
                    toggleEmployeeStatus(selectedEmployee.id);
                    setSelectedEmployee({
                      ...selectedEmployee,
                      status:
                        selectedEmployee.status === "active"
                          ? "inactive"
                          : "active",
                    });
                  }}
                >
                  {selectedEmployee.status === "active"
                    ? "Deactivate Employee"
                    : "Activate Employee"}
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
      </main>
    </div>
  );
};

export default Employees;
