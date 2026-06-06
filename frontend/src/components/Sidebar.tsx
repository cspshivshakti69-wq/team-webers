import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Building2,
  LineChart,
  AlertTriangle,
  ClipboardList,
  FileSpreadsheet,
  Users,
  Video,
  Settings,
  Shield
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = true }) => {
  const { activeRole, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isStudentPortal = activeRole === 'STUDENT' || activeRole === 'GUARDIAN' || location.pathname.startsWith('/student');

  if (isStudentPortal) {
    return null;
  }

  const activeClass = "flex items-center space-x-3 px-4 py-2 rounded-xl text-cyan-400 bg-cyan-950/20 border border-cyan-500/25 font-semibold text-xs transition-all duration-200 w-full text-left";
  const inactiveClass = "flex items-center space-x-3 px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 border border-transparent text-xs font-semibold transition-all duration-200 w-full text-left cursor-pointer";

  // ==========================================
  // DEPARTMENT OFFICER SIDEBAR
  // ==========================================
  const renderDepartmentLinks = () => {
    return (
      <div className="space-y-1 font-sans">
        <button
          onClick={() => navigate('/department/dashboard')}
          className={location.pathname === '/department/dashboard' ? activeClass : inactiveClass}
        >
          <LayoutDashboard className="h-3.5 w-3.5" />
          <span>Dashboard</span>
        </button>
        <button
          onClick={() => navigate('/department/schools')}
          className={location.pathname === '/department/schools' ? activeClass : inactiveClass}
        >
          <Building2 className="h-3.5 w-3.5" />
          <span>Schools</span>
        </button>
        <button
          onClick={() => navigate('/department/analytics')}
          className={location.pathname === '/department/analytics' ? activeClass : inactiveClass}
        >
          <LineChart className="h-3.5 w-3.5" />
          <span>Analytics</span>
        </button>
        <button
          onClick={() => navigate('/department/early-warnings')}
          className={location.pathname === '/department/early-warnings' ? activeClass : inactiveClass}
        >
          <AlertTriangle className="h-3.5 w-3.5" />
          <span>Early Warnings</span>
        </button>
        <button
          onClick={() => navigate('/department/interventions')}
          className={location.pathname === '/department/interventions' ? activeClass : inactiveClass}
        >
          <ClipboardList className="h-3.5 w-3.5" />
          <span>Interventions</span>
        </button>
        <button
          onClick={() => navigate('/department/reports')}
          className={location.pathname === '/department/reports' ? activeClass : inactiveClass}
        >
          <FileSpreadsheet className="h-3.5 w-3.5" />
          <span>Reports</span>
        </button>
        <button
          onClick={() => navigate('/department/data-management')}
          className={location.pathname === '/department/data-management' ? activeClass : inactiveClass}
        >
          <Settings className="h-3.5 w-3.5 text-cyan-400 animate-spin-slow" />
          <span>⚙️ Data Management</span>
        </button>
      </div>
    );
  };

  // ==========================================
  // ADMIN SIDEBAR (Unified Cross-Role Admin)
  // ==========================================
  const renderAdminLinks = () => {
    return (
      <div className="space-y-4 font-sans text-xs">
        
        {/* Core Overview */}
        <div>
          <div className="px-4 text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 flex items-center space-x-1">
            <Shield className="h-2.5 w-2.5 text-purple-400" />
            <span>👑 Admin Panel</span>
          </div>
          <button
            onClick={() => navigate('/admin/dashboard')}
            className={location.pathname === '/admin/dashboard' ? activeClass : inactiveClass}
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            <span>Overview</span>
          </button>
        </div>

        {/* Department Module */}
        <div>
          <div className="px-4 text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
            📊 Department
          </div>
          <div className="space-y-1 pl-2 border-l border-white/5 ml-4">
            <button
              onClick={() => navigate('/admin/department-dashboard')}
              className={location.pathname === '/admin/department-dashboard' ? activeClass : inactiveClass}
            >
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => navigate('/admin/department-schools')}
              className={location.pathname === '/admin/department-schools' ? activeClass : inactiveClass}
            >
              <span>All Schools</span>
            </button>
            <button
              onClick={() => navigate('/admin/department-analytics')}
              className={location.pathname === '/admin/department-analytics' ? activeClass : inactiveClass}
            >
              <span>Analytics Hub</span>
            </button>
            <button
              onClick={() => navigate('/admin/department-early-warnings')}
              className={location.pathname === '/admin/department-early-warnings' ? activeClass : inactiveClass}
            >
              <span>Early Warnings</span>
            </button>
            <button
              onClick={() => navigate('/admin/department-interventions')}
              className={location.pathname === '/admin/department-interventions' ? activeClass : inactiveClass}
            >
              <span>Interventions</span>
            </button>
            <button
              onClick={() => navigate('/admin/department-reports')}
              className={location.pathname === '/admin/department-reports' ? activeClass : inactiveClass}
            >
              <span>Reports & Export</span>
            </button>
            <button
              onClick={() => navigate('/admin/department-data-management')}
              className={location.pathname === '/admin/department-data-management' ? activeClass : inactiveClass}
            >
              <span>Data Management</span>
            </button>
          </div>
        </div>

        {/* Teachers Module */}
        <div>
          <div className="px-4 text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
            👨‍🏫 Teachers
          </div>
          <div className="space-y-1 pl-2 border-l border-white/5 ml-4">
            <button
              onClick={() => navigate('/admin/teachers')}
              className={location.pathname === '/admin/teachers' ? activeClass : inactiveClass}
            >
              <span>All Teachers</span>
            </button>
            <button
              onClick={() => navigate('/admin/teachers-activity')}
              className={location.pathname === '/admin/teachers-activity' ? activeClass : inactiveClass}
            >
              <span>Teacher Activity</span>
            </button>
            <button
              onClick={() => navigate('/admin/teachers-uploads')}
              className={location.pathname === '/admin/teachers-uploads' ? activeClass : inactiveClass}
            >
              <span>Content Uploads</span>
            </button>
            <button
              onClick={() => navigate('/admin/teachers-classes')}
              className={location.pathname === '/admin/teachers-classes' ? activeClass : inactiveClass}
            >
              <span>Class Management</span>
            </button>
          </div>
        </div>

        {/* Students Module */}
        <div>
          <div className="px-4 text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
            👨‍🎓 Students
          </div>
          <div className="space-y-1 pl-2 border-l border-white/5 ml-4">
            <button
              onClick={() => navigate('/admin/students')}
              className={location.pathname === '/admin/students' ? activeClass : inactiveClass}
            >
              <span>All Students</span>
            </button>
            <button
              onClick={() => navigate('/admin/students-performance')}
              className={location.pathname === '/admin/students-performance' ? activeClass : inactiveClass}
            >
              <span>Student Performance</span>
            </button>
            <button
              onClick={() => navigate('/admin/students-quiz')}
              className={location.pathname === '/admin/students-quiz' ? activeClass : inactiveClass}
            >
              <span>Quiz Analytics</span>
            </button>
          </div>
        </div>

        {/* System Management */}
        <div>
          <div className="px-4 text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
            ⚙️ System
          </div>
          <div className="space-y-1 pl-2 border-l border-white/5 ml-4">
            <button
              onClick={() => navigate('/admin/system-users')}
              className={location.pathname === '/admin/system-users' ? activeClass : inactiveClass}
            >
              <span>User Management</span>
            </button>
            <button
              onClick={() => navigate('/admin/system-approvals')}
              className={location.pathname === '/admin/system-approvals' ? activeClass : inactiveClass}
            >
              <span>Pending Approvals</span>
            </button>
            <button
              onClick={() => navigate('/admin/system-logs')}
              className={location.pathname === '/admin/system-logs' ? activeClass : inactiveClass}
            >
              <span>Audit Logs</span>
            </button>
            <button
              onClick={() => navigate('/admin/system-settings')}
              className={location.pathname === '/admin/system-settings' ? activeClass : inactiveClass}
            >
              <span>System Settings</span>
            </button>
          </div>
        </div>

      </div>
    );
  };

  // ==========================================
  // TEACHER SIDEBAR
  // ==========================================
  const renderTeacherLinks = () => {
    return (
      <div className="space-y-1.5 font-sans">
        <button
          onClick={() => navigate('/teacher/dashboard')}
          className={location.pathname === '/teacher/dashboard' ? activeClass : inactiveClass}
        >
          <LayoutDashboard className="h-4 w-4" />
          <span>Dashboard</span>
        </button>
        <button
          onClick={() => navigate('/teacher/students')}
          className={location.pathname === '/teacher/students' ? activeClass : inactiveClass}
        >
          <Users className="h-4 w-4" />
          <span>Students</span>
        </button>
        <button
          onClick={() => navigate('/teacher/logs')}
          className={location.pathname === '/teacher/logs' ? activeClass : inactiveClass}
        >
          <ClipboardList className="h-4 w-4" />
          <span>Activity Log</span>
        </button>
        <button
          onClick={() => navigate('/teacher/videos')}
          className={location.pathname === '/teacher/videos' ? activeClass : inactiveClass}
        >
          <Video className="h-4 w-4" />
          <span>Videos</span>
        </button>
      </div>
    );
  };

  return (
    <aside
      className={`${
        isOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full lg:w-64 lg:translate-x-0'
      } fixed lg:static inset-y-0 left-0 z-35 flex-shrink-0 bg-[#05050f] border-r border-white/5 transition-all duration-300 overflow-y-auto px-4 py-6 h-[calc(100vh-64px)]`}
    >
      <div className="flex flex-col h-full justify-between">
        <div className="space-y-5">
          
          {/* User Card */}
          <div className="px-4 py-4 rounded-2xl bg-[#0d0d1f] border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl"></div>
            
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20 mb-3 uppercase">
              {activeRole || 'DEPARTMENT'}
            </span>
            
            <div className="flex items-center space-x-3">
              <div className="h-9 w-9 rounded-full bg-cyan-950/80 border border-cyan-500/20 flex items-center justify-center font-bold text-cyan-400">
                {user?.name ? user.name.charAt(0) : 'D'}
              </div>
              <div className="truncate">
                <div className="text-xs font-bold text-white truncate leading-tight">
                  {user?.name || 'Dr. Ramesh Rao'}
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5 font-sans">
                  {activeRole === 'DEPARTMENT' ? 'DEPARTMENT' : 'GHS Bengaluru'}
                </div>
              </div>
            </div>
          </div>

          {/* Nav Links */}
          {activeRole === 'DEPARTMENT' && renderDepartmentLinks()}
          {activeRole === 'ADMIN' && renderAdminLinks()}
          {activeRole === 'TEACHER' && renderTeacherLinks()}

        </div>

        {/* Footer */}
        <div className="px-4 pt-4 border-t border-white/5 text-[9px] text-slate-500 font-mono">
          ಕನ್ನಡ ಸೇವಾ © 2026
        </div>
      </div>
    </aside>
  );
};
