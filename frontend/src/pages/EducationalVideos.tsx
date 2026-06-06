import React from 'react';
import { 
  Video, 
  Clock, 
  BookOpen, 
  Radio, 
  Tv
} from 'lucide-react';

export const EducationalVideos: React.FC = () => {
  const channels = [
    { name: 'Physics', color: 'cyan', badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20', desc: 'Concept explainers for Mechanics & Electrostatics' },
    { name: 'Chemistry', color: 'teal', badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', desc: 'Organic mechanisms & Chemical bonding formulas' },
    { name: 'Mathematics', color: 'purple', badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20', desc: 'Calculus derivatives & algebra shortcuts' },
    { name: 'Biology', color: 'pink', badgeColor: 'bg-pink-500/10 text-pink-400 border-pink-500/20', desc: 'Visual cells structure & human physiology chapters' },
    { name: 'General Knowledge', color: 'orange', badgeColor: 'bg-orange-500/10 text-orange-400 border-orange-500/20', desc: 'Karnataka history, geographical highlights & culture' },
    { name: 'Previous Year Papers', color: 'gray', badgeColor: 'bg-slate-500/10 text-slate-400 border-slate-500/20', desc: 'Video solutions for NEET, JEE & KCET exams' }
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-[#05050f] text-white space-y-6 font-sans">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 pb-5">
        <div>
          <h2 className="text-2xl font-bold tracking-tight font-mono-header">Educational Videos</h2>
          <p className="text-xs text-slate-400 mt-1">
            Subject-wise lecture videos for exam preparation.
          </p>
        </div>
      </div>

      {/* Coming Soon Banner */}
      <div className="glow-card p-6 border-purple-500/20 bg-gradient-to-r from-purple-950/20 via-[#0d0d1f] to-cyan-950/15 relative overflow-hidden flex flex-col md:flex-row items-center gap-6">
        <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/5 rounded-full blur-2xl"></div>
        
        {/* Camera Icon */}
        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center text-white flex-shrink-0 shadow-lg shadow-purple-500/20 animate-pulse">
          <Video className="h-8 w-8" />
        </div>

        <div className="space-y-1 text-center md:text-left relative z-10">
          <h3 className="text-base font-bold text-white font-mono-header">Video Library — Coming Soon</h3>
          <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
            Curated lecture videos, concept explainers, and problem-solving walkthroughs for NEET, JEE, CET, and CUET will be added here by your teachers and administrators.
          </p>
        </div>
      </div>

      {/* 3 Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Card 1 */}
        <div className="glow-card p-5 flex items-start space-x-4">
          <div className="p-2 rounded-xl bg-purple-950/40 text-purple-400 border border-purple-500/20 flex-shrink-0">
            <Video className="h-4.5 w-4.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase text-white tracking-wider font-mono-header">Lecture Videos</h4>
            <p className="text-[10px] text-slate-400 mt-1 leading-normal">
              Full chapter-wise lectures from expert educators.
            </p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="glow-card p-5 flex items-start space-x-4">
          <div className="p-2 rounded-xl bg-cyan-950/40 text-cyan-400 border border-cyan-500/20 flex-shrink-0">
            <Clock className="h-4.5 w-4.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase text-white tracking-wider font-mono-header">Quick Revision</h4>
            <p className="text-[10px] text-slate-400 mt-1 leading-normal">
              5–10 min concept clips before your exam.
            </p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="glow-card p-5 flex items-start space-x-4">
          <div className="p-2 rounded-xl bg-pink-950/40 text-pink-400 border border-pink-500/20 flex-shrink-0">
            <BookOpen className="h-4.5 w-4.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase text-white tracking-wider font-mono-header">Solved Papers</h4>
            <p className="text-[10px] text-slate-400 mt-1 leading-normal">
              Video solutions for previous year papers.
            </p>
          </div>
        </div>

      </div>

      {/* Upcoming Channels section */}
      <div className="space-y-4 pt-2">
        <h3 className="text-sm font-bold tracking-wider uppercase font-mono-header flex items-center space-x-2">
          <Tv className="h-4.5 w-4.5 text-cyan-400" />
          <span>Upcoming Subject Channels</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {channels.map((chan, idx) => (
            <div key={idx} className="glow-card p-5 bg-[#0d0d1f] hover:bg-white/[0.01] border border-white/5 rounded-2xl flex items-start justify-between relative overflow-hidden transition-all group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.01] rounded-full blur-xl group-hover:bg-cyan-500/[0.02] transition-all"></div>
              
              <div className="space-y-3 relative z-10">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase border ${chan.badgeColor}`}>
                    {chan.name}
                  </span>
                  <span className="text-[9px] text-slate-500 font-bold">0 videos</span>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400">{chan.desc}</p>
                  <p className="text-[9px] text-slate-500 italic mt-1 flex items-center">
                    Videos will appear here after admin approval.
                  </p>
                </div>
              </div>

              <div className="text-slate-500 group-hover:text-cyan-400 transition-colors p-1.5 rounded-lg border border-transparent group-hover:border-white/5 relative z-10 flex-shrink-0">
                <Radio className="h-4 w-4" />
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
