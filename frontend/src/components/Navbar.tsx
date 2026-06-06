import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  Sun, 
  Moon, 
  Languages, 
  GraduationCap, 
  LogOut, 
  Bell, 
  Shuffle, 
  Calendar, 
  BookOpen, 
  Video, 
  HelpCircle,
  LayoutDashboard
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { activeRole, logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, changeLanguage } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [isSwitchModalOpen, setIsSwitchModalOpen] = useState(false);

  const handleLanguageToggle = () => {
    changeLanguage(language === 'en' ? 'kn' : 'en');
  };

  const handleSignOut = () => {
    logout();
    navigate('/');
  };

  const handleSwitchRoleClick = () => {
    setIsSwitchModalOpen(true);
  };

  const confirmSwitchRole = () => {
    logout();
    setIsSwitchModalOpen(false);
    navigate('/login?switch=true');
  };

  const isStudentPortal = activeRole === 'STUDENT' || activeRole === 'GUARDIAN' || location.pathname.startsWith('/student');
  const isDepartmentPortal = activeRole === 'DEPARTMENT' || location.pathname.startsWith('/department');

  // Format display name for current role in the modal
  const getRoleDisplayName = () => {
    if (activeRole === 'ADMIN') return 'School Administrator';
    if (activeRole === 'TEACHER') return 'Teacher / NGO Analyst';
    if (activeRole === 'DEPARTMENT') return 'Department Officer';
    if (activeRole === 'STUDENT') return 'Student';
    if (activeRole === 'GUARDIAN') return 'Guardian';
    return activeRole || 'Guest';
  };

  const renderSwitchRoleModal = () => {
    if (!isSwitchModalOpen) return null;
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#0d0d1f] border border-white/10 rounded-2xl shadow-2xl p-6 font-sans text-white">
          <h3 className="text-lg font-bold tracking-tight text-white flex items-center space-x-2">
            <Shuffle className="h-5 w-5 text-cyan-400" />
            <span>Switch Role?</span>
          </h3>
          <p className="text-sm text-slate-300 mt-4 leading-relaxed">
            You are currently logged in as <strong className="text-white font-semibold">{getRoleDisplayName()}</strong>.
          </p>
          <p className="text-xs text-slate-400 mt-2">
            To switch to a different role, you must sign out and log in with different credentials.
          </p>
          <div className="flex space-x-3 mt-6 justify-end">
            <button
              onClick={() => setIsSwitchModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={confirmSwitchRole}
              className="px-4 py-2 rounded-xl text-xs font-semibold btn-gradient shadow-md shadow-cyan-500/15 cursor-pointer text-white"
            >
              Sign Out & Switch →
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ==========================================
  // RENDER STUDENT PORTAL NAVBAR
  // ==========================================
  if (isStudentPortal) {
    return (
      <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-[#05050f]/90 backdrop-blur-md text-white">
        <div className="flex h-16 items-center justify-between px-6">
          
          {/* Left: Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/student/dashboard')}>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-600 shadow-md shadow-purple-500/20">
              <GraduationCap className="h-5.5 w-5.5 text-white" />
            </div>
            <div>
              <h1 className="text-md font-bold tracking-tight m-0 p-0 leading-none">
                <span className="text-purple-400">Student Portal</span>
                <span className="text-slate-400 font-normal text-xs ml-2 border-l border-white/10 pl-2">
                  Kannada Seva
                </span>
              </h1>
            </div>
          </div>

          {/* Center: Nav links */}
          <nav className="hidden md:flex items-center space-x-1 font-sans">
            <button
              onClick={() => navigate('/student/dashboard')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 cursor-pointer ${
                location.pathname === '/student/dashboard'
                  ? 'text-purple-400 bg-purple-500/10'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              <span>{language === 'en' ? 'Dashboard' : 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್'}</span>
            </button>
            <button
              onClick={() => navigate('/student/quiz')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 cursor-pointer ${
                location.pathname === '/student/quiz'
                  ? 'text-purple-400 bg-purple-500/10'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <HelpCircle className="h-3.5 w-3.5" />
              <span>{language === 'en' ? 'Quiz' : 'ಕ್ವಿಜ್'}</span>
            </button>
            <button
              onClick={() => navigate('/student/notes')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 cursor-pointer ${
                location.pathname === '/student/notes'
                  ? 'text-purple-400 bg-purple-500/10'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>{language === 'en' ? 'My Notes' : 'ನನ್ನ ಟಿಪ್ಪಣಿಗಳು'}</span>
            </button>
            <button
              onClick={() => navigate('/student/videos')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 cursor-pointer ${
                location.pathname === '/student/videos'
                  ? 'text-purple-400 bg-purple-500/10'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Video className="h-3.5 w-3.5" />
              <span>{language === 'en' ? 'Videos' : 'ವಿಡಿಯೋಗಳು'}</span>
            </button>
            <button
              onClick={() => navigate('/student/calendar')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 cursor-pointer ${
                location.pathname === '/student/calendar'
                  ? 'text-purple-400 bg-purple-500/10'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>{language === 'en' ? 'Calendar' : 'ಕ್ಯಾಲೆಂಡರ್'}</span>
            </button>
          </nav>

          {/* Right: User profile + Sign out */}
          <div className="flex items-center space-x-4">
            {/* Language Switcher */}
            <button
              onClick={handleLanguageToggle}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg border border-white/10 text-slate-300 hover:text-white text-[11px] font-semibold cursor-pointer"
            >
              <Languages className="h-3.5 w-3.5 text-purple-400" />
              <span>{language === 'en' ? 'ಕನ್ನಡ' : 'EN'}</span>
            </button>

            {/* Switch Role Button */}
            <button
              onClick={handleSwitchRoleClick}
              className="flex items-center space-x-1 text-slate-300 hover:text-white text-[10px] uppercase font-bold border border-purple-500/20 px-2 py-1 rounded bg-purple-950/20 cursor-pointer"
              title="Switch to another dashboard"
            >
              <Shuffle className="h-3 w-3 text-purple-400" />
              <span>Switch Role</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-xl border border-white/5 text-slate-400 hover:text-white hover:bg-white/5 cursor-pointer"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4 text-yellow-400" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* Profile Label */}
            <div className="hidden sm:flex flex-col text-right font-sans">
              <span className="text-xs font-bold text-white leading-tight">
                {user?.name || 'Shivshakti .c.prachande'}
              </span>
              <span className="text-[10px] text-slate-400">
                {user?.studentProfile?.grade || '12th Science'}
              </span>
            </div>

            {/* Sign Out */}
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-1.5 text-slate-400 hover:text-red-400 transition-colors text-xs font-semibold cursor-pointer"
            >
              <span>{language === 'en' ? 'Sign out' : 'ಸೈನ್ ಔಟ್'}</span>
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
        {renderSwitchRoleModal()}
      </header>
    );
  }

  // ==========================================
  // RENDER DEPARTMENT / TEACHER / ADMIN NAVBAR
  // ==========================================
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-[#05050f]/90 backdrop-blur-md text-white">
      <div className="flex h-16 items-center justify-between px-6">
        
        {/* Left: Logo */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate(isDepartmentPortal ? '/department/dashboard' : '/admin/dashboard')}>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#a855f7] to-[#00e5ff] shadow-md shadow-cyan-500/20">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight m-0 p-0 flex flex-wrap items-center gap-1.5 leading-none">
              <span className="text-red-500 font-extrabold">ಕನ್ನಡ ಸೇವಾ</span>
              <span className="text-[10px] font-normal border-l border-white/10 pl-2 text-slate-400 hidden lg:inline font-sans">
                AI-Powered Education Analytics & Interventions
              </span>
            </h1>
          </div>
        </div>

        {/* Right: Notifications, Switch Role, Language, Dropdown */}
        <div className="flex items-center space-x-4">
          
          {/* Switch Role Button */}
          <button
            onClick={handleSwitchRoleClick}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-950/20 text-cyan-400 hover:bg-cyan-950/40 text-xs font-semibold cursor-pointer"
          >
            <Shuffle className="h-3.5 w-3.5" />
            <span>Switch Role</span>
          </button>

          {/* Language Toggle */}
          <button
            onClick={handleLanguageToggle}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-full border border-white/10 text-slate-300 hover:bg-white/5 text-xs font-semibold cursor-pointer"
          >
            <Languages className="h-3.5 w-3.5 text-cyan-400" />
            <span>{language === 'en' ? 'ಕನ್ನಡ' : 'English'}</span>
          </button>

          {/* Theme switcher */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-xl border border-white/5 text-slate-400 hover:text-white hover:bg-white/5 cursor-pointer"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4 text-yellow-400" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* Notification bell with badge */}
          <div className="relative cursor-pointer hover:bg-white/5 p-1.5 rounded-xl border border-white/5">
            <Bell className="h-4 w-4 text-slate-300" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-pink-500 animate-pulse"></span>
          </div>

          {/* User profile details */}
          <div className="flex items-center space-x-2 border-l border-white/10 pl-4 font-sans">
            <div className="h-8 w-8 rounded-full bg-cyan-950/80 border border-cyan-500/20 flex items-center justify-center font-bold text-cyan-400">
              {user?.name ? user.name.charAt(0) : 'D'}
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-bold leading-none text-white">
                {user?.name || 'Dr. Ramesh Rao'}
              </span>
              <span className="text-[10px] text-slate-400 font-mono mt-0.5 uppercase tracking-wider">
                {activeRole || 'DEPARTMENT'}
              </span>
            </div>
          </div>

          {/* Log Out */}
          <button
            onClick={handleSignOut}
            className="p-1.5 text-slate-400 hover:text-red-400 rounded-xl hover:bg-white/5 cursor-pointer"
            title="Log out"
          >
            <LogOut className="h-4 w-4" />
          </button>

        </div>

      </div>
      {renderSwitchRoleModal()}
    </header>
  );
};
