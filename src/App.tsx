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
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Employer routes - wrapped in Layout and ProtectedRoute */}
        <Route
          path="/employer/dashboard"
          element={
            <ProtectedRoute requiredRole="employer">
              <Layout userType="employer">
                <EmployerDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/employer/create-project"
          element={
            <ProtectedRoute requiredRole="employer">
              <Layout userType="employer">
                <CreateProject />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/employer/projects"
          element={
            <ProtectedRoute requiredRole="employer">
              <Layout userType="employer">
                <Projects />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/employer/projects/:projectId"
          element={
            <ProtectedRoute requiredRole="employer">
              <Layout userType="employer">
                <ProjectDetail />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/employer/tasks"
          element={
            <ProtectedRoute requiredRole="employer">
              <Layout userType="employer">
                <Tasks />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/employer/tasks/:taskId"
          element={
            <ProtectedRoute requiredRole="employer">
              <Layout userType="employer">
                <TaskDetail />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/employer/timeapprovals"
          element={
            <ProtectedRoute requiredRole="employer">
              <Layout userType="employer">
                <TimeApprovals />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/employer/analytics"
          element={
            <ProtectedRoute requiredRole="employer">
              <Layout userType="employer">
                <Analytics />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/employer/rewards"
          element={
            <ProtectedRoute requiredRole="employer">
              <Layout userType="employer">
                <EmployerRewards />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/employer/employees"
          element={
            <ProtectedRoute requiredRole="employer">
              <Layout userType="employer">
                <Employees />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/employer/settings"
          element={
            <ProtectedRoute requiredRole="employer">
              <Layout userType="employer">
                <Settings />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Employee routes - wrapped in Layout and ProtectedRoute */}
        <Route
          path="/employee/dashboard"
          element={
            <ProtectedRoute requiredRole="employee">
              <Layout userType="employee">
                <EmployeeDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/employee/timetracking"
          element={
            <ProtectedRoute requiredRole="employee">
              <Layout userType="employee">
                <TimeTracking />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/employee/rewards"
          element={
            <ProtectedRoute requiredRole="employee">
              <Layout userType="employee">
                <EmployeeRewards />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/employee/tasks"
          element={
            <ProtectedRoute requiredRole="employee">
              <Layout userType="employee">
                <EmployeeTasks />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/employee/projects"
          element={
            <ProtectedRoute requiredRole="employee">
              <Layout userType="employee">
                <EmployeeProjects />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/employee/performance"
          element={
            <ProtectedRoute requiredRole="employee">
              <Layout userType="employee">
                <EmployeePerformance />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/employee/profile"
          element={
            <ProtectedRoute requiredRole="employee">
              <Layout userType="employee">
                <EmployeeProfile />
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
