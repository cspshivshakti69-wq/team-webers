import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Mail, ArrowLeft, CheckCircle } from 'lucide-react';

export const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);

    setTimeout(() => {
      setSubmitted(true);
      setLoading(false);
      // Log the reset link in the console for demo evaluation
      console.log(`Demo Reset Link: http://localhost:5173/reset-password?email=${encodeURIComponent(email)}&token=demo-token-123`);
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#05050f] px-4 py-12 text-white font-mono-header selection:bg-cyan-500/30">
      <div className="max-w-md w-full glass-morphism p-8 rounded-2xl shadow-2xl relative border border-white/10">
        
        {/* Glow corner decorations */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl"></div>

        {/* Header Logo */}
        <div className="text-center mb-6">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#a855f7] to-[#00e5ff] shadow-md shadow-cyan-500/10 mb-4 cursor-pointer" onClick={() => navigate('/')}>
            <GraduationCap className="h-7 w-7 text-white" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Reset Password
          </h2>
          <p className="text-xs text-slate-400 mt-2 font-sans font-medium">
            Retrieve your Kannada Seva access credentials.
          </p>
        </div>

        {submitted ? (
          <div className="space-y-6 text-center font-sans">
            <div className="flex justify-center text-cyan-400">
              <CheckCircle className="h-16 w-16" />
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              We have sent a password reset link to <strong className="text-white">{email}</strong>. Please check your inbox (or inspect the developer tools console) to reset your password.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center text-xs font-bold text-cyan-400 hover:underline cursor-pointer border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl"
            >
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Back to Login
            </button>
          </div>
        ) : (
          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <div className="font-sans text-xs">
              <p className="text-[11px] text-slate-400 leading-relaxed mb-4 text-center">
                Enter the email address associated with your account, and we will email you a link to reset your password.
              </p>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@seva.edu"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0d0d1f] border border-white/10 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-gradient py-3 rounded-xl text-xs font-bold shadow-lg shadow-cyan-500/20 active:scale-[0.98] transition-all flex justify-center items-center cursor-pointer mt-4 text-white"
            >
              {loading ? 'Sending reset link...' : 'Send Reset Link'}
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
