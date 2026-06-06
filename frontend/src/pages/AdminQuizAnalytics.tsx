import React, { useState, useEffect } from 'react';
import { Filter, RefreshCw, BarChart2 } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface QuizAttempt {
  id: string;
  subjects: string[];
  score: string; // e.g. "8/10"
  date: string;
  timeTaken: string;
  difficulty: string;
  studentName?: string;
}

const DEFAULT_ATTEMPTS: QuizAttempt[] = [
  { id: 'att-1', studentName: 'Aditya Bhat', subjects: ['Mathematics'], score: '9/10', date: '2026-06-05', timeTaken: '6m 12s', difficulty: 'Medium' },
  { id: 'att-2', studentName: 'Aditya Bhat', subjects: ['Physics'], score: '8/10', date: '2026-06-04', timeTaken: '7m 45s', difficulty: 'Hard' },
  { id: 'att-3', studentName: 'Pooja Hegde', subjects: ['Chemistry'], score: '6/10', date: '2026-06-04', timeTaken: '9m 10s', difficulty: 'Medium' },
  { id: 'att-4', studentName: 'Abhishek Gowda', subjects: ['General Knowledge'], score: '10/10', date: '2026-06-03', timeTaken: '4m 30s', difficulty: 'Easy' },
  { id: 'att-5', studentName: 'Ramya N', subjects: ['Biology'], score: '7/10', date: '2026-06-02', timeTaken: '8m 15s', difficulty: 'Medium' },
  { id: 'att-6', studentName: 'Chethan Kumar', subjects: ['Mathematics'], score: '5/10', date: '2026-06-01', timeTaken: '10m 00s', difficulty: 'Hard' },
  { id: 'att-7', studentName: 'Girish K', subjects: ['General Knowledge'], score: '9/10', date: '2026-05-30', timeTaken: '5m 12s', difficulty: 'Easy' },
  { id: 'att-8', studentName: 'Divya M', subjects: ['Physics'], score: '7/10', date: '2026-05-28', timeTaken: '8m 04s', difficulty: 'Medium' }
];

export const AdminQuizAnalytics: React.FC = () => {
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadQuizAttempts();
  }, []);

  const loadQuizAttempts = () => {
    setLoading(true);
    try {
      const savedRaw = localStorage.getItem('ks-quiz-attempts');
      if (savedRaw) {
        setAttempts(JSON.parse(savedRaw));
      } else {
        localStorage.setItem('ks-quiz-attempts', JSON.stringify(DEFAULT_ATTEMPTS));
        setAttempts(DEFAULT_ATTEMPTS);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  // 1. Process stats for Subject Participation
  const subjectStats = React.useMemo(() => {
    const counts: Record<string, number> = {};
    const scoresSum: Record<string, number> = {};
    const scoresCount: Record<string, number> = {};

    attempts.forEach(att => {
      att.subjects.forEach(sub => {
        const cleanedSub = sub === 'All Subjects' ? 'General' : sub;
        counts[cleanedSub] = (counts[cleanedSub] || 0) + 1;

        // Extract score percentage
        const parts = att.score.split('/');
        if (parts.length === 2) {
          const percentage = (parseFloat(parts[0]) / parseFloat(parts[1])) * 100;
          scoresSum[cleanedSub] = (scoresSum[cleanedSub] || 0) + percentage;
          scoresCount[cleanedSub] = (scoresCount[cleanedSub] || 0) + 1;
        }
      });
    });

    return Object.keys(counts).map(sub => ({
      name: sub,
      Attempts: counts[sub],
      AverageScore: Math.round(scoresSum[sub] / scoresCount[sub])
    }));
  }, [attempts]);

  // 2. Process stats for Difficulty distribution
  const difficultyStats = React.useMemo(() => {
    const counts: Record<string, number> = { Easy: 0, Medium: 0, Hard: 0 };
    attempts.forEach(att => {
      const diff = att.difficulty === 'All' ? 'Medium' : att.difficulty;
      if (counts[diff] !== undefined) {
        counts[diff]++;
      } else {
        counts['Medium']++;
      }
    });

    return [
      { name: 'Easy', value: counts.Easy, color: '#22c55e' },
      { name: 'Medium', value: counts.Medium, color: '#eab308' },
      { name: 'Hard', value: counts.Hard, color: '#ef4444' }
    ];
  }, [attempts]);

  // 3. Process score performance bands
  const scorePerformanceStats = React.useMemo(() => {
    let bandA = 0; // >= 80%
    let bandB = 0; // 60% - 79%
    let bandC = 0; // < 60%

    attempts.forEach(att => {
      const parts = att.score.split('/');
      if (parts.length === 2) {
        const pct = (parseFloat(parts[0]) / parseFloat(parts[1])) * 100;
        if (pct >= 80) bandA++;
        else if (pct >= 60) bandB++;
        else bandC++;
      }
    });

    return [
      { name: 'High Scorers (>=80%)', count: bandA, fill: '#06b6d4' },
      { name: 'Average Scorers (60-79%)', count: bandB, fill: '#a855f7' },
      { name: 'Needs Support (<60%)', count: bandC, fill: '#ec4899' }
    ];
  }, [attempts]);

  const filteredAttempts = attempts.filter(att => {
    if (selectedDifficulty !== 'All' && att.difficulty !== selectedDifficulty) return false;
    return true;
  });

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-[#05050f] text-white space-y-6">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 pb-5">
        <div>
          <span className="text-xs font-bold text-purple-400 uppercase tracking-widest font-mono">Academic Metrics</span>
          <h2 className="text-2xl font-bold tracking-tight mt-1 font-mono-header">Quiz Analytics</h2>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Evaluate subject performance benchmarks, student score distributions, and diagnostic participation trends across active quiz modules.
          </p>
        </div>
        <div>
          <button
            onClick={loadQuizAttempts}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold cursor-pointer transition-all"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Reload Data</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 font-sans">
        <div className="bg-white/5 border border-white/5 p-4 rounded-xl">
          <span className="text-[10px] text-slate-400 block uppercase font-bold">Total Attempts</span>
          <span className="text-2xl font-extrabold text-white mt-1 block font-mono">{attempts.length}</span>
        </div>
        <div className="bg-white/5 border border-white/5 p-4 rounded-xl">
          <span className="text-[10px] text-slate-400 block uppercase font-bold">Avg Score Pct</span>
          <span className="text-2xl font-extrabold text-cyan-400 mt-1 block font-mono">
            {attempts.length > 0 
              ? Math.round(attempts.reduce((acc, curr) => {
                  const parts = curr.score.split('/');
                  return acc + (parts.length === 2 ? (parseFloat(parts[0]) / parseFloat(parts[1])) * 100 : 0);
                }, 0) / attempts.length)
              : 0}%
          </span>
        </div>
        <div className="bg-white/5 border border-white/5 p-4 rounded-xl">
          <span className="text-[10px] text-slate-400 block uppercase font-bold">Most Popular</span>
          <span className="text-md font-bold text-white mt-1.5 block truncate">
            {subjectStats.length > 0 
              ? [...subjectStats].sort((a,b) => b.Attempts - a.Attempts)[0]?.name 
              : 'N/A'}
          </span>
        </div>
        <div className="bg-white/5 border border-white/5 p-4 rounded-xl">
          <span className="text-[10px] text-slate-400 block uppercase font-bold">Hard Pass Rate</span>
          <span className="text-2xl font-extrabold text-purple-400 mt-1 block font-mono">
            {attempts.filter(a => a.difficulty === 'Hard').length > 0
              ? Math.round(attempts.filter(a => a.difficulty === 'Hard' && parseFloat(a.score.split('/')[0]) >= parseFloat(a.score.split('/')[1])*0.6).length / attempts.filter(a => a.difficulty === 'Hard').length * 100)
              : 60}%
          </span>
        </div>
      </div>

      {/* Recharts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-sans">
        
        {/* Chart 1: Subject Attempts & Averages (8 Cols) */}
        <div className="lg:col-span-8 bg-white/5 border border-white/5 p-5 rounded-2xl flex flex-col h-[380px]">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono mb-4">Subject Participation & Performance</h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.1} vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0c0c1e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', fontSize: '11px', color: '#fff' }}
                />
                <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                <Bar yAxisId="left" dataKey="Attempts" fill="#a855f7" radius={[4, 4, 0, 0]} name="Total Quiz Takers" />
                <Bar yAxisId="right" dataKey="AverageScore" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Avg Score (%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Difficulty Breakout (4 Cols) */}
        <div className="lg:col-span-4 bg-white/5 border border-white/5 p-5 rounded-2xl flex flex-col h-[380px]">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono mb-4">Difficulty Distribution</h3>
          <div className="flex-1 min-h-0 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={difficultyStats}
                  cx="50%"
                  cy="45%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {difficultyStats.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0c0c1e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', fontSize: '11px' }} />
                <Legend iconSize={6} iconType="circle" wrapperStyle={{ fontSize: '9px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Performance bands (12 Cols) */}
        <div className="lg:col-span-12 bg-white/5 border border-white/5 p-5 rounded-2xl flex flex-col h-[350px]">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono mb-4">Student Grade Distribution</h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scorePerformanceStats} layout="vertical" margin={{ top: 10, right: 10, left: 30, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.1} horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0c0c1e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', fontSize: '11px' }} />
                <Bar dataKey="count" radius={[0, 8, 8, 0]} maxBarSize={30}>
                  {scorePerformanceStats.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Recent Attempts History Table */}
      <div className="glass-morphism rounded-2xl border border-white/5 overflow-hidden">
        <div className="p-4 border-b border-white/5 bg-[#0d0d1f]/40 flex justify-between items-center font-mono text-xs">
          <span className="text-slate-400 uppercase font-bold">Recent Quiz Attempts ({filteredAttempts.length})</span>
          
          <div className="flex items-center space-x-2">
            <Filter className="h-3 w-3 text-slate-400" />
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="bg-[#05050f] border border-white/10 rounded px-2 py-0.5 text-[10px] text-white focus:outline-none"
            >
              <option value="All">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
        </div>

        {filteredAttempts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead>
                <tr className="border-b border-white/5 text-slate-400 uppercase font-mono text-[10px]">
                  <th className="p-4">Student</th>
                  <th className="p-4">Subjects Attempted</th>
                  <th className="p-4 text-center">Difficulty</th>
                  <th className="p-4 text-center">Time Invested</th>
                  <th className="p-4 text-center">Date Taken</th>
                  <th className="p-4 text-right">Score Scored</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredAttempts.map((att) => {
                  const parts = att.score.split('/');
                  const percentage = parts.length === 2 ? Math.round((parseFloat(parts[0]) / parseFloat(parts[1])) * 100) : 0;
                  
                  return (
                    <tr key={att.id} className="hover:bg-white/[0.01] transition-colors">
                      <td className="p-4 font-bold text-white">
                        {att.studentName || 'Aditya Bhat'}
                      </td>
                      <td className="p-4 text-slate-300 font-semibold">
                        {att.subjects.join(', ')}
                      </td>
                      <td className="p-4 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                          att.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          att.difficulty === 'Hard' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                          'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {att.difficulty}
                        </span>
                      </td>
                      <td className="p-4 text-center text-slate-400 font-mono">
                        {att.timeTaken}
                      </td>
                      <td className="p-4 text-center text-slate-400 font-mono">
                        {att.date}
                      </td>
                      <td className="p-4 text-right">
                        <div className="font-bold text-white font-mono text-sm">{att.score}</div>
                        <div className={`text-[10px] font-bold ${percentage >= 80 ? 'text-emerald-400' : percentage >= 60 ? 'text-cyan-400' : 'text-red-400'}`}>{percentage}%</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center text-slate-600">
            <BarChart2 className="h-12 w-12 text-slate-700 mx-auto mb-3" />
            <p className="text-sm font-semibold">No attempts recorded for this difficulty filter.</p>
          </div>
        )}
      </div>

    </div>
  );
};
