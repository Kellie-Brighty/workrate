import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  getRewards,
  createReward,
  updateReward,
  getEmployees,
  assignReward,
  updateEmployeeRewardStatus,
  type Reward,
  type EmployeeReward,
} from "../../services/firebase";
import {
  useSuccessNotification,
  useErrorNotification,
} from "../../contexts/NotificationContext";

const Rewards: React.FC = () => {
  const { currentUser } = useAuth();
  const showSuccess = useSuccessNotification();
  const showError = useErrorNotification();
  // State for rewards and assignments
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [assignments, _setAssignments] = useState<EmployeeReward[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [isLoadingRewards, setIsLoadingRewards] = useState(true);

  // State for modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);

  // State for forms
  const [newReward, setNewReward] = useState<
    Omit<Reward, "id" | "createdAt" | "updatedAt">
  >({
    name: "",
    description: "",
    type: "monetary",
    value: "",
    criteria: "",
    status: "active",
    pointsCost: 0,
  });

  const [newAssignment, setNewAssignment] = useState({
    employeeId: "",
    rewardId: "",
  });

  // State for current view
  const [currentView, setCurrentView] = useState("rewards"); // rewards, assignments

  // Load initial data
  useEffect(() => {
    if (currentUser?.uid) {
      // Load rewards
      const loadRewards = async () => {
        try {
          setIsLoadingRewards(true);
          const rewards = (await getRewards()) as Reward[];
          setRewards(rewards);
        } catch (error) {
          console.error("Error loading rewards:", error);
          showError("Error", "Failed to load rewards");
        } finally {
          setIsLoadingRewards(false);
        }
      };
      loadRewards();

      // Load employees
      const loadEmployees = async () => {
        const employees = await getEmployees(currentUser.uid);
        setEmployees(employees);
      };
      loadEmployees();
    }
  }, [currentUser?.uid]);

  // Handle creating a new reward
  const handleCreateReward = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const rewardData = {
        ...newReward,
        pointsCost: parseInt(newReward.value.replace(/[^0-9]/g, "")) || 0,
      };
      await createReward(rewardData);

      // Reset form and close modal
      setNewReward({
        name: "",
        description: "",
        type: "monetary",
        value: "",
        criteria: "",
        status: "active",
        pointsCost: 0,
      });
      setShowCreateModal(false);

      // Show success notification
      showSuccess("Success", "Reward created successfully");

      // Refresh rewards list
      const updatedRewards = (await getRewards()) as Reward[];
      setRewards(updatedRewards);
    } catch (error) {
      console.error("Error creating reward:", error);
      showError("Error", "Failed to create reward");
    }
  };

  // Handle assigning a reward
  const handleAssignReward = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await assignReward(newAssignment.employeeId, newAssignment.rewardId);
      setNewAssignment({
        employeeId: "",
        rewardId: "",
      });
      setShowAssignModal(false);
    } catch (error) {
      console.error("Error assigning reward:", error);
      // You might want to show an error message to the user here
    }
  };

  // Handle updating assignment status
  const handleUpdateStatus = async (
    id: string,
    status: "approved" | "claimed"
  ) => {
    try {
      await updateEmployeeRewardStatus(id, status);
    } catch (error) {
      console.error("Error updating reward status:", error);
      // You might want to show an error message to the user here
    }
  };

  // Handle toggle reward status
  const handleToggleRewardStatus = async (
    id: string,
    currentStatus: "active" | "inactive"
  ) => {
    try {
      await updateReward(id, {
        status: currentStatus === "active" ? "inactive" : "active",
      });
    } catch (error) {
      console.error("Error toggling reward status:", error);
      // You might want to show an error message to the user here
    }
  };

  return (
    <div className="w-full bg-gray-50 min-h-screen pb-12">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Rewards & Recognition
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="bg-white shadow rounded-lg mb-6">
          <nav className="flex space-x-4 px-4">
            <button
              onClick={() => setCurrentView("rewards")}
              className={`px-3 py-3 text-sm font-medium ${
                currentView === "rewards"
                  ? "text-indigo-700 border-b-2 border-indigo-500"
                  : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Rewards Catalog
            </button>
            <button
              onClick={() => setCurrentView("assignments")}
              className={`px-3 py-3 text-sm font-medium ${
                currentView === "assignments"
                  ? "text-indigo-700 border-b-2 border-indigo-500"
                  : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Assigned Rewards
            </button>
          </nav>
        </div>

        {/* Rewards Catalog View */}
        {currentView === "rewards" && (
          <>
            {/* Action buttons */}
            <div className="mb-6 flex justify-end">
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
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
                Create Reward
              </button>
            </div>

            {/* Rewards Table */}
            {isLoadingRewards ? (
              <div className="text-center py-12 bg-white shadow rounded-lg">
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
                <p className="mt-4 text-sm text-gray-500">Loading rewards...</p>
              </div>
            ) : rewards.length === 0 ? (
              <div className="text-center py-12 bg-white shadow rounded-lg">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No rewards created yet
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by creating your first reward for your employees.
                </p>
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(true)}
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
                    Create Reward
                  </button>
                </div>
              </div>
            ) : (
              <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                  <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Reward
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Type
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Value
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Criteria
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Status
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {rewards.map((reward) => (
                          <tr key={reward.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {reward.name}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {reward.description}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                {reward.type.charAt(0).toUpperCase() +
                                  reward.type.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {reward.value}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {reward.criteria}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <span
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  reward.status === "active"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {reward.status.charAt(0).toUpperCase() +
                                  reward.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => setShowAssignModal(true)}
                                className="text-indigo-600 hover:text-indigo-900 mr-4"
                              >
                                Assign
                              </button>
                              <button
                                onClick={() =>
                                  reward.id &&
                                  handleToggleRewardStatus(
                                    reward.id,
                                    reward.status
                                  )
                                }
                                className={`${
                                  reward.status === "active"
                                    ? "text-gray-600 hover:text-gray-900"
                                    : "text-green-600 hover:text-green-900"
                                }`}
                              >
                                {reward.status === "active"
                                  ? "Deactivate"
                                  : "Activate"}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Assigned Rewards View */}
        {currentView === "assignments" && (
          <>
            {/* Action buttons */}
            <div className="mb-6 flex justify-end">
              <button
                type="button"
                onClick={() => setShowAssignModal(true)}
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
                Assign Reward
              </button>
            </div>

            {/* Assignments Table */}
            {assignments.length === 0 ? (
              <div className="text-center py-12 bg-white shadow rounded-lg">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No rewards assigned yet
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Start recognizing your employees by assigning rewards.
                </p>
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => setShowAssignModal(true)}
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
                    Assign Reward
                  </button>
                </div>
              </div>
            ) : (
              <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                  <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
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
                            Reward
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Date Awarded
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Status
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {assignments.map((assignment) => (
                          <tr key={assignment.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {
                                  employees.find(
                                    (emp) => emp.id === assignment.employeeId
                                  )?.name
                                }
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {assignment.rewardName}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {assignment.dateAwarded}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  assignment.status === "pending"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : assignment.status === "approved"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-green-100 text-green-800"
                                }`}
                              >
                                {assignment.status.charAt(0).toUpperCase() +
                                  assignment.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              {assignment.status === "pending" && (
                                <>
                                  <button
                                    onClick={() =>
                                      assignment.id &&
                                      handleUpdateStatus(
                                        assignment.id,
                                        "approved"
                                      )
                                    }
                                    className="text-blue-600 hover:text-blue-900 mr-2"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() =>
                                      assignment.id &&
                                      handleUpdateStatus(
                                        assignment.id,
                                        "approved"
                                      )
                                    }
                                    className="text-green-600 hover:text-green-900"
                                  >
                                    Mark as Claimed
                                  </button>
                                </>
                              )}
                              {assignment.status === "approved" && (
                                <button
                                  onClick={() =>
                                    assignment.id &&
                                    handleUpdateStatus(assignment.id, "claimed")
                                  }
                                  className="text-green-600 hover:text-green-900"
                                >
                                  Mark as Claimed
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Create Reward Modal */}
        {showCreateModal && (
          <div className="fixed z-10 inset-0 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity">
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen"></span>
              &#8203;
              <div
                className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-headline"
              >
                <form onSubmit={handleCreateReward}>
                  <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                      <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                        <h3
                          className="text-lg leading-6 font-medium text-gray-900"
                          id="modal-headline"
                        >
                          Create New Reward
                        </h3>
                        <div className="mt-4 grid grid-cols-1 gap-4">
                          <div>
                            <label
                              htmlFor="name"
                              className="block text-sm font-medium text-gray-700"
                            >
                              Reward Name
                            </label>
                            <input
                              type="text"
                              name="name"
                              id="name"
                              value={newReward.name}
                              onChange={(e) =>
                                setNewReward({
                                  ...newReward,
                                  name: e.target.value,
                                })
                              }
                              required
                              className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            />
                          </div>
                          <div>
                            <label
                              htmlFor="description"
                              className="block text-sm font-medium text-gray-700"
                            >
                              Description
                            </label>
                            <textarea
                              id="description"
                              name="description"
                              rows={3}
                              value={newReward.description}
                              onChange={(e) =>
                                setNewReward({
                                  ...newReward,
                                  description: e.target.value,
                                })
                              }
                              className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            ></textarea>
                          </div>
                          <div>
                            <label
                              htmlFor="type"
                              className="block text-sm font-medium text-gray-700"
                            >
                              Reward Type
                            </label>
                            <select
                              id="type"
                              name="type"
                              value={newReward.type}
                              onChange={(e) =>
                                setNewReward({
                                  ...newReward,
                                  type: e.target.value as
                                    | "monetary"
                                    | "time-off"
                                    | "development"
                                    | "team"
                                    | "other",
                                })
                              }
                              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            >
                              <option value="monetary">Monetary</option>
                              <option value="time-off">Time Off</option>
                              <option value="development">
                                Professional Development
                              </option>
                              <option value="team">Team Reward</option>
                              <option value="other">Other</option>
                            </select>
                          </div>
                          <div>
                            <label
                              htmlFor="value"
                              className="block text-sm font-medium text-gray-700"
                            >
                              Value
                            </label>
                            <input
                              type="text"
                              name="value"
                              id="value"
                              value={newReward.value}
                              onChange={(e) =>
                                setNewReward({
                                  ...newReward,
                                  value: e.target.value,
                                })
                              }
                              required
                              className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                              placeholder="e.g. $500, 1 day, etc."
                            />
                          </div>
                          <div>
                            <label
                              htmlFor="criteria"
                              className="block text-sm font-medium text-gray-700"
                            >
                              Criteria for Earning
                            </label>
                            <input
                              type="text"
                              name="criteria"
                              id="criteria"
                              value={newReward.criteria}
                              onChange={(e) =>
                                setNewReward({
                                  ...newReward,
                                  criteria: e.target.value,
                                })
                              }
                              required
                              className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button
                      type="submit"
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      Create
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Assign Reward Modal */}
        {showAssignModal && (
          <div className="fixed z-10 inset-0 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity">
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen"></span>
              &#8203;
              <div
                className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-headline"
              >
                <form onSubmit={handleAssignReward}>
                  <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                      <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                        <h3
                          className="text-lg leading-6 font-medium text-gray-900"
                          id="modal-headline"
                        >
                          Assign Reward to Employee
                        </h3>
                        <div className="mt-4 grid grid-cols-1 gap-4">
                          <div>
                            <label
                              htmlFor="employee"
                              className="block text-sm font-medium text-gray-700"
                            >
                              Employee
                            </label>
                            <select
                              id="employee"
                              name="employee"
                              value={newAssignment.employeeId}
                              onChange={(e) =>
                                setNewAssignment({
                                  ...newAssignment,
                                  employeeId: e.target.value,
                                })
                              }
                              required
                              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            >
                              <option value="">Select Employee</option>
                              {employees.map((employee) => (
                                <option key={employee.id} value={employee.id}>
                                  {employee.name} - {employee.position}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label
                              htmlFor="reward"
                              className="block text-sm font-medium text-gray-700"
                            >
                              Reward
                            </label>
                            <select
                              id="reward"
                              name="reward"
                              value={newAssignment.rewardId}
                              onChange={(e) =>
                                setNewAssignment({
                                  ...newAssignment,
                                  rewardId: e.target.value,
                                })
                              }
                              required
                              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            >
                              <option value="">Select Reward</option>
                              {rewards
                                .filter((reward) => reward.status === "active")
                                .map((reward) => (
                                  <option key={reward.id} value={reward.id}>
                                    {reward.name} - {reward.value}
                                  </option>
                                ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button
                      type="submit"
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      Assign
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAssignModal(false)}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Rewards;
