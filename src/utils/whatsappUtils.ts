/**
 * Generates a WhatsApp deep link URL that will open WhatsApp with a pre-filled message
 *
 * @param phoneNumber - The phone number to send to (include country code without +)
 * @param message - The message to pre-fill
 * @returns WhatsApp deep link URL
 */
export const generateWhatsAppLink = (
  phoneNumber: string,
  message: string
): string => {
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
};

/**
 * Generates a message for team member added to project notification
 *
 * @param projectName - Name of the project
 * @param appUrl - URL to the application
 * @returns Formatted message
 */
export const generateProjectAddedMessage = (
  projectName: string,
  appUrl: string
): string => {
  return `You have been added to the project "${projectName}". Visit ${appUrl} to view details and start collaborating.`;
};

/**
 * Generates a message for team member assigned to task notification
 *
 * @param taskTitle - Title of the task
 * @param projectName - Name of the project
 * @param dueDate - Due date for the task
 * @param appUrl - URL to the application
 * @returns Formatted message
 */
export const generateTaskAssignedMessage = (
  taskTitle: string,
  projectName: string,
  dueDate: string,
  appUrl: string
): string => {
  return `You have been assigned a new task "${taskTitle}" in project "${projectName}". Due date: ${dueDate}. Visit ${appUrl} to view details.`;
};

/**
 * Generates a message for new team member added to company notification
 *
 * @param companyName - Name of the company
 * @param appUrl - URL to the application
 * @returns Formatted message
 */
export const generateCompanyAddedMessage = (
  companyName: string,
  appUrl: string
): string => {
  return `Welcome to ${companyName}! You have been added as a team member. Visit ${appUrl} to complete your profile and get started.`;
};
