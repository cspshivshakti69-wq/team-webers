import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Lock, ArrowLeft, CheckCircle, ShieldAlert } from 'lucide-react';

export const ResetPassword: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      // Find user in local storage ks-registered-users and update password
      try {
        const usersRaw = localStorage.getItem('ks-registered-users');
        if (usersRaw) {
          const users = JSON.parse(usersRaw);
          const userIdx = users.findIndex((u: any) => u.email.toLowerCase() === email.toLowerCase());
          
          if (userIdx !== -1) {
            users[userIdx].password = password;
            localStorage.setItem('ks-registered-users', JSON.stringify(users));
          }
        }
      } catch (err) {
        console.error("Failed to update password in local storage", err);
      }

      setLoading(false);
      setSuccess(true);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#05050f] px-4 py-12 text-white font-mono-header selection:bg-cyan-500/30">
      <div className="max-w-md w-full glass-morphism p-8 rounded-2xl shadow-2xl relative border border-white/10">
        
        {/* Glow corner decorations */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl"></div>

        {/* Header Logo */}
        <div className="text-center mb-6">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#a855f7] to-[#00e5ff] shadow-md shadow-cyan-500/10 mb-4" onClick={() => navigate('/')}>
            <GraduationCap className="h-7 w-7 text-white" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Set New Password
          </h2>
          <p className="text-xs text-slate-400 mt-2 font-sans font-medium">
            Resetting password for: <span className="text-cyan-400 font-mono">{email || 'your account'}</span>
          </p>
        </div>

        {error && (
          <div className="bg-red-950/40 border border-red-500/30 text-red-400 p-3 rounded-xl text-xs mb-4 flex items-center space-x-2">
            <ShieldAlert className="h-4 w-4 flex-shrink-0" />
            <span className="font-sans">{error}</span>
          </div>
        )}

        {success ? (
          <div className="space-y-6 text-center font-sans">
            <div className="flex justify-center text-emerald-400">
              <CheckCircle className="h-16 w-16" />
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              Your password has been reset successfully! You can now sign in using your new credentials.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="w-full btn-gradient py-3 rounded-xl text-xs font-bold shadow-lg shadow-cyan-500/20 cursor-pointer text-white"
            >
              Go to Login
            </button>
          </div>
        ) : (
          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-4 font-sans text-xs">
              
              {/* New Password */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#0d0d1f] border border-white/10 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400"
                    required
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#0d0d1f] border border-white/10 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400"
                    required
                  />
                </div>
              </div>

            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-gradient py-3 rounded-xl text-xs font-bold shadow-lg shadow-cyan-500/20 active:scale-[0.98] transition-all flex justify-center items-center cursor-pointer mt-6 text-white"
            >
              {loading ? 'Updating Password...' : 'Reset Password'}
            </button>

            <div className="text-center pt-2 font-sans">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="inline-flex items-center text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4 mr-1.5" />
                Back to Login
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
