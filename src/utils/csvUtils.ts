/**
 * Parses CSV data into an array of objects
 * @param csvText - Text content of the CSV file
 * @param headers - Optional custom headers to use instead of the first line
 * @returns Array of objects with keys from headers and values from each row
 */
export const parseCSV = (
  csvText: string,
  headers?: string[]
): Record<string, string>[] => {
  // Split the text into rows
  const rows = csvText.split(/\r?\n/).filter((row) => row.trim() !== "");

  if (rows.length === 0) {
    return [];
  }

  // If no headers provided, use the first row as headers
  const csvHeaders =
    headers || rows[0].split(",").map((header) => header.trim());

  // Process data rows (skip first row if using headers from CSV)
  const dataRows = headers ? rows : rows.slice(1);

  return dataRows.map((row) => {
    const values = row.split(",").map((value) => value.trim());
    const rowData: Record<string, string> = {};

    // Map each value to its corresponding header
    csvHeaders.forEach((header, index) => {
      rowData[header] = values[index] || "";
    });

    return rowData;
  });
};

/**
 * Validates employee data from CSV
 * @param employeeData - Array of employee data objects
 * @returns Array of validation errors, empty if all data is valid
 */
export const validateEmployeeData = (
  employeeData: Record<string, string>[]
): string[] => {
  const errors: string[] = [];
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const emailSet = new Set<string>();

  employeeData.forEach((employee, index) => {
    const rowNum = index + 1;

    // Check required fields
    if (!employee.name || employee.name.trim() === "") {
      errors.push(`Row ${rowNum}: Name is required`);
    }

    if (!employee.email || employee.email.trim() === "") {
      errors.push(`Row ${rowNum}: Email is required`);
    } else if (!emailRegex.test(employee.email)) {
      errors.push(`Row ${rowNum}: Invalid email format`);
    } else if (emailSet.has(employee.email)) {
      errors.push(`Row ${rowNum}: Duplicate email '${employee.email}'`);
    } else {
      emailSet.add(employee.email);
    }

    if (!employee.position || employee.position.trim() === "") {
      errors.push(`Row ${rowNum}: Position is required`);
    }

    if (!employee.department || employee.department.trim() === "") {
      errors.push(`Row ${rowNum}: Department is required`);
    }
  });

  return errors;
};

/**
 * Generates a sample CSV template for employee uploads
 * @returns String containing CSV headers and a sample row
 */
export const getEmployeeCSVTemplate = (): string => {
  const headers = ["name", "email", "position", "department"];
  const sampleData = [
    "John Doe",
    "john.doe@example.com",
    "Developer",
    "Engineering",
  ];

  return headers.join(",") + "\n" + sampleData.join(",");
};
