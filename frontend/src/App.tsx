import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';

// Contexts
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import type { UserRole } from './context/AuthContext';

// i18n
import './i18n/config';

// Components
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { ChatWidget } from './components/ChatWidget';

// Pages
import { LandingPage } from './pages/LandingPage';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';

// Department Pages
import { DepartmentDashboard } from './pages/DepartmentDashboard';
import { SchoolsPage } from './pages/SchoolsPage';
import { LearningGapsHub } from './pages/LearningGapsHub';
import { EarlyWarnings } from './pages/EarlyWarnings';
import { InterventionsBoard } from './pages/InterventionsBoard';
import { ReportsPage } from './pages/ReportsPage';

// Student Pages
import { StudentDashboard } from './pages/StudentDashboard';
import { MockQuizArena } from './pages/MockQuizArena';
import { MyNotes } from './pages/MyNotes';
import { EducationalVideos } from './pages/EducationalVideos';
import { ExamCalendar } from './pages/ExamCalendar';

// Admin / Teacher Legacy Pages
import { AdminDashboard } from './pages/AdminDashboard';
import { TeacherDashboard } from './pages/TeacherDashboard';
import { StudentsPage } from './pages/StudentsPage';
import { LogsSection } from './pages/LogsSection';
import { VideoSection } from './pages/VideoSection';

// Super Admin Subpages
import { AdminTeachers } from './pages/AdminTeachers';
import { AdminQuizAnalytics } from './pages/AdminQuizAnalytics';
import { AdminUserManagement } from './pages/AdminUserManagement';
import { AdminPendingApprovals } from './pages/AdminPendingApprovals';

// Layout wrapper for dashboard pages (with Navbar, Sidebar, and ChatWidget)
const PortalLayout: React.FC = () => {
  const { activeRole } = useAuth();
  
  // Student Portal uses navbar links; other portals use Sidebar + Navbar
  const isStudent = activeRole === 'STUDENT' || activeRole === 'GUARDIAN';

  return (
    <div className="min-h-screen flex flex-col bg-[#05050f] text-white transition-colors duration-300">
      
      {/* Top Navbar */}
      <Navbar />

      {/* Main Content Wrap */}
      <div className="flex flex-1 relative min-h-0">
        
        {/* Left Sidebar (hidden/null for students internally) */}
        {!isStudent && <Sidebar isOpen={true} />}

        {/* Main Dashboard Panel */}
        <main className="flex-1 flex flex-col min-w-0 h-[calc(100vh-64px)] overflow-hidden">
          <Outlet />
        </main>

      </div>

      {/* Floating Bilingual Chatbot */}
      <ChatWidget />
    </div>
  );
};

import { ResetPassword } from './pages/ResetPassword';
import { DataManagement } from './pages/DataManagement';

// Route protector for authorized pages with role checks
interface RoleRouteProps {
  children: React.ReactElement;
  allowedRoles: UserRole[];
}

const RoleRoute: React.FC<RoleRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, activeRole } = useAuth();
  
  if (!isAuthenticated || !activeRole) {
    return <Navigate to="/login" replace />;
  }
  
  if (!allowedRoles.includes(activeRole)) {
    return <Navigate to={`/login?error=${encodeURIComponent('Access denied for this role.')}`} replace />;
  }
  
  return children;
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/forgot" element={<Navigate to="/forgot-password" replace />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Protected Department Officer Routes */}
              <Route path="/department" element={<RoleRoute allowedRoles={['DEPARTMENT']}><PortalLayout /></RoleRoute>}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<DepartmentDashboard />} />
                <Route path="schools" element={<SchoolsPage />} />
                <Route path="analytics" element={<LearningGapsHub />} />
                <Route path="early-warnings" element={<EarlyWarnings />} />
                <Route path="interventions" element={<InterventionsBoard />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="data-management" element={<DataManagement />} />
              </Route>

              {/* Protected Student Portal Routes */}
              <Route path="/student" element={<RoleRoute allowedRoles={['STUDENT', 'GUARDIAN']}><PortalLayout /></RoleRoute>}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<StudentDashboard />} />
                <Route path="quiz" element={<MockQuizArena />} />
                <Route path="notes" element={<MyNotes />} />
                <Route path="videos" element={<EducationalVideos />} />
                <Route path="calendar" element={<ExamCalendar />} />
              </Route>

              {/* Protected Admin Routes */}
              <Route path="/admin" element={<RoleRoute allowedRoles={['ADMIN']}><PortalLayout /></RoleRoute>}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />

                {/* Department module inside Admin */}
                <Route path="department-dashboard" element={<DepartmentDashboard />} />
                <Route path="department-schools" element={<SchoolsPage />} />
                <Route path="department-analytics" element={<LearningGapsHub />} />
                <Route path="department-early-warnings" element={<EarlyWarnings />} />
                <Route path="department-interventions" element={<InterventionsBoard />} />
                <Route path="department-reports" element={<ReportsPage />} />
                <Route path="department-data-management" element={<DataManagement />} />

                {/* Teachers module inside Admin */}
                <Route path="teachers" element={<AdminTeachers />} />
                <Route path="teachers-activity" element={<LogsSection />} />
                <Route path="teachers-uploads" element={<VideoSection />} />
                <Route path="teachers-classes" element={<AdminTeachers />} />

                {/* Students module inside Admin */}
                <Route path="students" element={<StudentsPage />} />
                <Route path="students-performance" element={<StudentsPage />} />
                <Route path="students-quiz" element={<AdminQuizAnalytics />} />

                {/* System Management inside Admin */}
                <Route path="system-users" element={<AdminUserManagement />} />
                <Route path="system-approvals" element={<AdminPendingApprovals />} />
                <Route path="system-logs" element={<LogsSection />} />
                <Route path="system-settings" element={<DataManagement />} />

                {/* Legacy compatibility routes */}
                <Route path="logs" element={<LogsSection />} />
                <Route path="videos" element={<VideoSection />} />
              </Route>

              {/* Protected Teacher Routes */}
              <Route path="/teacher" element={<RoleRoute allowedRoles={['TEACHER']}><PortalLayout /></RoleRoute>}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<TeacherDashboard />} />
                <Route path="students" element={<StudentsPage />} />
                <Route path="logs" element={<LogsSection />} />
                <Route path="videos" element={<VideoSection />} />
              </Route>

              {/* Fallback Catch-All */}
              <Route path="*" element={<Navigate to="/" replace />} />

            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;
