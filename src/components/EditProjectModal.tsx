import React from "react";
import Modal from "./Modal";

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  onRefresh: () => Promise<void>;
  project: {
    name: string;
    description: string;
    category: string;
    priority: string;
    startDate: string;
    endDate: string;
    githubRepo?: string;
    figmaFile?: string;
    jiraBoard?: string;
    designSystemUrl?: string;
    marketingBrief?: string;
    targetAudience?: string;
  };
  onChange: (field: string, value: string) => void;
}

const EditProjectModal: React.FC<EditProjectModalProps> = ({
  isOpen,
  onClose,
  onConfirm,

  project,
  onChange,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Project"
      size="medium"
      actions={
        <>
          <button
            type="button"
            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
            onClick={onConfirm}
          >
            Save Changes
          </button>
        </>
      }
    >
      <div className="mt-4 space-y-6">
        {/* Basic Project Information */}
        <div className="space-y-4">
          <div>
            <label
              htmlFor="edit-name"
              className="block text-sm font-medium text-gray-700"
            >
              Project Name
            </label>
            <input
              type="text"
              id="edit-name"
              value={project.name}
              onChange={(e) => onChange("name", e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="edit-description"
              className="block text-sm font-medium text-gray-700"
            >
              Description
            </label>
            <textarea
              id="edit-description"
              rows={3}
              value={project.description}
              onChange={(e) => onChange("description", e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          {/* Grid layout for date, category, priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="edit-category"
                className="block text-sm font-medium text-gray-700"
              >
                Category
              </label>
              <select
                id="edit-category"
                value={project.category}
                onChange={(e) => onChange("category", e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="Development">Development</option>
                <option value="Design">Design</option>
                <option value="Marketing">Marketing</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="edit-priority"
                className="block text-sm font-medium text-gray-700"
              >
                Priority
              </label>
              <select
                id="edit-priority"
                value={project.priority}
                onChange={(e) => onChange("priority", e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="edit-start-date"
                className="block text-sm font-medium text-gray-700"
              >
                Start Date
              </label>
              <input
                type="date"
                id="edit-start-date"
                value={project.startDate}
                onChange={(e) => onChange("startDate", e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="edit-end-date"
                className="block text-sm font-medium text-gray-700"
              >
                End Date
              </label>
              <input
                type="date"
                id="edit-end-date"
                value={project.endDate}
                onChange={(e) => onChange("endDate", e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>
        </div>

        {/* Category-specific fields section */}
        {project.category && (
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              Additional {project.category} Information
            </h3>
            <div className="space-y-4">
              {project.category === "Development" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="edit-github"
                      className="block text-sm font-medium text-gray-700"
                    >
                      GitHub Repository URL
                    </label>
                    <input
                      type="text"
                      id="edit-github"
                      value={project.githubRepo || ""}
                      onChange={(e) => onChange("githubRepo", e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="edit-figma"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Figma File URL
                    </label>
                    <input
                      type="text"
                      id="edit-figma"
                      value={project.figmaFile || ""}
                      onChange={(e) => onChange("figmaFile", e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div className="col-span-2">
                    <label
                      htmlFor="edit-jira"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Jira Board URL
                    </label>
                    <input
                      type="text"
                      id="edit-jira"
                      value={project.jiraBoard || ""}
                      onChange={(e) => onChange("jiraBoard", e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
              )}

              {project.category === "Design" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="edit-figma"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Figma File URL
                    </label>
                    <input
                      type="text"
                      id="edit-figma"
                      value={project.figmaFile || ""}
                      onChange={(e) => onChange("figmaFile", e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="edit-design-system"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Design System URL
                    </label>
                    <input
                      type="text"
                      id="edit-design-system"
                      value={project.designSystemUrl || ""}
                      onChange={(e) =>
                        onChange("designSystemUrl", e.target.value)
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
              )}

              {project.category === "Marketing" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label
                      htmlFor="edit-brief"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Marketing Brief
                    </label>
                    <textarea
                      id="edit-brief"
                      rows={3}
                      value={project.marketingBrief || ""}
                      onChange={(e) =>
                        onChange("marketingBrief", e.target.value)
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div className="col-span-2">
                    <label
                      htmlFor="edit-audience"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Target Audience
                    </label>
                    <input
                      type="text"
                      id="edit-audience"
                      value={project.targetAudience || ""}
                      onChange={(e) =>
                        onChange("targetAudience", e.target.value)
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default EditProjectModal;
