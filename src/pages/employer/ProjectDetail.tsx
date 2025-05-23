import React, { useState, useEffect, useRef } from "react";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import Modal from "../../components/Modal";
import RemoveMemberModal from "../../components/RemoveMemberModal";
import EditProjectModal from "../../components/EditProjectModal";
import {
  getProject,
  deleteProject,
  getEmployee,
  getEmployees,
  updateProject,
  createTask,
  getTasks,
  getProjectActivities,
  createActivity,
  type ActivityData,
  getUserData,
  type ProjectData,
  updateTicketStatus,
} from "../../services/firebase";
import type { TaskData } from "../../services/firebase";
import { useAuth } from "../../contexts/AuthContext";
import {
  useSuccessNotification,
  useErrorNotification,
} from "../../contexts/NotificationContext";
import {
  generateWhatsAppLink,
  generateProjectAddedMessage,
} from "../../utils/whatsappUtils";

// Add interface for Project type that extends ProjectData
interface Project extends ProjectData {
  id: string;
  githubRepo?: string;
  figmaFile?: string;
  jiraBoard?: string;
  designSystemUrl?: string;
  marketingBrief?: string;
  targetAudience?: string;
  budget?: number;
  milestones?: Array<any>;
}

// Status color mapping
const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "completed":
      return "bg-green-100 text-green-800";
    case "in progress":
      return "bg-blue-100 text-blue-800";
    case "not started":
      return "bg-yellow-50 text-yellow-700";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// Priority color mapping
const getPriorityColor = (priority: string) => {
  switch (priority.toLowerCase()) {
    case "high":
      return "bg-red-100 text-red-800";
    case "medium":
      return "bg-yellow-100 text-yellow-800";
    case "low":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// Helper to calculate end date for hourly-based projects
function getProjectEndDate(project: Project) {
  if (project.timeUnit === "hours" && project.estimatedHours) {
    if (!project.startDate) return null;
    const startDate = new Date(project.startDate);
    if (isNaN(startDate.getTime())) return null;
    const calculatedEndDate = new Date(
      startDate.getTime() + project.estimatedHours * 60 * 60 * 1000
    );
    return calculatedEndDate;
  }
  if (!project.endDate) return null;
  const endDate = new Date(project.endDate);
  if (isNaN(endDate.getTime())) return null;
  return endDate;
}

// Helper to calculate due date for hourly-based tasks
function getTaskDueDate(task: any, project: Project) {
  if (task.timeUnit === "hours" && task.estimatedHours) {
    if (!project.startDate) return null;
    const startDate = new Date(project.startDate);
    if (isNaN(startDate.getTime())) return null;
    const calculatedDueDate = new Date(
      startDate.getTime() + task.estimatedHours * 60 * 60 * 1000
    );
    return calculatedDueDate;
  }
  if (!task.dueDate) return null;
  const dueDate = new Date(task.dueDate);
  if (isNaN(dueDate.getTime())) return null;
  return dueDate;
}

// Add helper function to format remaining time
function formatRemainingTime(endDate: Date | null): string {
  if (!endDate) return "N/A";
  const now = new Date();
  const diffMs = endDate.getTime() - now.getTime();
  const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));

  if (diffHours < 0) return "Overdue";
  if (diffHours < 24) return `${diffHours} hours remaining`;

  const diffDays = Math.ceil(diffHours / 24);
  return `${diffDays} days remaining`;
}

const ProjectDetail: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { userData } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const addTaskFromTicketHandled = useRef(false);

  // Move the useEffect here, before any other hooks or state
  useEffect(() => {
    if (
      !addTaskFromTicketHandled.current &&
      location.state &&
      location.state.openAddTaskModal &&
      location.state.addTaskFromTicket
    ) {
      setShowAddTaskModal(true);
      setTaskFormData((prev) => ({
        ...prev,
        ...location.state.addTaskFromTicket,
      }));
      addTaskFromTicketHandled.current = true;
      // Remove the state so it doesn't trigger again
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Define a type for notification functions
  type NotificationFunction = (
    title: string,
    message: string,
    duration?: number
  ) => void;
  const showSuccess: NotificationFunction = useSuccessNotification();
  const showError: NotificationFunction = useErrorNotification();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [loadingTeam, setLoadingTeam] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "overview" | "tasks" | "team" | "activity"
  >("overview");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showMemberDetailModal, setShowMemberDetailModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const [showDeleteProjectModal, setShowDeleteProjectModal] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<any>(null);
  const [showRemoveMemberModal, setShowRemoveMemberModal] = useState(false);
  const [removingMember, setRemovingMember] = useState(false);

  // New state variables
  const [availableEmployees, setAvailableEmployees] = useState<any[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [projectTasks, setProjectTasks] = useState<any[]>([]);
  const [addingTeamMember, setAddingTeamMember] = useState(false);
  const [addingTask, setAddingTask] = useState(false);
  const [taskFormData, setTaskFormData] = useState<Partial<TaskData>>({
    title: "",
    description: "",
    assignedTo: "",
    dueDate: "",
    timeUnit: "days",
    estimatedHours: 0,
    status: "Not Started",
    priority: "Medium",
  });

  // Activity state
  const [projectActivities, setProjectActivities] = useState<any[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);

  // Add pagination state for activities
  const [activitiesPage, _setActivitiesPage] = useState(1);
  const activitiesPerPage = 5; // Show 5 activities per page

  // Get current activities for pagination
  const indexOfLastActivity = activitiesPage * activitiesPerPage;
  const indexOfFirstActivity = indexOfLastActivity - activitiesPerPage;
  const currentActivities = projectActivities.slice(
    indexOfFirstActivity,
    indexOfLastActivity
  );

  // Add state for WhatsApp notification modal
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [newlyAddedMembers, setNewlyAddedMembers] = useState<any[]>([]);

  // Function to fetch project data
  const fetchProjectData = async () => {
    if (!projectId) return;

    try {
      setLoading(true);
      const fetchedProject = await getProject(projectId);
      setProject(fetchedProject);
    } catch (error) {
      console.error("Error fetching project:", error);
      showError("Error", "Failed to load project details");
    } finally {
      setLoading(false);
    }
  };

  // Handle project field change
  const handleProjectChange = (field: string, value: string) => {
    if (!project) return;
    setProject((prev) => {
      if (!prev) return null;
      return { ...prev, [field]: value };
    });
  };

  // Fetch project data when component mounts
  useEffect(() => {
    fetchProjectData();
  }, [projectId]);

  // Fetch team members when project data is loaded
  useEffect(() => {
    const fetchTeamMembers = async () => {
      if (!project || !project.team || project.team.length === 0) {
        setTeamMembers([]);
        return;
      }

      try {
        setLoadingTeam(true);
        const memberPromises = project.team.map((memberId: string) =>
          getEmployee(memberId)
        );

        const members = await Promise.all(memberPromises);
        // Filter out any null results (members not found)
        const validMembers = members.filter((member) => member !== null);

        setTeamMembers(validMembers);
      } catch (error) {
        console.error("Error fetching team members:", error);
        showError("Error", "Failed to load team member details");
      } finally {
        setLoadingTeam(false);
      }
    };

    fetchTeamMembers();
  }, [project]);

  // Fetch project tasks
  useEffect(() => {
    const fetchTasks = async () => {
      if (!projectId) return;

      try {
        setLoadingTasks(true);
        const fetchedTasks = await getTasks(projectId);
        setProjectTasks(fetchedTasks);
      } catch (error) {
        console.error("Error fetching tasks:", error);
        showError("Error", "Failed to load project tasks");
      } finally {
        setLoadingTasks(false);
      }
    };

    fetchTasks();
  }, [projectId]);

  // Fetch project activities
  useEffect(() => {
    const fetchActivities = async () => {
      if (!projectId) return;

      try {
        setLoadingActivities(true);
        const activities = await getProjectActivities(projectId);
        setProjectActivities(activities);
        console.log(`Loaded ${activities.length} activities`);
      } catch (error) {
        console.error("Error fetching activities:", error);
        showError("Error", "Failed to load project activities");
      } finally {
        setLoadingActivities(false);
      }
    };

    fetchActivities();
  }, [projectId]);

  // Fetch available employees for team member selection
  const fetchAvailableEmployees = async () => {
    if (!userData) return;

    try {
      setLoadingEmployees(true);
      // Get all employees for this employer
      const employees = await getEmployees(userData.id);

      // Filter out employees who are already team members
      const currentTeamIds = project?.team || [];
      const filteredEmployees = employees.filter(
        (emp) => !currentTeamIds.includes(emp.id)
      );

      setAvailableEmployees(filteredEmployees);
    } catch (error) {
      console.error("Error fetching employees:", error);
      showError("Error", "Failed to load available employees");
    } finally {
      setLoadingEmployees(false);
    }
  };

  // Handle view team member
  const handleViewMember = (member: any) => {
    setSelectedMember(member);
    setShowMemberDetailModal(true);
  };

  // Handle project deletion
  const handleDeleteProject = async () => {
    if (!projectId) return;

    try {
      await deleteProject(projectId);
      await logProjectActivity("deleted the project");
      showSuccess(
        "Project Deleted",
        "The project has been deleted successfully"
      );
      // Navigate back to projects page
      navigate("/employer/projects");
    } catch (error) {
      console.error("Error deleting project:", error);
      showError("Error", "Failed to delete project");
    }
  };

  // Handle opening the add team member modal
  const handleOpenAddMemberModal = () => {
    setSelectedEmployees([]);
    fetchAvailableEmployees();
    setShowAddMemberModal(true);
  };

  // Handle team member selection
  const handleEmployeeSelection = (employeeId: string) => {
    setSelectedEmployees((prev) => {
      if (prev.includes(employeeId)) {
        return prev.filter((id) => id !== employeeId);
      } else {
        return [...prev, employeeId];
      }
    });
  };

  // Handle adding team members to project
  const handleAddTeamMembers = async () => {
    if (!project || !projectId || selectedEmployees.length === 0) return;

    setAddingTeamMember(true);
    try {
      // Get current team members
      const currentTeam = project.team || [];

      // Create updated team array with new members
      const updatedTeam = [...currentTeam, ...selectedEmployees];

      // Update the project
      await updateProject(projectId, {
        team: updatedTeam,
      });

      // Refresh project data
      const updatedProject = await getProject(projectId);
      setProject(updatedProject);

      // Add to activity log
      await logProjectActivity(
        `added ${selectedEmployees.length} team member(s)`
      );

      // Reset state
      setSelectedEmployees([]);
      setShowAddMemberModal(false);

      // Show success notification
      showSuccess(
        "Team Updated",
        `Successfully added ${selectedEmployees.length} team member(s)`
      );

      // Send WhatsApp notification to each new team member if app URL is available
      const appUrl = window.location.origin;

      // Notify each new team member
      for (const employeeId of selectedEmployees) {
        try {
          const employee = await getEmployee(employeeId);
          // Check if employee has whatsappNumber property and it has a value
          if (
            employee &&
            "whatsappNumber" in employee &&
            employee.whatsappNumber &&
            project
          ) {
            const message = generateProjectAddedMessage(project.name, appUrl);
            const whatsappLink = generateWhatsAppLink(
              employee.whatsappNumber as string,
              message
            );
            window.open(whatsappLink, "_blank");
          }
        } catch (err) {
          console.error("Error sending WhatsApp notification:", err);
          // Don't fail the whole operation if notifications fail
        }
      }

      // In handleAddTeamMembers, after adding members and before setAddingTeamMember(false):
      setNewlyAddedMembers(
        selectedEmployees
          .map((id) => availableEmployees.find((emp) => emp.id === id))
          .filter(Boolean)
      );
      setShowWhatsAppModal(true);
    } catch (error) {
      console.error("Error adding team members:", error);
      showError("Error", "Failed to add team members");
    } finally {
      setAddingTeamMember(false);
    }
  };

  // Handle task form field changes
  const handleTaskFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setTaskFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle adding a new task
  const handleAddTask = async () => {
    if (!project || !projectId || !userData?.id) return;

    // Basic validation
    if (
      !taskFormData.title ||
      !taskFormData.assignedTo ||
      (taskFormData.timeUnit === "days" && !taskFormData.dueDate) ||
      (taskFormData.timeUnit === "hours" && !taskFormData.estimatedHours)
    ) {
      showError("Validation Error", "Please fill in all required fields");
      return;
    }

    setAddingTask(true);
    try {
      // Create the task
      const newTask = await createTask({
        title: taskFormData.title,
        description: taskFormData.description || "",
        projectId: projectId,
        assignedTo: taskFormData.assignedTo,
        status: taskFormData.status as "Not Started",
        priority: taskFormData.priority as "Medium",
        dueDate: taskFormData.dueDate || "",
        timeUnit: taskFormData.timeUnit as "days" | "hours",
        estimatedHours: taskFormData.estimatedHours,
        createdBy: userData.id,
      });

      // If this task was created from a ticket, update the ticket status
      if (location.state?.addTaskFromTicket?.ticketId) {
        await updateTicketStatus(
          location.state.addTaskFromTicket.ticketId,
          "added-to-task",
          userData.id,
          projectId,
          newTask.id
        );
      }

      // Log activity
      await logProjectActivity(`added a new task: ${taskFormData.title}`);

      // Refresh task list
      const updatedTasks = await getTasks(projectId);
      setProjectTasks(updatedTasks);

      // Show success message
      showSuccess("Task Created", "The task has been created successfully");

      // Reset form and close modal
      setTaskFormData({
        title: "",
        description: "",
        assignedTo: "",
        dueDate: "",
        timeUnit: "days",
        estimatedHours: 0,
        status: "Not Started",
        priority: "Medium",
      });
      setShowAddTaskModal(false);
    } catch (error) {
      console.error("Error creating task:", error);
      showError("Error", "Failed to create task");
    } finally {
      setAddingTask(false);
    }
  };

  // Helper function to create an activity
  const logProjectActivity = async (action: string) => {
    if (!projectId || !userData) return;

    try {
      // Get user data to ensure we have the fullName
      const user = await getUserData(userData.id);

      const activityData: ActivityData = {
        projectId,
        user: userData.id,
        userName: (user as any)?.fullName || userData.fullName || "User",
        action,
      };

      await createActivity(activityData);

      // Refresh activities
      const activities = await getProjectActivities(projectId);
      setProjectActivities(activities);
    } catch (error) {
      console.error("Error logging activity:", error);
    }
  };

  // Initiate removing a team member (shows confirmation modal)
  const confirmRemoveTeamMember = (member: any) => {
    setMemberToRemove(member);
    setShowRemoveMemberModal(true);
  };

  // Handle removing a team member from project
  const handleRemoveTeamMember = async (memberId: string) => {
    if (!project || !projectId) return;

    setRemovingMember(true);
    // Get current team members
    const currentTeam = project.team || [];

    // Get the member's name for activity logging
    const memberToRemove = teamMembers.find((member) => member.id === memberId);
    const memberName = memberToRemove ? memberToRemove.name : "a member";

    try {
      // Filter out the member to remove
      const updatedTeam = currentTeam.filter((id) => id !== memberId);

      // Update the project
      await updateProject(projectId, {
        team: updatedTeam,
      });

      // Log activity
      await logProjectActivity(`removed ${memberName} from the team`);

      // Refresh project data
      const updatedProject = await getProject(projectId);
      setProject(updatedProject);

      setShowRemoveMemberModal(false);
      showSuccess(
        "Team Updated",
        `${memberName} has been removed from the team`
      );
    } catch (error) {
      console.error("Error removing team member:", error);
      showError("Error", "Failed to remove team member");
    } finally {
      setRemovingMember(false);
    }
  };

  // If still loading, show a loading spinner
  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // If project not found, show error message
  if (!project) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-medium text-gray-900">
            Project not found
          </h2>
          <p className="mt-2 text-gray-600">
            The project you're looking for doesn't exist or you don't have
            access to it.
          </p>
          <Link
            to="/employer/projects"
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  // Project data with defaults for missing properties
  const projectWithDefaults = {
    ...project,
    tasks: projectTasks,
    teamMembers: teamMembers,
    milestones: project.milestones || [],
    activity: projectActivities,
    progress: project.progress || 0,
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-900 truncate">
                  {project.name}
                </h1>
                <span
                  className={`ml-3 inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium ${getStatusColor(
                    project.status
                  )}`}
                >
                  {project.status}
                </span>
              </div>
              <div className="mt-1 flex items-center text-sm text-gray-500">
                <span className="truncate">
                  {project.startDate
                    ? new Date(project.startDate).toLocaleDateString()
                    : "N/A"}{" "}
                  -{" "}
                  {getProjectEndDate(project)
                    ? getProjectEndDate(project)!.toLocaleDateString()
                    : "N/A"}
                </span>
                <span className="mx-2">•</span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(
                    project.priority
                  )}`}
                >
                  {project.priority} Priority
                </span>
                <span className="mx-2">•</span>
                <span>{project.category}</span>
              </div>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4">
              <Link
                to="/employer/projects"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Back to Projects
              </Link>
              <button
                type="button"
                className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={() => setShowEditModal(true)}
              >
                Edit Project
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {["overview", "tasks", "team", "activity"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as typeof activeTab)}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                  ${
                    activeTab === tab
                      ? "border-indigo-500 text-indigo-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }
                `}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Main content */}
            <div className="lg:col-span-2">
              {/* Project Description */}
              <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Project Description
                  </h3>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                  <p className="text-gray-600">{project.description}</p>
                </div>
              </div>

              {/* Progress */}
              <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Progress
                  </h3>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Overall Completion
                    </span>
                    <span className="text-sm font-medium text-gray-700">
                      {projectWithDefaults.progress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${
                        projectWithDefaults.progress < 30
                          ? "bg-red-500"
                          : projectWithDefaults.progress < 70
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                      style={{ width: `${projectWithDefaults.progress}%` }}
                    ></div>
                  </div>

                  {/* Milestones */}
                  {projectWithDefaults.milestones.length > 0 && (
                    <div className="mt-8">
                      <h4 className="text-base font-medium text-gray-700 mb-4">
                        Milestones
                      </h4>
                      <div className="space-y-3">
                        {projectWithDefaults.milestones.map(
                          (milestone: any) => (
                            <div
                              key={milestone.id}
                              className="flex items-center"
                            >
                              <div
                                className={`flex-shrink-0 h-5 w-5 rounded-full ${
                                  milestone.status === "Completed"
                                    ? "bg-green-500"
                                    : milestone.status === "In Progress"
                                    ? "bg-blue-500"
                                    : "bg-gray-300"
                                }`}
                              ></div>
                              <div className="ml-4 flex-1">
                                <div className="flex justify-between items-center">
                                  <div>
                                    <h5 className="text-sm font-medium text-gray-900">
                                      {milestone.title}
                                    </h5>
                                    <p className="text-xs text-gray-500">
                                      Due:{" "}
                                      {new Date(
                                        milestone.dueDate
                                      ).toLocaleDateString()}
                                    </p>
                                  </div>
                                  <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                      milestone.status
                                    )}`}
                                  >
                                    {milestone.status}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Tasks - only show if there are tasks */}
              {projectWithDefaults.tasks.length > 0 && (
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                  <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Recent Tasks
                    </h3>
                    <button
                      onClick={() => setActiveTab("tasks")}
                      className="text-sm font-medium text-indigo-600 hover:text-indigo-900"
                    >
                      View All
                    </button>
                  </div>
                  <div className="border-t border-gray-200">
                    <ul className="divide-y divide-gray-200">
                      {projectWithDefaults.tasks
                        .slice(0, 4)
                        .map((task: any) => (
                          <li key={task.id} className="px-4 py-4 sm:px-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div
                                  className={`h-2.5 w-2.5 rounded-full mr-2 ${
                                    task.status === "Completed"
                                      ? "bg-green-500"
                                      : task.status === "In Progress"
                                      ? "bg-blue-500"
                                      : "bg-gray-300"
                                  }`}
                                ></div>
                                <p className="text-sm font-medium text-gray-900">
                                  {task.title}
                                </p>
                              </div>
                              <div className="ml-2 flex-shrink-0 flex">
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                    task.status
                                  )}`}
                                >
                                  {task.status}
                                </span>
                              </div>
                            </div>
                            <div className="mt-2 sm:flex sm:justify-between">
                              <div className="sm:flex">
                                <p className="flex items-center text-sm text-gray-500">
                                  <svg
                                    className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                    aria-hidden="true"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  {task.assignee}
                                </p>
                              </div>
                              <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                <svg
                                  className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                  aria-hidden="true"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                <p>
                                  Due{" "}
                                  {formatRemainingTime(
                                    getTaskDueDate(task, project)
                                  )}
                                </p>
                              </div>
                            </div>
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Category-specific information section */}
              {project && (
                <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
                  <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Project Extra Information
                    </h3>
                  </div>
                  <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                    <dl className="sm:divide-y sm:divide-gray-200">
                      {/* Show different fields based on category */}
                      {project.category === "Development" && (
                        <>
                          {project.githubRepo && (
                            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                              <dt className="text-sm font-medium text-gray-500">
                                GitHub Repository
                              </dt>
                              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                <a
                                  href={project.githubRepo}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-indigo-600 hover:text-indigo-900 break-all"
                                >
                                  {project.githubRepo}
                                </a>
                              </dd>
                            </div>
                          )}
                          {project.figmaFile && (
                            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                              <dt className="text-sm font-medium text-gray-500">
                                Figma File
                              </dt>
                              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                <a
                                  href={project.figmaFile}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-indigo-600 hover:text-indigo-900 break-all"
                                >
                                  {project.figmaFile}
                                </a>
                              </dd>
                            </div>
                          )}
                          {project.jiraBoard && (
                            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                              <dt className="text-sm font-medium text-gray-500">
                                Jira Board
                              </dt>
                              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                <a
                                  href={project.jiraBoard}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-indigo-600 hover:text-indigo-900 break-all"
                                >
                                  {project.jiraBoard}
                                </a>
                              </dd>
                            </div>
                          )}
                        </>
                      )}
                      {project.category === "Design" && (
                        <>
                          {project.figmaFile && (
                            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                              <dt className="text-sm font-medium text-gray-500">
                                Figma File
                              </dt>
                              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                <a
                                  href={project.figmaFile}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-indigo-600 hover:text-indigo-900 break-all"
                                >
                                  {project.figmaFile}
                                </a>
                              </dd>
                            </div>
                          )}
                          {project.designSystemUrl && (
                            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                              <dt className="text-sm font-medium text-gray-500">
                                Design System
                              </dt>
                              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                <a
                                  href={project.designSystemUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-indigo-600 hover:text-indigo-900 break-all"
                                >
                                  {project.designSystemUrl}
                                </a>
                              </dd>
                            </div>
                          )}
                        </>
                      )}
                      {project.category === "Marketing" && (
                        <>
                          {project.marketingBrief && (
                            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                              <dt className="text-sm font-medium text-gray-500">
                                Marketing Brief
                              </dt>
                              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 whitespace-pre-wrap">
                                {project.marketingBrief}
                              </dd>
                            </div>
                          )}
                          {project.targetAudience && (
                            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                              <dt className="text-sm font-medium text-gray-500">
                                Target Audience
                              </dt>
                              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                {project.targetAudience}
                              </dd>
                            </div>
                          )}
                        </>
                      )}
                      {/* Show a message if no extra information is available */}
                      {!project.githubRepo &&
                        !project.figmaFile &&
                        !project.jiraBoard &&
                        !project.designSystemUrl &&
                        !project.marketingBrief &&
                        !project.targetAudience && (
                          <div className="py-4 sm:py-5 sm:px-6">
                            <p className="text-sm text-gray-500 italic">
                              No additional information available for this
                              project.
                            </p>
                          </div>
                        )}
                    </dl>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Project Info */}
              <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Project Information
                  </h3>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">
                        Budget
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        $
                        {project.budget
                          ? project.budget.toLocaleString()
                          : "N/A"}
                      </dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">
                        Category
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {project.category}
                      </dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">
                        Start Date
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {new Date(project.startDate).toLocaleDateString()}
                      </dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">
                        End Date
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {getProjectEndDate(project)
                          ? getProjectEndDate(project)!.toLocaleDateString()
                          : "N/A"}
                      </dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">
                        Tasks Status
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        <div className="flex space-x-4">
                          <div>
                            <span className="text-lg font-medium">
                              {
                                projectWithDefaults.tasks.filter(
                                  (t: any) => t.status === "Completed"
                                ).length
                              }
                            </span>
                            <p className="text-xs text-gray-500">Completed</p>
                          </div>
                          <div>
                            <span className="text-lg font-medium">
                              {
                                projectWithDefaults.tasks.filter(
                                  (t: any) => t.status === "In Progress"
                                ).length
                              }
                            </span>
                            <p className="text-xs text-gray-500">In Progress</p>
                          </div>
                          <div>
                            <span className="text-lg font-medium">
                              {
                                projectWithDefaults.tasks.filter(
                                  (t: any) => t.status === "Not Started"
                                ).length
                              }
                            </span>
                            <p className="text-xs text-gray-500">Not Started</p>
                          </div>
                        </div>
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              {/* Team Members */}
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Team
                  </h3>
                  <button
                    onClick={() => setActiveTab("team")}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-900"
                  >
                    View All
                  </button>
                </div>
                <div className="border-t border-gray-200">
                  {loadingTeam ? (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
                    </div>
                  ) : teamMembers.length === 0 ? (
                    <div className="px-4 py-4 text-center text-sm text-gray-500">
                      No team members assigned to this project yet.
                    </div>
                  ) : (
                    <ul className="divide-y divide-gray-200">
                      {projectWithDefaults.teamMembers.map((member: any) => (
                        <li
                          key={member.id}
                          className="px-4 py-4 sm:px-6 hover:bg-gray-50"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                              <img
                                className="h-12 w-12 rounded-full"
                                src={member.avatar}
                                alt={member.name}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {member.name}
                              </p>
                              <p className="text-sm text-gray-500 truncate">
                                {member.position || member.role}
                              </p>
                              {member.email && (
                                <p className="text-xs text-gray-500 truncate">
                                  {member.email}
                                </p>
                              )}
                            </div>
                            <div>
                              <button
                                type="button"
                                className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                onClick={() => handleViewMember(member)}
                              >
                                View
                              </button>
                              <button
                                type="button"
                                className="ml-2 inline-flex items-center px-2.5 py-1.5 border border-red-300 shadow-sm text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                onClick={() => confirmRemoveTeamMember(member)}
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tasks Tab */}
        {activeTab === "tasks" && (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Project Tasks
              </h3>
              <button
                type="button"
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={() => setShowAddTaskModal(true)}
              >
                Add Task
              </button>
            </div>
            <div className="border-t border-gray-200">
              {loadingTasks ? (
                <div className="flex justify-center py-16">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                </div>
              ) : projectTasks.length === 0 ? (
                <div className="px-4 py-16 text-center text-gray-500">
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
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No tasks yet
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Get started by creating a new task for this project.
                  </p>
                  <div className="mt-6">
                    <button
                      type="button"
                      onClick={() => setShowAddTaskModal(true)}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <svg
                        className="-ml-1 mr-2 h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Create a Task
                    </button>
                  </div>
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {projectTasks.map((task) => {
                    // Find team member name from the assignedTo id
                    const assignedMember = teamMembers.find(
                      (member) => member.id === task.assignedTo
                    );
                    const assigneeName = assignedMember
                      ? assignedMember.name
                      : "Unassigned";

                    return (
                      <li
                        key={task.id}
                        className="px-4 py-4 sm:px-6 hover:bg-gray-50"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div
                              className={`h-3 w-3 rounded-full mr-3 ${
                                task.status === "Completed"
                                  ? "bg-green-500"
                                  : task.status === "In Progress"
                                  ? "bg-blue-500"
                                  : "bg-gray-300"
                              }`}
                            ></div>
                            <p className="text-sm font-medium text-gray-900">
                              {task.title}
                            </p>
                          </div>
                          <div className="ml-2 flex-shrink-0 flex">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                task.status
                              )}`}
                            >
                              {task.status}
                            </span>
                          </div>
                        </div>
                        <div className="mt-2 sm:flex sm:justify-between">
                          <div className="sm:flex">
                            <p className="flex items-center text-sm text-gray-500">
                              <svg
                                className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                aria-hidden="true"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              {assigneeName}
                            </p>
                          </div>
                          <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                            <svg
                              className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                              aria-hidden="true"
                            >
                              <path
                                fillRule="evenodd"
                                d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <p>
                              Due{" "}
                              {formatRemainingTime(
                                getTaskDueDate(task, project)
                              )}
                            </p>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* Team Tab */}
        {activeTab === "team" && (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Project Team
              </h3>
              <button
                type="button"
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={handleOpenAddMemberModal}
              >
                Add Members
              </button>
            </div>
            <div className="border-t border-gray-200">
              {loadingTeam ? (
                <div className="flex justify-center py-16">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                </div>
              ) : teamMembers.length === 0 ? (
                <div className="px-4 py-16 text-center text-gray-500">
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
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No team members
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Get started by adding team members to this project.
                  </p>
                  <div className="mt-6">
                    <button
                      type="button"
                      onClick={() => setShowAddMemberModal(true)}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <svg
                        className="-ml-1 mr-2 h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                      </svg>
                      Add Team Members
                    </button>
                  </div>
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {projectWithDefaults.teamMembers.map((member: any) => (
                    <li
                      key={member.id}
                      className="px-4 py-4 sm:px-6 hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <img
                            className="h-12 w-12 rounded-full"
                            src={member.avatar}
                            alt={member.name}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {member.name}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {member.position || member.role}
                          </p>
                          {member.email && (
                            <p className="text-xs text-gray-500 truncate">
                              {member.email}
                            </p>
                          )}
                        </div>
                        <div>
                          <button
                            type="button"
                            className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            onClick={() => handleViewMember(member)}
                          >
                            View
                          </button>
                          <button
                            type="button"
                            className="ml-2 inline-flex items-center px-2.5 py-1.5 border border-red-300 shadow-sm text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            onClick={() => confirmRemoveTeamMember(member)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* Activities Tab */}
        {activeTab === "activity" && (
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Project Activity
              </h3>
            </div>
            {loadingActivities ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto"></div>
              </div>
            ) : currentActivities.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                No activities recorded yet
              </div>
            ) : (
              <div className="space-y-4">
                {currentActivities.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-3 bg-white p-4 rounded-lg shadow"
                  >
                    <div className="flex-shrink-0">
                      <span className="inline-block h-10 w-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                        {activity.userName ? activity.userName.charAt(0) : "U"}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {activity.userName || "Unknown User"}
                      </div>
                      <div className="text-sm text-gray-700">
                        {activity.action}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {activity.timestamp && activity.timestamp.seconds
                          ? new Date(
                              activity.timestamp.seconds * 1000
                            ).toLocaleString()
                          : ""}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {/* Pagination controls remain unchanged */}
            {projectActivities.length > activitiesPerPage && (
              <div className="mt-4 flex justify-center">
                {/* Pagination controls */}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Project Modal */}
      {project && (
        <EditProjectModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onRefresh={fetchProjectData}
          onConfirm={async () => {
            try {
              if (!projectId) return;

              await updateProject(projectId, {
                ...project,
                ...(project.githubRepo && { githubRepo: project.githubRepo }),
                ...(project.figmaFile && { figmaFile: project.figmaFile }),
                ...(project.jiraBoard && { jiraBoard: project.jiraBoard }),
                ...(project.designSystemUrl && {
                  designSystemUrl: project.designSystemUrl,
                }),
                ...(project.marketingBrief && {
                  marketingBrief: project.marketingBrief,
                }),
                ...(project.targetAudience && {
                  targetAudience: project.targetAudience,
                }),
              });
              setShowEditModal(false);
              showSuccess("Success", "Project updated successfully");

              // Refresh project data
              await fetchProjectData();

              // Log the activity
              await logProjectActivity("updated the project details");
            } catch (error) {
              console.error("Error updating project:", error);
              showError("Error", "Failed to update project");
            }
          }}
          project={project}
          onChange={handleProjectChange}
        />
      )}

      {/* Delete Project Confirmation Modal */}
      <Modal
        isOpen={showDeleteProjectModal}
        onClose={() => setShowDeleteProjectModal(false)}
        title="Delete Project"
        size="small"
        actions={
          <>
            <button
              className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={() => setShowDeleteProjectModal(false)}
            >
              Cancel
            </button>
            <button
              className="ml-3 px-4 py-2 bg-red-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              onClick={() => {
                setShowDeleteProjectModal(false);
                handleDeleteProject();
              }}
            >
              Delete
            </button>
          </>
        }
      >
        <div className="py-4">
          <p className="text-sm text-gray-500">
            Are you sure you want to delete this project? This action cannot be
            undone and all associated data will be permanently removed.
          </p>
        </div>
      </Modal>

      {/* Add Task Modal */}
      <Modal
        isOpen={showAddTaskModal}
        onClose={() => setShowAddTaskModal(false)}
        title="Add New Task"
        size="medium"
        actions={
          <>
            <button
              className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={() => setShowAddTaskModal(false)}
              disabled={addingTask}
            >
              Cancel
            </button>
            <button
              className="ml-3 px-4 py-2 bg-indigo-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleAddTask}
              disabled={addingTask}
            >
              {addingTask ? "Adding..." : "Add Task"}
            </button>
          </>
        }
      >
        <div className="py-4 space-y-4">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700"
            >
              Task Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={taskFormData.title}
              onChange={handleTaskFormChange}
              className="mt-1 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md"
              required
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
              value={taskFormData.description}
              onChange={handleTaskFormChange}
              className="mt-1 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="assignedTo"
                className="block text-sm font-medium text-gray-700"
              >
                Assignee *
              </label>
              <select
                id="assignedTo"
                name="assignedTo"
                value={taskFormData.assignedTo}
                onChange={handleTaskFormChange}
                className="mt-1 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md"
                required
              >
                <option value="">Select team member</option>
                {teamMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="timeUnit"
                className="block text-sm font-medium text-gray-700"
              >
                Time Unit
              </label>
              <select
                id="timeUnit"
                name="timeUnit"
                value={taskFormData.timeUnit}
                onChange={handleTaskFormChange}
                className="mt-1 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md"
              >
                <option value="days">Days</option>
                <option value="hours">Hours</option>
              </select>
            </div>
          </div>
          {taskFormData.timeUnit === "hours" ? (
            <div>
              <label
                htmlFor="estimatedHours"
                className="block text-sm font-medium text-gray-700"
              >
                Estimated Hours
              </label>
              <input
                type="number"
                id="estimatedHours"
                name="estimatedHours"
                min="0"
                step="0.5"
                value={taskFormData.estimatedHours}
                onChange={handleTaskFormChange}
                className="mt-1 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          ) : (
            <div>
              <label
                htmlFor="dueDate"
                className="block text-sm font-medium text-gray-700"
              >
                Due Date
              </label>
              <input
                type="date"
                id="dueDate"
                name="dueDate"
                value={taskFormData.dueDate}
                onChange={handleTaskFormChange}
                className="mt-1 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="priority"
                className="block text-sm font-medium text-gray-700"
              >
                Priority
              </label>
              <select
                id="priority"
                name="priority"
                value={taskFormData.priority}
                onChange={handleTaskFormChange}
                className="mt-1 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
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
                value={taskFormData.status}
                onChange={handleTaskFormChange}
                className="mt-1 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md"
              >
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>
        </div>
      </Modal>

      {/* Add Team Member Modal */}
      <Modal
        isOpen={showAddMemberModal}
        onClose={() => setShowAddMemberModal(false)}
        title="Add Team Members"
        size="medium"
        actions={
          <>
            <button
              className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={() => setShowAddMemberModal(false)}
              disabled={addingTeamMember}
            >
              Cancel
            </button>
            <button
              className="ml-3 px-4 py-2 bg-indigo-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleAddTeamMembers}
              disabled={addingTeamMember || selectedEmployees.length === 0}
            >
              {addingTeamMember ? "Adding..." : "Add Members"}
            </button>
          </>
        }
      >
        <div className="py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Select Employees
            </label>
            <div className="mt-2 space-y-2 max-h-60 overflow-y-auto border border-gray-300 rounded-md p-2">
              {loadingEmployees ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
                </div>
              ) : availableEmployees.length === 0 ? (
                <div className="py-8 text-center text-gray-500 text-sm">
                  No available employees to add
                </div>
              ) : (
                availableEmployees.map((emp) => (
                  <div
                    key={emp.id}
                    className="flex items-center p-2 hover:bg-gray-50 rounded"
                  >
                    <input
                      id={`employee-${emp.id}`}
                      name={`employee-${emp.id}`}
                      type="checkbox"
                      checked={selectedEmployees.includes(emp.id)}
                      onChange={() => handleEmployeeSelection(emp.id)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor={`employee-${emp.id}`}
                      className="ml-3 flex items-center cursor-pointer"
                    >
                      <img
                        src={emp.avatar}
                        alt={emp.name}
                        className="h-8 w-8 rounded-full mr-2"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {emp.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {emp.position || emp.role}
                        </p>
                      </div>
                    </label>
                    {selectedEmployees.includes(emp.id) && (
                      <div className="ml-auto flex items-center">
                        <input
                          type="text"
                          placeholder="WhatsApp number"
                          className="text-xs p-1 border border-gray-300 rounded"
                          defaultValue={emp.whatsappNumber || ""}
                          onChange={(e) => {
                            // Update the member's WhatsApp number in the teamMembers state
                            const updatedMembers = teamMembers.map((member) => {
                              if (member.id === emp.id) {
                                return {
                                  ...member,
                                  whatsappNumber: e.target.value,
                                };
                              }
                              return member;
                            });
                            setTeamMembers(updatedMembers);
                            // Also update in availableEmployees so the WhatsApp modal sees the latest value
                            const updatedAvailable = availableEmployees.map(
                              (employee) => {
                                if (employee.id === emp.id) {
                                  return {
                                    ...employee,
                                    whatsappNumber: e.target.value,
                                  };
                                }
                                return employee;
                              }
                            );
                            setAvailableEmployees(updatedAvailable);
                          }}
                        />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Enter WhatsApp numbers with country code (e.g. 14155552671 for US
              number)
            </p>
          </div>
        </div>
      </Modal>

      {/* Team Member Detail Modal */}
      <Modal
        isOpen={showMemberDetailModal}
        onClose={() => setShowMemberDetailModal(false)}
        title="Team Member Details"
        size="medium"
        actions={
          <button
            className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={() => setShowMemberDetailModal(false)}
          >
            Close
          </button>
        }
      >
        {selectedMember && (
          <div className="py-4">
            <div className="flex items-center mb-6">
              <img
                src={selectedMember.avatar}
                alt={selectedMember.name}
                className="h-16 w-16 rounded-full mr-4"
              />
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {selectedMember.name}
                </h3>
                <p className="text-sm text-gray-500">
                  {selectedMember.position || selectedMember.role}
                </p>
                {selectedMember.email && (
                  <p className="text-sm text-gray-500">
                    {selectedMember.email}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700">
                  Department
                </h4>
                <p className="mt-1 text-sm text-gray-600">
                  {selectedMember.department || "Not assigned"}
                </p>
              </div>

              {selectedMember.status && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Status</h4>
                  <p className="mt-1 text-sm text-gray-600">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        selectedMember.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {selectedMember.status.charAt(0).toUpperCase() +
                        selectedMember.status.slice(1)}
                    </span>
                  </p>
                </div>
              )}

              {selectedMember.joinDate && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Joined</h4>
                  <p className="mt-1 text-sm text-gray-600">
                    {new Date(selectedMember.joinDate).toLocaleDateString()}
                  </p>
                </div>
              )}

              <div>
                <h4 className="text-sm font-medium text-gray-700">
                  Assigned Tasks
                </h4>
                <div className="mt-1 bg-gray-50 rounded-md p-3">
                  <ul className="space-y-2">
                    {loadingTasks ? (
                      <li className="flex justify-center py-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-500"></div>
                      </li>
                    ) : (
                      projectTasks
                        .filter((task) => task.assignedTo === selectedMember.id)
                        .map((task) => (
                          <li key={task.id} className="flex items-center">
                            <span
                              className={`h-2 w-2 rounded-full mr-2 ${
                                task.status === "Completed"
                                  ? "bg-green-500"
                                  : task.status === "In Progress"
                                  ? "bg-blue-500"
                                  : "bg-gray-300"
                              }`}
                            ></span>
                            <span className="text-sm">{task.title}</span>
                            <span
                              className={`ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                task.status
                              )}`}
                            >
                              {task.status}
                            </span>
                          </li>
                        ))
                    )}
                    {!loadingTasks &&
                      !projectTasks.some(
                        (task) => task.assignedTo === selectedMember.id
                      ) && (
                        <li className="text-sm text-gray-500">
                          No tasks assigned
                        </li>
                      )}
                  </ul>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 flex justify-between">
                <button
                  type="button"
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={() => setShowAddTaskModal(true)}
                >
                  Assign New Task
                </button>
                <button
                  type="button"
                  className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  onClick={() => {
                    if (selectedMember) {
                      confirmRemoveTeamMember(selectedMember);
                    }
                  }}
                >
                  Remove from Project
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Remove Team Member Modal */}
      <RemoveMemberModal
        isOpen={showRemoveMemberModal}
        memberToRemove={memberToRemove}
        onClose={() => {
          if (!removingMember) {
            setShowRemoveMemberModal(false);
            setMemberToRemove(null);
          }
        }}
        onConfirm={handleRemoveTeamMember}
        isLoading={removingMember}
      />

      {showWhatsAppModal && (
        <Modal
          isOpen={showWhatsAppModal}
          onClose={() => setShowWhatsAppModal(false)}
          title="Send WhatsApp Notifications"
          size="medium"
          actions={
            <button
              className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={() => setShowWhatsAppModal(false)}
            >
              Close
            </button>
          }
        >
          <div className="py-4 space-y-4">
            {newlyAddedMembers.length === 0 ? (
              <p className="text-gray-700">
                No WhatsApp numbers available for new members.
              </p>
            ) : (
              newlyAddedMembers.map((member) => {
                const whatsappNumber = member.whatsappNumber;
                return (
                  <div
                    key={member.id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <span className="font-medium">{member.name}</span>
                      {whatsappNumber && (
                        <span className="ml-2 text-xs text-gray-500">
                          {whatsappNumber}
                        </span>
                      )}
                    </div>
                    {whatsappNumber ? (
                      <button
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs"
                        onClick={() => {
                          const appUrl = window.location.origin;
                          const message = generateProjectAddedMessage(
                            project.name,
                            appUrl
                          );
                          const whatsappLink = generateWhatsAppLink(
                            whatsappNumber,
                            message
                          );
                          window.open(whatsappLink, "_blank");
                        }}
                      >
                        Send WhatsApp Notification
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400">
                        No WhatsApp number
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ProjectDetail;
