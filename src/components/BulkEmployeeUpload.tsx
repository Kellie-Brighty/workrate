import React, { useState, useRef } from "react";
import { bulkCreateEmployees } from "../services/firebase";
import {
  parseCSV,
  validateEmployeeData,
  getEmployeeCSVTemplate,
} from "../utils/csvUtils";
import { useAuth } from "../contexts/AuthContext";
import {
  useErrorNotification,
  useSuccessNotification,
} from "../contexts/NotificationContext";

// Define EmployeeData interface locally
interface EmployeeData {
  name: string;
  email: string;
  position: string;
  department: string;
  status?: "active" | "inactive";
  joinDate?: string;
  avatar?: string;
  employerId?: string;
  tempPassword?: string;
  accountCreated?: boolean;
}

interface BulkEmployeeUploadProps {
  onUploadComplete: (employees: EmployeeData[]) => void;
  onCancel: () => void;
}

const BulkEmployeeUpload: React.FC<BulkEmployeeUploadProps> = ({
  onUploadComplete,
  onCancel,
}) => {
  const { userData } = useAuth();
  const showError = useErrorNotification();
  const showSuccess = useSuccessNotification();

  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<Record<string, string>[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = () => {
    const templateContent = getEmployeeCSVTemplate();
    const blob = new Blob([templateContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "employee_template.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setValidationErrors([]);

    // Read and validate the file
    const reader = new FileReader();
    reader.onload = (event) => {
      const csvText = event.target?.result as string;
      try {
        const data = parseCSV(csvText);
        setParsedData(data);

        // Validate the data
        const errors = validateEmployeeData(data);
        setValidationErrors(errors);
      } catch (error) {
        console.error("Error parsing CSV:", error);
        setValidationErrors([
          "Invalid CSV format. Please check your file and try again.",
        ]);
      }
    };
    reader.readAsText(selectedFile);
  };

  const handleUpload = async () => {
    if (!userData?.id) {
      showError(
        "Error",
        "User information not available. Please try again later."
      );
      return;
    }

    if (validationErrors.length > 0) {
      showError(
        "Validation Error",
        "Please fix the validation errors before uploading."
      );
      return;
    }

    if (parsedData.length === 0) {
      showError(
        "No Data",
        "No data to upload. Please select a valid CSV file."
      );
      return;
    }

    setIsUploading(true);
    try {
      // Convert parsed data to employee data format
      const employeesData: EmployeeData[] = parsedData.map((item) => ({
        name: item.name,
        email: item.email,
        position: item.position,
        department: item.department,
      }));

      // Upload to Firebase
      const createdEmployees = await bulkCreateEmployees(
        employeesData,
        userData.id
      );

      showSuccess(
        "Success",
        `Successfully added ${createdEmployees.length} employees.`
      );
      onUploadComplete(createdEmployees as EmployeeData[]);
    } catch (error) {
      console.error("Error uploading employees:", error);
      showError(
        "Upload Failed",
        "Failed to upload employees. Please try again."
      );
    } finally {
      setIsUploading(false);
    }
  };

  // const resetForm = () => {
  //   setFile(null);
  //   setParsedData([]);
  //   setValidationErrors([]);
  //   if (fileInputRef.current) {
  //     fileInputRef.current.value = "";
  //   }
  // };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">
          Bulk Upload Employees
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Upload a CSV file containing employee information.
        </p>
      </div>

      <div className="flex items-center space-x-2">
        <button
          type="button"
          onClick={downloadTemplate}
          className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 border border-transparent rounded-md hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          Download Template
        </button>
        <p className="text-sm text-gray-500">
          Use our template to ensure your data is formatted correctly.
        </p>
      </div>

      <div className="border-2 border-dashed border-gray-300 rounded-md p-6">
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
            aria-hidden="true"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="mt-2">
            <label
              htmlFor="file-upload"
              className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
            >
              <span>{file ? file.name : "Select a CSV file"}</span>
              <input
                id="file-upload"
                name="file-upload"
                type="file"
                accept=".csv"
                className="sr-only"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
            </label>
          </div>
          <p className="mt-1 text-xs text-gray-500">CSV up to 10MB</p>
        </div>
      </div>

      {/* Preview and validation */}
      {parsedData.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-900">Preview</h4>
          <div className="mt-2 max-h-60 overflow-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {Object.keys(parsedData[0]).map((header) => (
                    <th
                      key={header}
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {parsedData.slice(0, 5).map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {Object.values(row).map((value, valueIndex) => (
                      <td
                        key={valueIndex}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                      >
                        {value}
                      </td>
                    ))}
                  </tr>
                ))}
                {parsedData.length > 5 && (
                  <tr>
                    <td
                      colSpan={Object.keys(parsedData[0]).length}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center"
                    >
                      ... and {parsedData.length - 5} more rows
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Validation errors */}
      {validationErrors.length > 0 && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Please fix the following errors:
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <ul className="list-disc pl-5 space-y-1 max-h-40 overflow-auto">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          disabled={isUploading}
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={
            isUploading ||
            validationErrors.length > 0 ||
            parsedData.length === 0
          }
          onClick={handleUpload}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed"
        >
          {isUploading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block"
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
              Uploading...
            </>
          ) : (
            "Upload Employees"
          )}
        </button>
      </div>
    </div>
  );
};

export default BulkEmployeeUpload;
