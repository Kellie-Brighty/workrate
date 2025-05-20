import React, { useState, useEffect } from "react";
import Modal from "../../components/Modal";
import { useAuth } from "../../contexts/AuthContext";
import {
  useSuccessNotification,
  useErrorNotification,
} from "../../contexts/NotificationContext";
import {
  createManager,
  getManagers,
  deleteManager,
} from "../../services/firebase";
import { generateWhatsAppLink } from "../../utils/whatsappUtils";

const Settings: React.FC = () => {
  const { userData } = useAuth();
  const showSuccess = useSuccessNotification();
  const showError = useErrorNotification();

  // Check if user is a manager
  const isManager = userData?.userType === "manager";

  // Get the relevant employer ID (either the user's ID or the manager's employerId)
  const relevantEmployerId = isManager ? userData?.employerId : userData?.id;

  // State for managers
  const [managers, setManagers] = useState<any[]>([]);
  const [showAddManagerModal, setShowAddManagerModal] = useState(false);
  const [showManagerDetailsModal, setShowManagerDetailsModal] = useState(false);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [selectedManager, setSelectedManager] = useState<any>(null);
  const [newManager, setNewManager] = useState({
    name: "",
    email: "",
    position: "",
    whatsappNumber: "",
  });
  const [_loadingManagers, setLoadingManagers] = useState(true);

  // Fetch managers on component mount
  useEffect(() => {
    const fetchManagers = async () => {
      if (!relevantEmployerId) return;

      try {
        setLoadingManagers(true);
        const managersData = await getManagers(relevantEmployerId);
        setManagers(managersData);
      } catch (error) {
        console.error("Error fetching managers:", error);
        showError("Error", "Failed to load managers");
      } finally {
        setLoadingManagers(false);
      }
    };

    fetchManagers();
  }, [relevantEmployerId]);

  // Add new manager
  const addManager = async () => {
    if (!relevantEmployerId) {
      showError("Error", "User information not available");
      return;
    }

    try {
      const managerData = {
        ...newManager,
        employerId: relevantEmployerId,
      };

      const result = await createManager(managerData);
      setManagers([...managers, result]);
      setShowAddManagerModal(false);
      setSelectedManager(result);
      setShowCredentialsModal(true);
      showSuccess("Success", "Manager added successfully");

      // Send WhatsApp message if number is provided
      if (newManager.whatsappNumber) {
        const appUrl = window.location.origin;
        const message = `Welcome to the team! Here are your login credentials:\n\nEmail: ${result.email}\nTemporary Password: ${result.tempPassword}\n\nPlease change your password after logging in at ${appUrl}`;
        const whatsappLink = generateWhatsAppLink(
          newManager.whatsappNumber,
          message
        );

        // Create a hidden link and click it to open WhatsApp
        const link = document.createElement("a");
        link.href = whatsappLink;
        link.target = "_blank";
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error("Error adding manager:", error);
      showError("Error", "Failed to add manager");
    }
  };

  // Delete manager
  const handleDeleteManager = async (managerId: string) => {
    try {
      await deleteManager(managerId);
      setManagers(managers.filter((m) => m.id !== managerId));
      showSuccess("Success", "Manager deleted successfully");
    } catch (error) {
      console.error("Error deleting manager:", error);
      showError("Error", "Failed to delete manager");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your company settings and access controls
          </p>
        </div>
      </div>

      {/* Managers Section */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Managers</h2>
            {!isManager && (
              <button
                onClick={() => setShowAddManagerModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Add Manager
              </button>
            )}
          </div>
          <p className="mt-1 text-sm text-gray-500">
            View and manage company managers
          </p>
        </div>

        {/* Managers List */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {managers.map((manager) => (
              <li key={manager.id}>
                <div className="px-4 py-4 flex items-center sm:px-6">
                  <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <div className="text-sm font-medium text-indigo-600 truncate">
                        {manager.name}
                      </div>
                      <div className="mt-1 text-sm text-gray-500">
                        {manager.email}
                      </div>
                      <div className="mt-1 text-sm text-gray-500">
                        {manager.position}
                      </div>
                    </div>
                  </div>
                  <div className="ml-5 flex items-center space-x-4">
                    <button
                      onClick={() => {
                        setSelectedManager(manager);
                        setShowManagerDetailsModal(true);
                      }}
                      className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                    >
                      View Details
                    </button>
                    {!isManager && (
                      <button
                        onClick={() => handleDeleteManager(manager.id)}
                        className="text-red-600 hover:text-red-900 text-sm font-medium"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Add Manager Modal - Only for employers */}
      {!isManager && (
        <Modal
          isOpen={showAddManagerModal}
          onClose={() => setShowAddManagerModal(false)}
          title="Add New Manager"
          size="medium"
          actions={
            <>
              <button
                className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={() => setShowAddManagerModal(false)}
              >
                Cancel
              </button>
              <button
                className="ml-3 px-4 py-2 bg-indigo-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={addManager}
              >
                Add Manager
              </button>
            </>
          }
        >
          <div className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                value={newManager.name}
                onChange={(e) =>
                  setNewManager({ ...newManager, name: e.target.value })
                }
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={newManager.email}
                onChange={(e) =>
                  setNewManager({ ...newManager, email: e.target.value })
                }
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
                value={newManager.position}
                onChange={(e) =>
                  setNewManager({ ...newManager, position: e.target.value })
                }
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="whatsappNumber"
                className="block text-sm font-medium text-gray-700"
              >
                WhatsApp Number (for notifications)
              </label>
              <input
                type="text"
                name="whatsappNumber"
                id="whatsappNumber"
                placeholder="Country code + number (e.g. 14155552671)"
                value={newManager.whatsappNumber}
                onChange={(e) =>
                  setNewManager({
                    ...newManager,
                    whatsappNumber: e.target.value,
                  })
                }
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">
                Enter WhatsApp number with country code (no + symbol)
              </p>
            </div>
          </div>
        </Modal>
      )}

      {/* Manager Details Modal - Available to both employers and managers */}
      <Modal
        isOpen={showManagerDetailsModal}
        onClose={() => setShowManagerDetailsModal(false)}
        title="Manager Details"
        size="medium"
        actions={
          <button
            className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={() => setShowManagerDetailsModal(false)}
          >
            Close
          </button>
        }
      >
        {selectedManager && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {selectedManager.name}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {selectedManager.email}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700">Position</h4>
              <p className="mt-1 text-sm text-gray-900">
                {selectedManager.position}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700">Added On</h4>
              <p className="mt-1 text-sm text-gray-900">
                {new Date(selectedManager.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        )}
      </Modal>

      {/* Credentials Modal - Only for employers */}
      {!isManager && (
        <Modal
          isOpen={showCredentialsModal}
          onClose={() => setShowCredentialsModal(false)}
          title="Manager Account Created"
          size="small"
          actions={
            <>
              {selectedManager?.whatsappNumber && (
                <button
                  className="px-4 py-2 bg-green-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  onClick={() => {
                    const appUrl = window.location.origin;
                    const message = `Welcome to the team! Here are your login credentials:\n\nEmail: ${selectedManager.email}\nTemporary Password: ${selectedManager.tempPassword}\n\nPlease change your password after logging in at ${appUrl}`;
                    const whatsappLink = generateWhatsAppLink(
                      selectedManager.whatsappNumber,
                      message
                    );
                    window.open(whatsappLink, "_blank");
                  }}
                >
                  Send via WhatsApp
                </button>
              )}
              <button
                className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={() => setShowCredentialsModal(false)}
              >
                Close
              </button>
            </>
          }
        >
          {selectedManager && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">
                  A new manager account has been created for{" "}
                  <span className="font-medium text-gray-900">
                    {selectedManager.name}
                  </span>
                  . Please share these credentials securely:
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Email:
                  </span>
                  <span className="ml-2 text-sm text-gray-900">
                    {selectedManager.email}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">
                    Temporary Password:
                  </span>
                  <span className="ml-2 text-sm text-gray-900">
                    {selectedManager.tempPassword}
                  </span>
                </div>
              </div>
              <p className="text-sm text-yellow-600">
                Note: The manager should change their password upon first login.
              </p>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
};

export default Settings;
