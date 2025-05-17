import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/auth/Login";
import SignUp from "./pages/auth/SignUp";
import EmployerDashboard from "./pages/employer/Dashboard";
import EmployeeDashboard from "./pages/employee/Dashboard";
import CreateProject from "./pages/employer/CreateProject";
import Projects from "./pages/employer/Projects";
import ProjectDetail from "./pages/employer/ProjectDetail";
import Tasks from "./pages/employer/Tasks";
import TaskDetail from "./pages/employer/TaskDetail";
import TimeTracking from "./pages/employee/TimeTracking";
import TimeApprovals from "./pages/employer/TimeApprovals";
import Analytics from "./pages/employer/Analytics";
import EmployerRewards from "./pages/employer/Rewards";
import EmployeeRewards from "./pages/employee/Rewards";
import Employees from "./pages/employer/Employees";
import Settings from "./pages/employer/Settings";
import EmployeeProjects from "./pages/employee/Projects";
import EmployeeTasks from "./pages/employee/Tasks";
import EmployeePerformance from "./pages/employee/Performance";
import EmployeeProfile from "./pages/employee/Profile";
import Layout from "./components/layout/Layout";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Employer routes - wrapped in Layout */}
        <Route
          path="/employer/dashboard"
          element={
            <Layout userType="employer">
              <EmployerDashboard />
            </Layout>
          }
        />

        <Route
          path="/employer/create-project"
          element={
            <Layout userType="employer">
              <CreateProject />
            </Layout>
          }
        />

        <Route
          path="/employer/projects"
          element={
            <Layout userType="employer">
              <Projects />
            </Layout>
          }
        />

        <Route
          path="/employer/projects/:projectId"
          element={
            <Layout userType="employer">
              <ProjectDetail />
            </Layout>
          }
        />

        <Route
          path="/employer/tasks"
          element={
            <Layout userType="employer">
              <Tasks />
            </Layout>
          }
        />

        <Route
          path="/employer/tasks/:taskId"
          element={
            <Layout userType="employer">
              <TaskDetail />
            </Layout>
          }
        />

        <Route
          path="/employer/timeapprovals"
          element={
            <Layout userType="employer">
              <TimeApprovals />
            </Layout>
          }
        />

        <Route
          path="/employer/analytics"
          element={
            <Layout userType="employer">
              <Analytics />
            </Layout>
          }
        />

        <Route
          path="/employer/rewards"
          element={
            <Layout userType="employer">
              <EmployerRewards />
            </Layout>
          }
        />

        <Route
          path="/employer/employees"
          element={
            <Layout userType="employer">
              <Employees />
            </Layout>
          }
        />

        <Route
          path="/employer/settings"
          element={
            <Layout userType="employer">
              <Settings />
            </Layout>
          }
        />

        {/* Employee routes - wrapped in Layout */}
        <Route
          path="/employee/dashboard"
          element={
            <Layout userType="employee">
              <EmployeeDashboard />
            </Layout>
          }
        />

        <Route
          path="/employee/timetracking"
          element={
            <Layout userType="employee">
              <TimeTracking />
            </Layout>
          }
        />

        <Route
          path="/employee/rewards"
          element={
            <Layout userType="employee">
              <EmployeeRewards />
            </Layout>
          }
        />

        <Route
          path="/employee/tasks"
          element={
            <Layout userType="employee">
              <EmployeeTasks />
            </Layout>
          }
        />

        <Route
          path="/employee/projects"
          element={
            <Layout userType="employee">
              <EmployeeProjects />
            </Layout>
          }
        />

        <Route
          path="/employee/performance"
          element={
            <Layout userType="employee">
              <EmployeePerformance />
            </Layout>
          }
        />

        <Route
          path="/employee/profile"
          element={
            <Layout userType="employee">
              <EmployeeProfile />
            </Layout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
