import React, { useState, useEffect } from "react";
import Modal from "../../components/Modal";
import { useAuth } from "../../contexts/AuthContext";
import {
  getEmployeeRewards,
  getRewards,
  getEmployeeAchievements,
  getEmployeePoints,
  updateEmployeeRewardStatus,
  onEmployeeRewardsUpdate,
  onEmployeePointsUpdate,
  type Reward,
  type EmployeeReward,
  type Achievement,
  type EmployeePoints,
} from "../../services/firebase";

const Rewards: React.FC = () => {
  const { currentUser } = useAuth();
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

  // State for data
  const [employeeRewards, setEmployeeRewards] = useState<EmployeeReward[]>([]);
  const [availableRewards, setAvailableRewards] = useState<Reward[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [employeePoints, setEmployeePoints] = useState<EmployeePoints | null>(
    null
  );

  // Points needed for request (used in not enough points modal)
  const [pointsNeeded, setPointsNeeded] = useState(0);

  // Load initial data
  useEffect(() => {
    if (currentUser?.uid) {
      // Load employee rewards
      const loadEmployeeRewards = async () => {
        const rewards = (await getEmployeeRewards(
          currentUser.uid
        )) as EmployeeReward[];
        setEmployeeRewards(rewards);
      };
      loadEmployeeRewards();

      // Load available rewards
      const loadAvailableRewards = async () => {
        const rewards = (await getRewards("active")) as Reward[];
        setAvailableRewards(rewards);
      };
      loadAvailableRewards();

      // Load achievements
      const loadAchievements = async () => {
        const achievements = (await getEmployeeAchievements(
          currentUser.uid
        )) as Achievement[];
        setAchievements(achievements);
      };
      loadAchievements();

      // Load employee points
      const loadEmployeePoints = async () => {
        const points = (await getEmployeePoints(
          currentUser.uid
        )) as EmployeePoints | null;
        setEmployeePoints(points);
      };
      loadEmployeePoints();

      // Set up real-time listeners
      const unsubscribeRewards = onEmployeeRewardsUpdate((rewards) => {
        setEmployeeRewards(rewards);
      }, currentUser.uid);

      const unsubscribePoints = onEmployeePointsUpdate((points) => {
        setEmployeePoints(points);
      }, currentUser.uid);

      // Cleanup listeners on unmount
      return () => {
        unsubscribeRewards();
        unsubscribePoints();
      };
    }
  }, [currentUser?.uid]);

  // Handle reward claim
  const handleClaimReward = async () => {
    if (selectedReward && currentUser?.uid) {
      try {
        await updateEmployeeRewardStatus(
          selectedReward.id!,
          "claimed",
          new Date()
        );
        setShowClaimModal(false);
        setShowClaimConfirmModal(true);
      } catch (error) {
        console.error("Error claiming reward:", error);
        // You might want to show an error message to the user here
      }
    }
  };

  // Handle reward request
  const handleRequestReward = (reward: Reward) => {
    setRequestedReward(reward);

    if (employeePoints && employeePoints.points >= reward.pointsCost) {
      setShowRequestModal(true);
    } else {
      setPointsNeeded(reward.pointsCost - (employeePoints?.points || 0));
      setShowNotEnoughPointsModal(true);
    }
  };

  // Confirm a reward request
  const confirmRequestReward = async () => {
    if (requestedReward && currentUser?.uid) {
      try {
        // Here you would implement the logic to request a reward
        // This might involve creating a new employee reward with status "pending"
        setShowRequestModal(false);
        // You could also show a success notification here
      } catch (error) {
        console.error("Error requesting reward:", error);
        // You might want to show an error message to the user here
      }
    }
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
                  {employeePoints?.points} Points
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
            {employeeRewards.length === 0 ? (
              <div className="text-center py-12">
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
                  No rewards yet
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  You haven't earned any rewards yet. Keep up the good work!
                </p>
              </div>
            ) : (
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
                                {reward.rewardName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {reward.rewardType}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {reward.rewardType.charAt(0).toUpperCase() +
                              reward.rewardType.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {reward.rewardValue}
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
            )}
          </div>
        )}

        {/* Rewards Catalog View */}
        {currentView === "catalog" && (
          <div>
            {availableRewards.length === 0 ? (
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
                  No rewards available
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  There are no rewards available in the catalog at the moment.
                </p>
              </div>
            ) : (
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
                            !employeePoints ||
                            employeePoints.points < reward.pointsCost
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-indigo-600 hover:bg-indigo-700"
                          }`}
                          disabled={
                            !employeePoints ||
                            employeePoints.points < reward.pointsCost
                          }
                        >
                          {employeePoints &&
                          employeePoints.points >= reward.pointsCost
                            ? "Request Reward"
                            : "Not Enough Points"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
            {achievements.length === 0 ? (
              <div className="text-center py-12">
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
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No achievements yet
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  You haven't earned any achievements yet. Keep working hard!
                </p>
              </div>
            ) : (
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
            )}
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
                        Claim {selectedReward.rewardName}
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
              <span className="font-medium">{selectedReward?.rewardName}</span>
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
