import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, type UserRole, MOCK_PROFILES } from '../context/AuthContext';
import { GraduationCap, Mail, Lock, ShieldAlert } from 'lucide-react';

interface LoginProps {
  onNavigate?: (page: string) => void;
}

export const Login: React.FC<LoginProps> = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('DEPARTMENT');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');
    const err = params.get('error');
    const isSwitch = params.get('switch');

    if (mode === 'student') {
      setRole('STUDENT');
    }
    if (err) {
      setError(decodeURIComponent(err));
    }
    if (isSwitch) {
      setError('Please log in with your new role credentials.');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide email and password');
      return;
    }

    setLoading(true);
    setError('');

    // Simulate login checks
    setTimeout(() => {
      // 1. Check if email/password matches a mock profile
      const defaultProfile = MOCK_PROFILES[role];
      const matchesMock = defaultProfile && 
                          defaultProfile.email.toLowerCase() === email.toLowerCase() && 
                          password === 'demo-password-123';

      // 2. Check if matches registered users in local storage
      let matchesRegistered = null;
      try {
        const regUsersRaw = localStorage.getItem('ks-registered-users');
        if (regUsersRaw) {
          const regUsers = JSON.parse(regUsersRaw);
          matchesRegistered = regUsers.find((u: any) => 
            u.email.toLowerCase() === email.toLowerCase() && 
            u.password === password && 
            u.role === role
          );
        }
      } catch (err) {
        console.error("Failed to load registered users", err);
      }

      if (matchesMock) {
        login(defaultProfile, 'demo-jwt-token-string');
        const targetPath = getDashboardPath(role);
        setLoading(false);
        navigate(targetPath);
      } else if (matchesRegistered) {
        login({
          id: matchesRegistered.id || `usr-${role.toLowerCase()}-${Date.now()}`,
          name: matchesRegistered.name,
          email: matchesRegistered.email,
          role: matchesRegistered.role,
          schoolName: matchesRegistered.schoolName || 'Government High School Bengaluru',
          studentProfile: matchesRegistered.studentProfile
        }, 'demo-jwt-token-string');
        const targetPath = getDashboardPath(role);
        setLoading(false);
        navigate(targetPath);
      } else {
        setLoading(false);
        setError(`Incorrect email/password for the selected ${getRoleLabel(role)} role.`);
      }
    }, 600);
  };

  const getDashboardPath = (selectedRole: UserRole) => {
    switch (selectedRole) {
      case 'ADMIN': return '/admin/dashboard';
      case 'TEACHER': return '/teacher/dashboard';
      case 'DEPARTMENT': return '/department/dashboard';
      case 'STUDENT':
      case 'GUARDIAN':
        return '/student/dashboard';
      default: return '/';
    }
  };

  const getRoleLabel = (selectedRole: UserRole) => {
    switch (selectedRole) {
      case 'ADMIN': return 'School Administrator';
      case 'TEACHER': return 'Teacher';
      case 'DEPARTMENT': return 'Department Officer';
      case 'STUDENT': return 'Student';
      case 'GUARDIAN': return 'Guardian';
    }
  };

  const handleQuickAccess = (selectedRole: UserRole, userEmail: string) => {
    setRole(selectedRole);
    setEmail(userEmail);
    setPassword('demo-password-123');
    setError('');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#05050f] px-4 py-12 text-white font-mono-header selection:bg-cyan-500/30">
      
      {/* Center card (dark glass-morphism) */}
      <div className="max-w-md w-full glass-morphism p-8 rounded-2xl shadow-2xl relative overflow-hidden border border-white/10">
        
        {/* Glow corner decorations */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl"></div>

        {/* Logo Header */}
        <div className="text-center mb-8 relative z-10">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#a855f7] to-[#00e5ff] shadow-md shadow-cyan-500/10 mb-4 cursor-pointer" onClick={() => navigate('/')}>
            <GraduationCap className="h-7 w-7 text-white" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Secure Access Portal
          </h2>
          <p className="text-xs text-slate-400 mt-2 font-sans font-medium">
            Secure access to Karnataka Education AI databases.
          </p>
        </div>

        {error && (
          <div className="bg-red-950/40 border border-red-500/30 text-red-400 p-3 rounded-xl text-xs mb-4 flex items-center space-x-2">
            <ShieldAlert className="h-4 w-4 flex-shrink-0" />
            <span className="font-sans">{error}</span>
          </div>
        )}

        <form className="space-y-5 relative z-10" onSubmit={handleSubmit}>
          
          {/* SELECT AUTHORITY ROLE */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
              SELECT AUTHORITY ROLE
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full bg-[#0d0d1f] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
            >
              <option value="DEPARTMENT">Department Officer</option>
              <option value="ADMIN">School Administrator</option>
              <option value="TEACHER">Teacher</option>
              <option value="STUDENT">Student Portal</option>
            </select>
          </div>

          {/* EMAIL */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
              OFFICIAL EMAIL ADDRESS
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <Mail className="h-4 w-4" />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@karnataka.gov.in"
                className="w-full pl-10 pr-4 py-2.5 bg-[#0d0d1f] border border-white/10 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 font-sans"
                required
              />
            </div>
          </div>

          {/* PASSWORD */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
              PASSWORD
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <Lock className="h-4 w-4" />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-[#0d0d1f] border border-white/10 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 font-sans"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-gradient py-3 rounded-xl text-xs font-bold shadow-lg shadow-cyan-500/20 active:scale-[0.98] transition-all flex justify-center items-center cursor-pointer mt-6"
          >
            {loading ? 'Sign In...' : '→ Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs font-sans">
          <span className="text-slate-400">Don't have an account? </span>
          <button
            onClick={() => navigate('/register')}
            className="font-bold text-cyan-400 hover:underline cursor-pointer"
          >
            Create Account
          </button>
        </div>
      </div>

      {/* Quick-Access Demo Credentials Section */}
      <div className="max-w-md w-full mt-8 p-6 rounded-2xl border border-white/5 bg-[#0d0d1f]/40 relative z-10">
        <h3 className="text-xs font-bold tracking-wider text-white mb-1">
          ⚡ Quick-Access Demo Credentials
        </h3>
        <p className="text-[10px] text-slate-400 font-sans mb-4">
          Select an authority level below to automatically load credentials for immediate evaluation.
        </p>

        <div className="space-y-2.5 font-sans">
          {/* Row 1: School Administrator */}
          <button
            onClick={() => handleQuickAccess('ADMIN', 'admin@kannadaseva.edu')}
            className="w-full flex items-start p-3 bg-[#0d0d1f]/80 hover:bg-[#12122a] border border-white/5 hover:border-white/10 rounded-xl text-left transition-all text-xs cursor-pointer group"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-500 mt-1.5 mr-3 flex-shrink-0 animate-pulse"></span>
            <div>
              <div className="font-bold text-white group-hover:text-cyan-400 font-mono-header transition-colors">
                School Administrator
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Full portal access to create school analytics logs and reports.
              </p>
            </div>
          </button>

          {/* Row 2: Department Officer */}
          <button
            onClick={() => handleQuickAccess('DEPARTMENT', 'user@karnataka.gov.in')}
            className="w-full flex items-start p-3 bg-[#0d0d1f]/80 hover:bg-[#12122a] border border-white/5 hover:border-white/10 rounded-xl text-left transition-all text-xs cursor-pointer group"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-500 mt-1.5 mr-3 flex-shrink-0 animate-pulse"></span>
            <div>
              <div className="font-bold text-white group-hover:text-cyan-400 font-mono-header transition-colors">
                Department Officer
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Full district access, interactive SVG maps, and taluk comparisons.
              </p>
            </div>
          </button>

          {/* Row 3: Teacher / NGO Analyst */}
          <button
            onClick={() => handleQuickAccess('TEACHER', 'venkatesh.k@kannadaseva.edu')}
            className="w-full flex items-start p-3 bg-[#0d0d1f]/80 hover:bg-[#12122a] border border-white/5 hover:border-white/10 rounded-xl text-left transition-all text-xs cursor-pointer group"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-500 mt-1.5 mr-3 flex-shrink-0 animate-pulse"></span>
            <div>
              <div className="font-bold text-white group-hover:text-cyan-400 font-mono-header transition-colors">
                Teacher
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">
                View student detailed drawers, upload files and trigger assignments.
              </p>
            </div>
          </button>

          {/* Row 4: Student Quick Access */}
          <button
            onClick={() => handleQuickAccess('STUDENT', 'aditya.bhat@kannadaseva.edu')}
            className="w-full flex items-start p-3 bg-[#0d0d1f]/80 hover:bg-[#12122a] border border-white/5 hover:border-white/10 rounded-xl text-left transition-all text-xs cursor-pointer group"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-500 mt-1.5 mr-3 flex-shrink-0 animate-pulse"></span>
            <div>
              <div className="font-bold text-white group-hover:text-cyan-400 font-mono-header transition-colors">
                Student Portal
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Track personal exam averages, quizzes, notes, and calendar tasks.
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
