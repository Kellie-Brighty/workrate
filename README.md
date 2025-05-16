# Workrate

A modern employee and project management system built with React, Vite, TypeScript, and TailwindCSS.

## Features

- **Employee Management**: Track and manage employee profiles, roles, and performance
- **Project Management**: Create, assign, and monitor projects with detailed progress tracking
- **Task Automation**: AI-powered task breakdown and assignment based on employee skills
- **Performance Analytics**: Monitor employee performance with comprehensive dashboards
- **Reward System**: Recognize top performers and provide incentives

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm (v9 or later)

### Installation

1. Clone the repository:

   ```
   git clone https://github.com/yourusername/workrate.git
   cd workrate
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Start the development server:

   ```
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) to view the application in your browser.

## Project Structure

```
workrate/
  ├── public/             # Static files
  ├── src/                # Source code
  │   ├── components/     # Reusable UI components
  │   ├── contexts/       # React contexts for state management
  │   ├── hooks/          # Custom React hooks
  │   ├── pages/          # Page components
  │   │   ├── auth/       # Authentication pages
  │   │   ├── employer/   # Employer-specific pages
  │   │   └── employee/   # Employee-specific pages
  │   ├── services/       # API and service functions
  │   ├── types/          # TypeScript type definitions
  │   ├── utils/          # Utility functions
  │   ├── App.tsx         # Main application component
  │   ├── index.css       # Global styles
  │   └── main.tsx        # Application entry point
  ├── tailwind.config.js  # Tailwind CSS configuration
  ├── tsconfig.json       # TypeScript configuration
  ├── vite.config.ts      # Vite configuration
  └── README.md           # Project documentation
```

## Technologies Used

- **Frontend**:
  - React.js
  - TypeScript
  - TailwindCSS
  - Vite

## Demo URLs

- Landing Page: [http://localhost:5173/](http://localhost:5173/)
- Login Page: [http://localhost:5173/login](http://localhost:5173/login)
- Signup Page: [http://localhost:5173/signup](http://localhost:5173/signup)
- Employer Dashboard: [http://localhost:5173/employer/dashboard](http://localhost:5173/employer/dashboard)
- Employee Dashboard: [http://localhost:5173/employee/dashboard](http://localhost:5173/employee/dashboard)

## Future Enhancements

- **Mobile Application**: Native mobile apps for on-the-go management
- **Integration Capabilities**: API integrations with tools like Slack, Jira, etc.
- **Advanced Analytics**: Predictive analytics for project planning and resource allocation
- **Customizable Workflows**: Allow employers to customize project workflows

## License

This project is licensed under the MIT License - see the LICENSE file for details.
