import React, { useState } from "react";

// Mock time entries data
const mockTimeEntries = [
  {
    id: 1,
    employeeId: 1,
    employeeName: "Jason Chen",
    employeeAvatar: "https://randomuser.me/api/portraits/men/42.jpg",
    projectId: 1,
    projectName: "Website Redesign",
    taskId: 3,
    taskName: "Design homepage",
    date: "2023-11-15",
    startTime: "09:00:00",
    endTime: "12:30:00",
    duration: 12600, // in seconds (3.5 hours)
    notes: "Worked on homepage mockups and responsive designs",
    status: "approved",
    approvedBy: "Sarah Johnson",
    approvedDate: "2023-11-16",
  },
  {
    id: 2,
    employeeId: 1,
    employeeName: "Jason Chen",
    employeeAvatar: "https://randomuser.me/api/portraits/men/42.jpg",
    projectId: 1,
    projectName: "Website Redesign",
    taskId: 5,
    taskName: "Create backend API",
    date: "2023-11-16",
    startTime: "13:00:00",
    endTime: "17:45:00",
    duration: 17100, // in seconds (4.75 hours)
    notes: "Implemented authentication endpoints",
    status: "pending",
  },
  {
    id: 3,
    employeeId: 2,
    employeeName: "Sarah Johnson",
    employeeAvatar: "https://randomuser.me/api/portraits/women/43.jpg",
    projectId: 2,
    projectName: "Mobile App Development",
    taskId: 6,
    taskName: "Develop mobile app UI",
    date: "2023-11-17",
    startTime: "10:15:00",
    endTime: "15:30:00",
    duration: 18900, // in seconds (5.25 hours)
    notes: "Created UI components for the mobile app",
    status: "approved",
    approvedBy: "Emily Davis",
    approvedDate: "2023-11-18",
  },
  {
    id: 4,
    employeeId: 2,
    employeeName: "Sarah Johnson",
    employeeAvatar: "https://randomuser.me/api/portraits/women/43.jpg",
    projectId: 2,
    projectName: "Mobile App Development",
    taskId: 6,
    taskName: "Develop mobile app UI",
    date: "2023-11-18",
    startTime: "09:30:00",
    endTime: "16:45:00",
    duration: 26100, // in seconds (7.25 hours)
    notes: "Continued work on UI components and animations",
    status: "pending",
  },
  {
    id: 5,
    employeeId: 3,
    employeeName: "Michael Brown",
    employeeAvatar: "https://randomuser.me/api/portraits/men/44.jpg",
    projectId: 3,
    projectName: "CRM Integration",
    taskId: 8,
    taskName: "CRM data migration",
    date: "2023-11-19",
    startTime: "08:00:00",
    endTime: "11:30:00",
    duration: 12600, // in seconds (3.5 hours)
    notes: "Worked on data migration scripts",
    status: "rejected",
    rejectionReason: "Please provide more details on the migration process",
    rejectedBy: "Emily Davis",
    rejectedDate: "2023-11-20",
  },
  {
    id: 6,
    employeeId: 4,
    employeeName: "Emily Davis",
    employeeAvatar: "https://randomuser.me/api/portraits/women/45.jpg",
    projectId: 4,
    projectName: "Marketing Campaign",
    taskId: 10,
    taskName: "Set up analytics",
    date: "2023-11-20",
    startTime: "10:00:00",
    endTime: "14:30:00",
    duration: 16200, // in seconds (4.5 hours)
    notes: "Implemented Google Analytics and set up custom events",
    status: "pending",
  },
];

// Format seconds to hours and minutes
const formatDuration = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
};

const TimeApprovals: React.FC = () => {
  const [timeEntries, setTimeEntries] = useState(mockTimeEntries);
  const [selectedEntries, setSelectedEntries] = useState<number[]>([]);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [entryToReject, setEntryToReject] = useState<number | null>(null);

  // Filter states
  const [employeeFilter, setEmployeeFilter] = useState("");
  const [projectFilter, setProjectFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  // Get unique employees for filter
  const employees = Array.from(
    new Set(timeEntries.map((entry) => entry.employeeId))
  ).map((id) => {
    const entry = timeEntries.find((e) => e.employeeId === id);
    return {
      id,
      name: entry?.employeeName || "",
      avatar: entry?.employeeAvatar || "",
    };
  });

  // Get unique projects for filter
  const projects = Array.from(
    new Set(timeEntries.map((entry) => entry.projectId))
  ).map((id) => {
    const entry = timeEntries.find((e) => e.projectId === id);
    return {
      id,
      name: entry?.projectName || "",
    };
  });

  // Handle checkbox selection
  const handleSelectEntry = (id: number) => {
    if (selectedEntries.includes(id)) {
      setSelectedEntries(selectedEntries.filter((entryId) => entryId !== id));
    } else {
      setSelectedEntries([...selectedEntries, id]);
    }
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedEntries.length === filteredEntries.length) {
      setSelectedEntries([]);
    } else {
      setSelectedEntries(filteredEntries.map((entry) => entry.id));
    }
  };

  // Handle approve entries
  const handleApproveEntries = () => {
    setTimeEntries(
      timeEntries.map((entry) => {
        if (selectedEntries.includes(entry.id)) {
          return {
            ...entry,
            status: "approved",
            approvedBy: "Current User", // In a real app, get from auth context
            approvedDate: new Date().toISOString().split("T")[0],
          };
        }
        return entry;
      })
    );
    setSelectedEntries([]); // Clear selection after approval
  };

  // Handle reject single entry
  const handleRejectEntry = (id: number) => {
    setEntryToReject(id);
    setShowRejectionModal(true);
  };

  // Submit rejection
  const handleSubmitRejection = () => {
    if (entryToReject) {
      setTimeEntries(
        timeEntries.map((entry) => {
          if (entry.id === entryToReject) {
            return {
              ...entry,
              status: "rejected",
              rejectionReason,
              rejectedBy: "Current User", // In a real app, get from auth context
              rejectedDate: new Date().toISOString().split("T")[0],
            };
          }
          return entry;
        })
      );
    }
    setShowRejectionModal(false);
    setEntryToReject(null);
    setRejectionReason("");
  };

  // Filter time entries
  const filteredEntries = timeEntries.filter((entry) => {
    const matchesEmployee = employeeFilter
      ? entry.employeeId === parseInt(employeeFilter)
      : true;
    const matchesProject = projectFilter
      ? entry.projectId === parseInt(projectFilter)
      : true;
    const matchesStatus = statusFilter ? entry.status === statusFilter : true;
    const matchesDate = dateFilter ? entry.date === dateFilter : true;

    return matchesEmployee && matchesProject && matchesStatus && matchesDate;
  });

  // Calculate totals
  const pendingHours = filteredEntries
    .filter((entry) => entry.status === "pending")
    .reduce((total, entry) => total + entry.duration, 0);

  const approvedHours = filteredEntries
    .filter((entry) => entry.status === "approved")
    .reduce((total, entry) => total + entry.duration, 0);

  return (
    <div className="w-full bg-gray-50 min-h-screen pb-12">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Time Entry Approvals
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                  <svg
                    className="h-6 w-6 text-white"
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
                      Pending Approval
                    </dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">
                        {
                          filteredEntries.filter((e) => e.status === "pending")
                            .length
                        }{" "}
                        entries ({(pendingHours / 3600).toFixed(1)} hours)
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                  <svg
                    className="h-6 w-6 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Approved Time
                    </dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">
                        {
                          filteredEntries.filter((e) => e.status === "approved")
                            .length
                        }{" "}
                        entries ({(approvedHours / 3600).toFixed(1)} hours)
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-red-500 rounded-md p-3">
                  <svg
                    className="h-6 w-6 text-white"
                    xmlns="http://www.w3.org/2000/svg"
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
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Rejected Time
                    </dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">
                        {
                          filteredEntries.filter((e) => e.status === "rejected")
                            .length
                        }{" "}
                        entries
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Filters</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Employee
                </label>
                <select
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={employeeFilter}
                  onChange={(e) => setEmployeeFilter(e.target.value)}
                >
                  <option value="">All Employees</option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Project
                </label>
                <select
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={projectFilter}
                  onChange={(e) => setProjectFilter(e.target.value)}
                >
                  <option value="">All Projects</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Date
                </label>
                <input
                  type="date"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedEntries.length > 0 && (
          <div className="bg-indigo-50 p-4 rounded-lg mb-6 flex justify-between items-center">
            <p className="text-indigo-700 font-medium">
              {selectedEntries.length} entries selected
            </p>
            <div className="flex space-x-4">
              <button
                onClick={handleApproveEntries}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Approve Selected
              </button>
            </div>
          </div>
        )}

        {/* Time Entries Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="pl-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    <input
                      type="checkbox"
                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                      checked={
                        filteredEntries.length > 0 &&
                        selectedEntries.length === filteredEntries.length
                      }
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Employee
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Project & Task
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Date & Time
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Duration
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEntries.length > 0 ? (
                  filteredEntries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50">
                      <td className="pl-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                          disabled={entry.status !== "pending"}
                          checked={selectedEntries.includes(entry.id)}
                          onChange={() => handleSelectEntry(entry.id)}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img
                              className="h-10 w-10 rounded-full"
                              src={entry.employeeAvatar}
                              alt={entry.employeeName}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {entry.employeeName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {entry.projectName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {entry.taskName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {entry.date}
                        </div>
                        <div className="text-sm text-gray-500">
                          {entry.startTime} - {entry.endTime}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDuration(entry.duration)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            entry.status === "approved"
                              ? "bg-green-100 text-green-800"
                              : entry.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {entry.status.charAt(0).toUpperCase() +
                            entry.status.slice(1)}
                        </span>
                        {entry.status === "rejected" &&
                          entry.rejectionReason && (
                            <div className="text-xs text-red-500 mt-1">
                              {entry.rejectionReason}
                            </div>
                          )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {entry.status === "pending" && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedEntries([entry.id]);
                                handleApproveEntries();
                              }}
                              className="text-green-600 hover:text-green-900 mr-4"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectEntry(entry.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-10 text-center text-sm text-gray-500"
                    >
                      No time entries found. Adjust your filters to see more
                      entries.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Rejection Modal */}
      {showRejectionModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg
                      className="h-6 w-6 text-red-600"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Reject Time Entry
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Please provide a reason for rejecting this time entry.
                        The employee will be notified.
                      </p>
                      <div className="mt-4">
                        <textarea
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          rows={3}
                          placeholder="Reason for rejection"
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                        ></textarea>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleSubmitRejection}
                  disabled={!rejectionReason.trim()}
                >
                  Reject
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => {
                    setShowRejectionModal(false);
                    setEntryToReject(null);
                    setRejectionReason("");
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeApprovals;
