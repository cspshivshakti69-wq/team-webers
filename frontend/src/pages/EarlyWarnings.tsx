import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bot, 
  Search, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  MapPin,
  Building
} from 'lucide-react';

interface StudentAlert {
  id: string;
  name: string;
  location: string;
  school: string;
  grade: string;
  attendance: number;
  langGap: number;
  risk: 'HIGH' | 'MEDIUM' | 'LOW';
  riskPercentage: number;
  triggers: string[];
}

const STUDENTS_ALERTS: StudentAlert[] = [
  { id: 'st-1', name: 'Abhishek Gowda', location: 'Mangaluru', school: 'GHPS Mangaluru Port', grade: 'Grade 6', attendance: 61.0, langGap: 51.8, risk: 'HIGH', riskPercentage: 87.4, triggers: ['CHRONIC', 'SEVERE', 'LONG'] },
  { id: 'st-2', name: 'Chethan Kumar', location: 'Mangaluru', school: 'GHPS Mangaluru Port', grade: 'Grade 7', attendance: 76.4, langGap: 50.9, risk: 'MEDIUM', riskPercentage: 45.2, triggers: ['SEVERE', 'SOCIO-ECONOMIC'] },
  { id: 'st-3', name: 'Divya M', location: 'Mangaluru', school: 'GHPS Mangaluru Port', grade: 'Grade 4', attendance: 85.4, langGap: 50.6, risk: 'MEDIUM', riskPercentage: 69.4, triggers: ['LINGUISTIC'] },
  { id: 'st-4', name: 'Ramya N', location: 'Bantwal', school: 'GHPS Bantwal Rural', grade: 'Grade 4', attendance: 68.8, langGap: 44.5, risk: 'HIGH', riskPercentage: 76.8, triggers: ['CHRONIC', 'SEVERE'] },
  { id: 'st-5', name: 'Pooja Hegde', location: 'Hunsur', school: 'GHPS Hunsur Forest Edge', grade: 'Grade 5', attendance: 59.0, langGap: 62.4, risk: 'HIGH', riskPercentage: 82.1, triggers: ['CHRONIC', 'LINGUISTIC'] },
  { id: 'st-6', name: 'Naveen Rao', location: 'Puttur', school: 'GHS Puttur Town', grade: 'Grade 8', attendance: 78.5, langGap: 50.2, risk: 'MEDIUM', riskPercentage: 69.4, triggers: ['LINGUISTIC', 'SOCIO-ECONOMIC'] },
  { id: 'st-7', name: 'Girish K', location: 'Bantwal', school: 'GHPS Bantwal Rural', grade: 'Grade 5', attendance: 81.0, langGap: 48.9, risk: 'MEDIUM', riskPercentage: 61.2, triggers: ['ABSENTEE WARNING'] },
  { id: 'st-8', name: 'Manju B', location: 'Chamarajanagar', school: 'GHPS Chamarajanagar Hill', grade: 'Grade 6', attendance: 68.2, langGap: 58.1, risk: 'HIGH', riskPercentage: 81.2, triggers: ['CHRONIC', 'COMMUTE'] },
  { id: 'st-9', name: 'Sneha Gowda', location: 'Kundapura', school: 'GHPS Kundapura Coast', grade: 'Grade 7', attendance: 72.4, langGap: 54.1, risk: 'HIGH', riskPercentage: 74.5, triggers: ['LINGUISTIC', 'SEVERE'] },
  { id: 'st-10', name: 'Sharath C', location: 'Tumkur', school: 'GHPS Tumkur Town', grade: 'Grade 6', attendance: 80.1, langGap: 49.2, risk: 'MEDIUM', riskPercentage: 60.1, triggers: ['SOCIO-ECONOMIC'] },
  { id: 'st-11', name: 'Vidya S', location: 'Madhugiri', school: 'GHS Madhugiri North', grade: 'Grade 8', attendance: 65.4, langGap: 52.8, risk: 'HIGH', riskPercentage: 79.2, triggers: ['CHRONIC', 'SEVERE'] },
  { id: 'st-12', name: 'Pradeep Kumar', location: 'Mysore', school: 'GHS Mysore South', grade: 'Grade 7', attendance: 88.0, langGap: 42.1, risk: 'LOW', riskPercentage: 38.4, triggers: ['STABLE'] },
  { id: 'st-13', name: 'Sandeep Bhat', location: 'Udupi', school: 'GHPS Udupi Fishery', grade: 'Grade 5', attendance: 92.5, langGap: 40.2, risk: 'LOW', riskPercentage: 28.5, triggers: ['STABLE'] },
  { id: 'st-14', name: 'Ashwini R', location: 'Madhugiri', school: 'GHS Madhugiri North', grade: 'Grade 7', attendance: 67.8, langGap: 55.4, risk: 'HIGH', riskPercentage: 78.4, triggers: ['CHRONIC', 'LINGUISTIC'] },
  { id: 'st-15', name: 'Harish M', location: 'Kundapura', school: 'GHPS Kundapura Coast', grade: 'Grade 6', attendance: 74.2, langGap: 51.5, risk: 'MEDIUM', riskPercentage: 63.8, triggers: ['LINGUISTIC'] },
  { id: 'st-16', name: 'Bhavya S', location: 'Bantwal', school: 'GHPS Bantwal Rural', grade: 'Grade 6', attendance: 89.2, langGap: 41.5, risk: 'LOW', riskPercentage: 32.1, triggers: ['STABLE'] }
];

export const EarlyWarnings: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<'ALL' | 'HIGH' | 'MEDIUM'>('ALL');
  const [deploySuccess, setDeploySuccess] = useState(false);

  const handleDeployKits = () => {
    setDeploySuccess(true);
    setTimeout(() => setDeploySuccess(false), 4000);
  };

  // Filter alerts
  const filteredAlerts = STUDENTS_ALERTS.filter(alert => {
    const matchesSearch = alert.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          alert.school.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          alert.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRisk = selectedRiskFilter === 'ALL' || alert.risk === selectedRiskFilter;

    return matchesSearch && matchesRisk;
  });

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-[#05050f] text-white space-y-6">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 pb-5">
        <div>
          <h2 className="text-2xl font-bold tracking-tight font-mono-header">AI Early Warning Alerts</h2>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Machine learning models scoring student dropout probability based on 6 core risk factors.
          </p>
        </div>
      </div>

      {/* AI Action Panel (banner card) */}
      <div className="glow-card p-6 border-cyan-500/20 bg-gradient-to-r from-cyan-950/20 via-[#0d0d1f] to-purple-950/15 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/5 rounded-full blur-2xl"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start space-x-3.5">
            <div className="h-10 w-10 rounded-xl bg-cyan-950/80 border border-cyan-500/25 flex items-center justify-center text-cyan-400 mt-1">
              <Bot className="h-5.5 w-5.5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-wide uppercase font-mono-header">AI Action Panel</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xl font-sans leading-relaxed">
                Deploy targeted bilingual materials to all students with a language-based risk trigger. 
                System identifies 8 active profiles currently showing critical comprehension margins.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end flex-shrink-0">
            <button
              onClick={handleDeployKits}
              className="btn-gradient px-4.5 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-cyan-500/10 cursor-pointer flex items-center space-x-1.5"
            >
              <Sparkles className="h-4 w-4" />
              <span>Auto-deploy Bilingual Kits</span>
            </button>
            {deploySuccess && (
              <span className="text-[10px] text-emerald-400 font-bold font-sans mt-2 animate-bounce flex items-center">
                <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Deployed kits successfully!
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[#0d0d1f] p-4 rounded-2xl border border-white/5 font-sans">
        
        {/* Search */}
        <div className="relative w-full md:max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="Search by student name, school, or taluk..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#05050f] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400"
          />
        </div>

        {/* Toggle Pills */}
        <div className="flex items-center space-x-1.5 bg-[#05050f] p-1 rounded-xl border border-white/10 flex-shrink-0">
          {(['ALL', 'HIGH', 'MEDIUM'] as const).map(f => (
            <button
              key={f}
              onClick={() => setSelectedRiskFilter(f)}
              className={`px-3.5 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                selectedRiskFilter === f
                  ? 'bg-cyan-500 text-black font-extrabold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {f === 'ALL' ? 'All Risk' : f === 'HIGH' ? 'High Risk' : 'Medium Risk'}
            </button>
          ))}
        </div>

      </div>

      {/* Student Alert Table */}
      <div className="glow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-sans">
            <thead>
              <tr className="border-b border-white/5 text-slate-500 font-mono-header uppercase text-[10px] bg-white/[0.01]">
                <th className="py-3.5 px-4">Student Name</th>
                <th className="py-3.5 px-4">School Name</th>
                <th className="py-3.5 px-4 text-center">Grade</th>
                <th className="py-3.5 px-4 text-center">Attendance</th>
                <th className="py-3.5 px-4 text-center">Language Gap</th>
                <th className="py-3.5 px-4 text-center">Dropout Risk</th>
                <th className="py-3.5 px-4">Primary Trigger Tags</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredAlerts.length > 0 ? (
                filteredAlerts.map((student) => (
                  <tr key={student.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    
                    {/* Student Name + Location */}
                    <td className="py-3.5 px-4">
                      <div>
                        <div className="font-bold text-white text-xs">{student.name}</div>
                        <div className="text-[10px] text-slate-500 flex items-center mt-0.5">
                          <MapPin className="h-3 w-3 mr-1 text-slate-600" />
                          <span>{student.location} (Karnataka)</span>
                        </div>
                      </div>
                    </td>

                    {/* School Name */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-1.5 text-slate-300">
                        <Building className="h-3.5 w-3.5 text-slate-500" />
                        <span>{student.school}</span>
                      </div>
                    </td>

                    {/* Grade */}
                    <td className="py-3.5 px-4 text-center text-slate-400">
                      {student.grade}
                    </td>

                    {/* Attendance % */}
                    <td className="py-3.5 px-4 text-center font-bold text-white">
                      <span className={student.attendance < 70 ? 'text-pink-500' : student.attendance < 80 ? 'text-purple-400' : 'text-cyan-400'}>
                        {student.attendance}%
                      </span>
                    </td>

                    {/* Language Gap % */}
                    <td className="py-3.5 px-4 text-center text-slate-400 font-mono">
                      {student.langGap}%
                    </td>

                    {/* Dropout Risk Pill */}
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold tracking-wider ${
                        student.risk === 'HIGH'
                          ? 'bg-pink-500/10 text-pink-400 border border-pink-500/20'
                          : student.risk === 'MEDIUM'
                          ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                          : 'bg-white/5 text-slate-400 border border-white/5'
                      }`}>
                        {student.risk} {student.riskPercentage}%
                      </span>
                    </td>

                    {/* Triggers */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1.5">
                        {student.triggers.map((trig, idx) => (
                          <span 
                            key={idx} 
                            className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                              trig === 'CHRONIC' || trig === 'SEVERE'
                                ? 'bg-pink-500/10 text-pink-400 border border-pink-500/20'
                                : trig === 'LINGUISTIC'
                                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {trig}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Action Button */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => navigate('/department/interventions')}
                        className="p-1 rounded bg-white/5 hover:bg-cyan-500 hover:text-black text-slate-400 transition-all cursor-pointer"
                        title="Start Intervention Action"
                      >
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No student alerts match active filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
