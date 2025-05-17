import React, { useState } from "react";
import Modal from "../../components/Modal";

// Mock data for the currently logged in employee
const currentEmployee = {
  id: 1,
  name: "Jason Chen",
  position: "Frontend Developer",
  points: 350,
};

// Mock data for employee rewards
const employeeRewards = [
  {
    id: 1,
    rewardId: 2,
    name: "Extra Day Off",
    description: "An additional paid day off",
    type: "time-off",
    value: "1 day",
    dateAwarded: "2023-05-10",
    status: "claimed",
    claimedDate: "2023-05-12",
  },
  {
    id: 2,
    rewardId: 5,
    name: "Gift Card",
    description: "Amazon gift card",
    type: "monetary",
    value: "$50",
    dateAwarded: "2023-06-05",
    status: "approved",
    claimedDate: null,
  },
  {
    id: 3,
    rewardId: 1,
    name: "Performance Bonus",
    description: "Cash bonus for exceeding quarterly targets",
    type: "monetary",
    value: "$500",
    dateAwarded: "2023-06-15",
    status: "pending",
    claimedDate: null,
  },
];

// Mock data for available rewards catalog
const availableRewards = [
  {
    id: 1,
    name: "Performance Bonus",
    description: "Cash bonus for exceeding quarterly targets",
    type: "monetary",
    value: "$500",
    pointsCost: 300,
    criteria: "Exceed quarterly targets by at least 20%",
  },
  {
    id: 2,
    name: "Extra Day Off",
    description: "An additional paid day off",
    type: "time-off",
    value: "1 day",
    pointsCost: 200,
    criteria: "Complete all assigned tasks for the month on time",
  },
  {
    id: 3,
    name: "Professional Development Budget",
    description: "Budget for courses, books, or conferences",
    type: "development",
    value: "$1,000",
    pointsCost: 500,
    criteria: "12 months of consistent high performance",
  },
  {
    id: 4,
    name: "Team Lunch",
    description: "Free lunch for the team",
    type: "team",
    value: "Meal",
    pointsCost: 150,
    criteria: "Team completes project ahead of schedule",
  },
  {
    id: 5,
    name: "Gift Card",
    description: "Amazon gift card",
    type: "monetary",
    value: "$50",
    pointsCost: 100,
    criteria: "Employee of the month",
  },
];

// Mock achievements data
const achievements = [
  {
    id: 1,
    name: "Project Completion",
    description: "Successfully completed the Website Redesign project",
    date: "2023-04-15",
    pointsAwarded: 100,
  },
  {
    id: 2,
    name: "Early Task Completion",
    description: "Completed all weekly tasks ahead of schedule",
    date: "2023-05-05",
    pointsAwarded: 50,
  },
  {
    id: 3,
    name: "Client Feedback",
    description: "Received positive feedback from client for work quality",
    date: "2023-05-20",
    pointsAwarded: 75,
  },
  {
    id: 4,
    name: "Perfect Attendance",
    description: "Perfect attendance for the quarter",
    date: "2023-06-01",
    pointsAwarded: 25,
  },
  {
    id: 5,
    name: "Team Collaboration",
    description: "Exceptional teamwork on the Mobile App project",
    date: "2023-06-10",
    pointsAwarded: 100,
  },
];

// Add interfaces above the component
interface EmployeeReward {
  id: number;
  rewardId: number;
  name: string;
  description: string;
  type: string;
  value: string;
  dateAwarded: string;
  status: string;
  claimedDate: string | null;
}

interface Reward {
  id: number;
  name: string;
  description: string;
  type: string;
  value: string;
  pointsCost: number;
  criteria: string;
}

const Rewards: React.FC = () => {
  const [currentView, setCurrentView] = useState("myRewards"); // myRewards, catalog, achievements
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [selectedReward, setSelectedReward] = useState<EmployeeReward | null>(
    null
  );

  // New modal states for different notifications
  const [showClaimConfirmModal, setShowClaimConfirmModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showNotEnoughPointsModal, setShowNotEnoughPointsModal] =
    useState(false);
  const [requestedReward, setRequestedReward] = useState<Reward | null>(null);

  // Points needed for request (used in not enough points modal)
  const [pointsNeeded, setPointsNeeded] = useState(0);

  // Mock function to handle reward claim
  const handleClaimReward = () => {
    // In a real app, this would send a request to the server
    setShowClaimModal(false);
    setShowClaimConfirmModal(true);
  };

  // Mock function to request a reward from the catalog
  const handleRequestReward = (reward: Reward) => {
    setRequestedReward(reward);

    if (currentEmployee.points >= reward.pointsCost) {
      setShowRequestModal(true);
    } else {
      setPointsNeeded(reward.pointsCost - currentEmployee.points);
      setShowNotEnoughPointsModal(true);
    }
  };

  // Confirm a reward request
  const confirmRequestReward = () => {
    // In a real app, this would send a request to the server
    setShowRequestModal(false);
    // You could also show a success notification here
  };

  return (
    <div className="w-full bg-gray-50 min-h-screen pb-12">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">My Rewards</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Points Overview */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-medium text-gray-900">
                Your Reward Points
              </h2>
              <p className="text-sm text-gray-500">
                Earn points through achievements and redeem them for rewards
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="inline-flex items-center px-4 py-2 bg-indigo-100 rounded-full">
                <svg
                  className="h-6 w-6 text-indigo-600 mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-xl font-bold text-indigo-600">
                  {currentEmployee.points} Points
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white shadow rounded-lg mb-6">
          <nav className="flex space-x-4 px-4">
            <button
              onClick={() => setCurrentView("myRewards")}
              className={`px-3 py-3 text-sm font-medium ${
                currentView === "myRewards"
                  ? "text-indigo-700 border-b-2 border-indigo-500"
                  : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              My Rewards
            </button>
            <button
              onClick={() => setCurrentView("catalog")}
              className={`px-3 py-3 text-sm font-medium ${
                currentView === "catalog"
                  ? "text-indigo-700 border-b-2 border-indigo-500"
                  : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Rewards Catalog
            </button>
            <button
              onClick={() => setCurrentView("achievements")}
              className={`px-3 py-3 text-sm font-medium ${
                currentView === "achievements"
                  ? "text-indigo-700 border-b-2 border-indigo-500"
                  : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              My Achievements
            </button>
          </nav>
        </div>

        {/* My Rewards View */}
        {currentView === "myRewards" && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Your Rewards
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                View your earned rewards and their status
              </p>
            </div>
            <div className="overflow-x-auto">
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
                  {employeeRewards.map((reward) => (
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
                        {reward.dateAwarded}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            reward.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : reward.status === "approved"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {reward.status.charAt(0).toUpperCase() +
                            reward.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {reward.status === "approved" && (
                          <button
                            onClick={() => {
                              setSelectedReward(reward);
                              setShowClaimModal(true);
                            }}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Claim Reward
                          </button>
                        )}
                        {reward.status === "claimed" && (
                          <span className="text-gray-500">
                            Claimed on {reward.claimedDate}
                          </span>
                        )}
                        {reward.status === "pending" && (
                          <span className="text-gray-500">
                            Awaiting Approval
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Rewards Catalog View */}
        {currentView === "catalog" && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {availableRewards.map((reward) => (
              <div
                key={reward.id}
                className="bg-white overflow-hidden shadow rounded-lg"
              >
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex justify-between">
                    <h3 className="text-lg font-medium text-gray-900">
                      {reward.name}
                    </h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {reward.type.charAt(0).toUpperCase() +
                        reward.type.slice(1)}
                    </span>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      {reward.description}
                    </p>
                  </div>
                  <div className="mt-3">
                    <span className="text-sm font-medium text-gray-900">
                      Value: {reward.value}
                    </span>
                  </div>
                  <div className="mt-1">
                    <span className="text-sm text-gray-600">
                      Criteria: {reward.criteria}
                    </span>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="inline-flex items-center">
                      <svg
                        className="h-5 w-5 text-indigo-600 mr-1"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="text-indigo-600 font-medium">
                        {reward.pointsCost} Points
                      </span>
                    </div>
                    <button
                      onClick={() => handleRequestReward(reward)}
                      className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white ${
                        currentEmployee.points >= reward.pointsCost
                          ? "bg-indigo-600 hover:bg-indigo-700"
                          : "bg-gray-400 cursor-not-allowed"
                      }`}
                      disabled={currentEmployee.points < reward.pointsCost}
                    >
                      {currentEmployee.points >= reward.pointsCost
                        ? "Request Reward"
                        : "Not Enough Points"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Achievements View */}
        {currentView === "achievements" && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Your Achievements
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Track your achievements and earned points
              </p>
            </div>
            <ul className="divide-y divide-gray-200">
              {achievements.map((achievement) => (
                <li key={achievement.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <p className="text-sm font-medium text-indigo-600 truncate">
                        {achievement.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {achievement.description}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {achievement.date}
                      </p>
                    </div>
                    <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      +{achievement.pointsAwarded} Points
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Claim Reward Modal */}
        {showClaimModal && selectedReward && (
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
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
                      <svg
                        className="h-6 w-6 text-indigo-600"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <h3
                        className="text-lg leading-6 font-medium text-gray-900"
                        id="modal-headline"
                      >
                        Claim {selectedReward.name}
                      </h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Are you sure you want to claim this reward? This
                          action will mark the reward as claimed, and your
                          manager will be notified to process it.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    onClick={handleClaimReward}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Claim Reward
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowClaimModal(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Successful Claim Modal */}
        <Modal
          isOpen={showClaimConfirmModal}
          onClose={() => setShowClaimConfirmModal(false)}
          title="Reward Claimed"
          size="small"
          actions={
            <button
              onClick={() => setShowClaimConfirmModal(false)}
              className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              OK
            </button>
          }
        >
          <div className="flex flex-col items-center text-center py-4">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg
                className="h-6 w-6 text-green-600"
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
            <p className="text-gray-700">
              Reward claimed:{" "}
              <span className="font-medium">{selectedReward?.name}</span>
            </p>
            <p className="text-gray-500 text-sm mt-2">
              You will be notified when your claim is processed.
            </p>
          </div>
        </Modal>

        {/* Request Reward Modal */}
        <Modal
          isOpen={showRequestModal}
          onClose={() => setShowRequestModal(false)}
          title="Request Reward"
          size="small"
          actions={
            <>
              <button
                onClick={() => setShowRequestModal(false)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                onClick={confirmRequestReward}
                className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Confirm Request
              </button>
            </>
          }
        >
          <div className="py-2">
            <p className="text-gray-700">
              Are you sure you want to request the reward:{" "}
              <span className="font-medium">{requestedReward?.name}</span>?
            </p>
            <p className="text-gray-500 text-sm mt-2">
              This will cost{" "}
              <span className="font-medium">
                {requestedReward?.pointsCost} points
              </span>
              . Your request will be reviewed by management.
            </p>
          </div>
        </Modal>

        {/* Not Enough Points Modal */}
        <Modal
          isOpen={showNotEnoughPointsModal}
          onClose={() => setShowNotEnoughPointsModal(false)}
          title="Not Enough Points"
          size="small"
          actions={
            <button
              onClick={() => setShowNotEnoughPointsModal(false)}
              className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              OK
            </button>
          }
        >
          <div className="flex flex-col items-center text-center py-4">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
              <svg
                className="h-6 w-6 text-yellow-600"
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
            <p className="text-gray-700">
              You don't have enough points to request this reward.
            </p>
            <p className="text-gray-500 text-sm mt-2">
              You need{" "}
              <span className="font-medium">{pointsNeeded} more points</span> to
              qualify.
            </p>
          </div>
        </Modal>
      </main>
    </div>
  );
};

export default Rewards;
