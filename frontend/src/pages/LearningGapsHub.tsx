import React, { useState } from 'react';
import { Filter, Calendar } from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend 
} from 'recharts';

export const LearningGapsHub: React.FC = () => {
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [selectedTaluk, setSelectedTaluk] = useState('All');
  const [selectedYear, setSelectedYear] = useState('2025-2026');

  // Chart 1: Weekly Attendance Over Time (%) data
  const attendanceData = [
    { week: 'Wk 1', Attendance: 94.2 },
    { week: 'Wk 2', Attendance: 93.8 },
    { week: 'Wk 3', Attendance: 91.5 },
    { week: 'Wk 4', Attendance: 90.1 },
    { week: 'Wk 5', Attendance: 88.4 },
    { week: 'Wk 6', Attendance: 82.5 }, // Agricultural Harvest Dip
    { week: 'Wk 7', Attendance: 81.2 }, // Agricultural Harvest Dip
    { week: 'Wk 8', Attendance: 87.9 },
    { week: 'Wk 9', Attendance: 90.4 },
    { week: 'Wk 10', Attendance: 92.1 },
    { week: 'Wk 11', Attendance: 93.5 },
    { week: 'Wk 12', Attendance: 94.0 }
  ];

  // Chart 2: Average Proficiency Score by Grade data
  const gradeProficiencyData = [
    { grade: 'Grade 5', Kannada: 82, English: 58 },
    { grade: 'Grade 6', Kannada: 79, English: 61 },
    { grade: 'Grade 7', Kannada: 75, English: 66 },
    { grade: 'Grade 8', Kannada: 71, English: 70 }
  ];

  // Chart 3: Linguistic Disparities data
  const literacyRangeData = [
    { range: '0–40%', Kannada: 8, English: 28 },
    { range: '40–60%', Kannada: 18, English: 34 },
    { range: '60–80%', Kannada: 44, English: 26 },
    { range: '80–100%', Kannada: 30, English: 12 }
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-[#05050f] text-white space-y-6">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 pb-5">
        <div>
          <h2 className="text-2xl font-bold tracking-tight font-mono-header">Learning Gaps & Analytics Hub</h2>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Investigate attendance patterns, grade breakdowns, and linguistic disparities.
          </p>
        </div>
      </div>

      {/* 3 filter dropdowns */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#0d0d1f] p-4 rounded-2xl border border-white/5 font-sans">
        
        {/* District */}
        <div className="flex items-center space-x-2 bg-[#05050f] border border-white/10 rounded-xl px-3 py-2">
          <Filter className="h-4 w-4 text-slate-500" />
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="bg-transparent text-xs text-white focus:outline-none w-full cursor-pointer"
          >
            <option value="All">All Districts</option>
            <option value="Dakshina Kannada">Dakshina Kannada</option>
            <option value="Mysore">Mysore</option>
            <option value="Chamarajanagar">Chamarajanagar</option>
          </select>
        </div>

        {/* Taluk */}
        <div className="flex items-center space-x-2 bg-[#05050f] border border-white/10 rounded-xl px-3 py-2">
          <Filter className="h-4 w-4 text-slate-500" />
          <select
            value={selectedTaluk}
            onChange={(e) => setSelectedTaluk(e.target.value)}
            className="bg-transparent text-xs text-white focus:outline-none w-full cursor-pointer"
          >
            <option value="All">All Taluks</option>
            <option value="Mangaluru">Mangaluru</option>
            <option value="Bantwal">Bantwal</option>
            <option value="Puttur">Puttur</option>
            <option value="Hunsur">Hunsur</option>
            <option value="Chamarajanagar">Chamarajanagar</option>
          </select>
        </div>

        {/* Year */}
        <div className="flex items-center space-x-2 bg-[#05050f] border border-white/10 rounded-xl px-3 py-2">
          <Calendar className="h-4 w-4 text-slate-500" />
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="bg-transparent text-xs text-white focus:outline-none w-full cursor-pointer"
          >
            <option value="2025-2026">2025–2026 Active</option>
            <option value="2024-2025">2024–2025 Archival</option>
          </select>
        </div>

      </div>

      {/* Grid: Attendance (12 Cols full width) */}
      <div className="glow-card p-6">
        <div className="flex flex-col mb-4">
          <h3 className="text-sm font-bold tracking-wider uppercase flex items-center space-x-2">
            <span className="h-2 w-2 rounded-full bg-cyan-400"></span>
            <span>Weekly Attendance Over Time (%)</span>
          </h3>
          <p className="text-[10px] text-slate-400 font-sans mt-0.5">
            Aggregated district attendance percentages. Visualizes warning declines during agricultural harvests.
          </p>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={attendanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00e5ff" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#00e5ff" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
              <XAxis dataKey="week" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} domain={[70, 100]} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0d0d1f', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8 }}
                labelStyle={{ color: '#fff' }}
              />
              <Area type="monotone" dataKey="Attendance" stroke="#00e5ff" strokeWidth={3} fillOpacity={1} fill="url(#colorAttendance)" name="Attendance (%)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: Proficiency & Gaps (2 columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 2: Average Proficiency Score by Grade */}
        <div className="glow-card p-6">
          <div className="flex flex-col mb-4">
            <h3 className="text-sm font-bold tracking-wider uppercase flex items-center space-x-2">
              <span className="h-2 w-2 rounded-full bg-purple-500"></span>
              <span>Average Proficiency Score by Grade</span>
            </h3>
            <p className="text-[10px] text-slate-400 font-sans mt-0.5">
              Assesses academic comprehension levels compared by medium instruction.
            </p>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gradeProficiencyData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="grade" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0d0d1f', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8 }}
                  labelStyle={{ color: '#fff' }}
                />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Bar dataKey="Kannada" fill="#00e5ff" radius={[3, 3, 0, 0]} name="Kannada Proficiency" />
                <Bar dataKey="English" fill="#a855f7" radius={[3, 3, 0, 0]} name="English Proficiency" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Linguistic Disparities */}
        <div className="glow-card p-6">
          <div className="flex flex-col mb-4">
            <h3 className="text-sm font-bold tracking-wider uppercase flex items-center space-x-2">
              <span className="h-2 w-2 rounded-full bg-pink-500"></span>
              <span>Linguistic Disparities (Kannada vs English Literacy)</span>
            </h3>
            <p className="text-[10px] text-slate-400 font-sans mt-0.5">
              Comparing reading and comprehension metrics in Kannada-medium schools compared to regional English benchmarks.
            </p>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={literacyRangeData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="range" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0d0d1f', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8 }}
                  labelStyle={{ color: '#fff' }}
                />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Bar dataKey="Kannada" fill="#00e5ff" radius={[3, 3, 0, 0]} name="Kannada Literacy Range (%)" />
                <Bar dataKey="English" fill="#a855f7" radius={[3, 3, 0, 0]} name="English Literacy Range (%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};
