import React, { useState } from "react";
import Modal from "../../components/Modal";

const Settings = () => {
  // State for company profile
  const [companyProfile, setCompanyProfile] = useState({
    name: "Acme Corporation",
    industry: "Technology",
    size: "50-200 employees",
    website: "https://acmecorp.example.com",
    email: "contact@acmecorp.example.com",
    phone: "+1 (555) 123-4567",
    address: "123 Tech Park, San Francisco, CA 94107",
    logo: "https://via.placeholder.com/150",
  });

  // State for notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    projectUpdates: true,
    taskAssignments: true,
    timeApprovals: true,
    employeeActivity: false,
    rewardActivity: true,
    weeklyReports: true,
    monthlyReports: true,
  });

  // State for system settings
  const [systemSettings, setSystemSettings] = useState({
    timeFormat: "12h",
    dateFormat: "MM/DD/YYYY",
    timezone: "America/Los_Angeles",
    language: "English",
    dataRetention: "1 year",
    autoLogout: "30 minutes",
  });

  // State for active tab
  const [activeTab, setActiveTab] = useState("company");

  // Add modal state
  const [showSaveSuccessModal, setShowSaveSuccessModal] = useState(false);

  // Handle input change for company profile
  const handleCompanyProfileChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setCompanyProfile({
      ...companyProfile,
      [name]: value,
    });
  };

  // Handle toggle change for notification settings
  const handleNotificationChange = (setting: string) => {
    setNotificationSettings({
      ...notificationSettings,
      [setting]:
        !notificationSettings[setting as keyof typeof notificationSettings],
    });
  };

  // Handle system settings change
  const handleSystemSettingChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setSystemSettings({
      ...systemSettings,
      [name]: value,
    });
  };

  // Function to save settings (would connect to backend in real implementation)
  const saveSettings = () => {
    setShowSaveSuccessModal(true);
    // In a real implementation, you would send this data to your backend
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
        <p className="text-gray-600 mt-2">
          Manage your company profile, notifications, and system settings
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="flex -mb-px">
          <button
            onClick={() => setActiveTab("company")}
            className={`py-4 px-6 font-medium text-sm ${
              activeTab === "company"
                ? "border-b-2 border-indigo-500 text-indigo-600"
                : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Company Profile
          </button>
          <button
            onClick={() => setActiveTab("notifications")}
            className={`py-4 px-6 font-medium text-sm ${
              activeTab === "notifications"
                ? "border-b-2 border-indigo-500 text-indigo-600"
                : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Notifications
          </button>
          <button
            onClick={() => setActiveTab("system")}
            className={`py-4 px-6 font-medium text-sm ${
              activeTab === "system"
                ? "border-b-2 border-indigo-500 text-indigo-600"
                : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            System Settings
          </button>
        </nav>
      </div>

      {/* Company Profile Tab Content */}
      {activeTab === "company" && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            Company Profile
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name
              </label>
              <input
                type="text"
                name="name"
                value={companyProfile.name}
                onChange={handleCompanyProfileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Industry
              </label>
              <select
                name="industry"
                value={companyProfile.industry}
                onChange={handleCompanyProfileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="Technology">Technology</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Finance">Finance</option>
                <option value="Education">Education</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Retail">Retail</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Size
              </label>
              <select
                name="size"
                value={companyProfile.size}
                onChange={handleCompanyProfileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="1-10 employees">1-10 employees</option>
                <option value="11-50 employees">11-50 employees</option>
                <option value="50-200 employees">50-200 employees</option>
                <option value="201-500 employees">201-500 employees</option>
                <option value="501-1000 employees">501-1000 employees</option>
                <option value="1000+ employees">1000+ employees</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website
              </label>
              <input
                type="url"
                name="website"
                value={companyProfile.website}
                onChange={handleCompanyProfileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={companyProfile.email}
                onChange={handleCompanyProfileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={companyProfile.phone}
                onChange={handleCompanyProfileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <textarea
                name="address"
                value={companyProfile.address}
                onChange={handleCompanyProfileChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              ></textarea>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Logo
              </label>
              <div className="flex items-center space-x-6">
                <img
                  src={companyProfile.logo}
                  alt="Company Logo"
                  className="h-24 w-24 object-cover rounded-md"
                />
                <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500">
                  Change Logo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Tab Content */}
      {activeTab === "notifications" && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            Notification Settings
          </h2>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-medium text-gray-900">
                  Email Notifications
                </h3>
                <p className="text-sm text-gray-500">
                  Receive notifications via email
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationSettings.emailNotifications}
                  onChange={() =>
                    handleNotificationChange("emailNotifications")
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-base font-medium text-gray-900 mb-4">
                Notification Types
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      Project Updates
                    </h4>
                    <p className="text-xs text-gray-500">
                      Get notified about project status changes
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationSettings.projectUpdates}
                      onChange={() =>
                        handleNotificationChange("projectUpdates")
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      Task Assignments
                    </h4>
                    <p className="text-xs text-gray-500">
                      Get notified when tasks are assigned
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationSettings.taskAssignments}
                      onChange={() =>
                        handleNotificationChange("taskAssignments")
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      Time Approvals
                    </h4>
                    <p className="text-xs text-gray-500">
                      Get notified of time approval requests
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationSettings.timeApprovals}
                      onChange={() => handleNotificationChange("timeApprovals")}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      Employee Activity
                    </h4>
                    <p className="text-xs text-gray-500">
                      Get notified of employee logins and status changes
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationSettings.employeeActivity}
                      onChange={() =>
                        handleNotificationChange("employeeActivity")
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      Reward Activity
                    </h4>
                    <p className="text-xs text-gray-500">
                      Get notified of reward claims and point changes
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationSettings.rewardActivity}
                      onChange={() =>
                        handleNotificationChange("rewardActivity")
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-base font-medium text-gray-900 mb-4">
                Report Schedule
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      Weekly Reports
                    </h4>
                    <p className="text-xs text-gray-500">
                      Receive summary reports every week
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationSettings.weeklyReports}
                      onChange={() => handleNotificationChange("weeklyReports")}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      Monthly Reports
                    </h4>
                    <p className="text-xs text-gray-500">
                      Receive detailed reports every month
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationSettings.monthlyReports}
                      onChange={() =>
                        handleNotificationChange("monthlyReports")
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* System Settings Tab Content */}
      {activeTab === "system" && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            System Settings
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Format
              </label>
              <select
                name="timeFormat"
                value={systemSettings.timeFormat}
                onChange={handleSystemSettingChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="12h">12-hour (AM/PM)</option>
                <option value="24h">24-hour</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Format
              </label>
              <select
                name="dateFormat"
                value={systemSettings.dateFormat}
                onChange={handleSystemSettingChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Timezone
              </label>
              <select
                name="timezone"
                value={systemSettings.timezone}
                onChange={handleSystemSettingChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="America/Los_Angeles">
                  Pacific Time (US & Canada)
                </option>
                <option value="America/Denver">
                  Mountain Time (US & Canada)
                </option>
                <option value="America/Chicago">
                  Central Time (US & Canada)
                </option>
                <option value="America/New_York">
                  Eastern Time (US & Canada)
                </option>
                <option value="Europe/London">GMT (UTC+0)</option>
                <option value="Europe/Paris">Central European Time</option>
                <option value="Asia/Tokyo">Japan Standard Time</option>
                <option value="Australia/Sydney">
                  Australian Eastern Time
                </option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Language
              </label>
              <select
                name="language"
                value={systemSettings.language}
                onChange={handleSystemSettingChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="English">English</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
                <option value="German">German</option>
                <option value="Chinese">Chinese</option>
                <option value="Japanese">Japanese</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Retention
              </label>
              <select
                name="dataRetention"
                value={systemSettings.dataRetention}
                onChange={handleSystemSettingChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="3 months">3 months</option>
                <option value="6 months">6 months</option>
                <option value="1 year">1 year</option>
                <option value="2 years">2 years</option>
                <option value="indefinite">Indefinite</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Auto Logout After Inactivity
              </label>
              <select
                name="autoLogout"
                value={systemSettings.autoLogout}
                onChange={handleSystemSettingChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="15 minutes">15 minutes</option>
                <option value="30 minutes">30 minutes</option>
                <option value="1 hour">1 hour</option>
                <option value="2 hours">2 hours</option>
                <option value="never">Never</option>
              </select>
            </div>
          </div>

          <div className="mt-8 border-t border-gray-200 pt-6">
            <h3 className="text-base font-medium text-gray-900 mb-4">
              Advanced Settings
            </h3>

            <div className="space-y-4">
              <button className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500">
                Clear All Application Data
              </button>

              <button className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-500">
                Export All Data
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 flex justify-end space-x-4">
        <button
          onClick={() => {}}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Cancel
        </button>
        <button
          onClick={saveSettings}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Save Settings
        </button>
      </div>

      {/* Success Modal */}
      <Modal
        isOpen={showSaveSuccessModal}
        onClose={() => setShowSaveSuccessModal(false)}
        title="Settings Saved"
        size="small"
        actions={
          <button
            onClick={() => setShowSaveSuccessModal(false)}
            className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            OK
          </button>
        }
      >
        <div className="py-4 flex flex-col items-center">
          <div className="mb-4 p-3 bg-green-100 rounded-full">
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
          <p className="text-gray-700 text-center">
            Settings saved successfully!
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default Settings;
