import React from "react";
import Modal from "./Modal";

interface RemoveMemberModalProps {
  isOpen: boolean;
  memberToRemove: any;
  onClose: () => void;
  onConfirm: (memberId: string) => void;
  isLoading?: boolean;
}

const RemoveMemberModal: React.FC<RemoveMemberModalProps> = ({
  isOpen,
  memberToRemove,
  onClose,
  onConfirm,
  isLoading = false,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Remove Team Member"
      size="small"
      actions={
        <>
          <button
            className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            className="ml-3 px-4 py-2 bg-red-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => {
              if (memberToRemove && !isLoading) {
                onConfirm(memberToRemove.id);
              }
            }}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                Removing...
              </span>
            ) : (
              "Remove"
            )}
          </button>
        </>
      }
    >
      <div className="py-4">
        <p className="text-sm text-gray-500">
          Are you sure you want to remove{" "}
          {memberToRemove?.name || "this member"} from the project? This will
          revoke their access to this project and reassign any tasks.
        </p>
      </div>
    </Modal>
  );
};

export default RemoveMemberModal;
