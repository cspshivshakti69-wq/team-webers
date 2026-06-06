import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building, 
  TrendingDown, 
  AlertTriangle, 
  Map, 
  Search, 
  Filter, 
  ExternalLink
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';

interface DistrictData {
  id: string;
  name: string;
  risk: 'high' | 'elevated' | 'moderate' | 'low';
  riskPercentage: number;
  schoolsCount: number;
  studentsCount: number;
  atRiskCount: number;
}

const DISTRICTS_INFO: Record<string, DistrictData> = {
  Bangalore: { id: 'bangalore', name: 'Bangalore', risk: 'high', riskPercentage: 84.5, schoolsCount: 5, studentsCount: 650, atRiskCount: 110 },
  Chamarajanagar: { id: 'chamarajanagar', name: 'Chamarajanagar', risk: 'high', riskPercentage: 81.2, schoolsCount: 2, studentsCount: 220, atRiskCount: 55 },
  Belagavi: { id: 'belagavi', name: 'Belagavi', risk: 'elevated', riskPercentage: 74.8, schoolsCount: 3, studentsCount: 380, atRiskCount: 48 },
  Dakshina: { id: 'dakshina', name: 'Dakshina Kannada', risk: 'elevated', riskPercentage: 68.4, schoolsCount: 4, studentsCount: 410, atRiskCount: 42 },
  Mysore: { id: 'mysore', name: 'Mysore', risk: 'moderate', riskPercentage: 58.1, schoolsCount: 3, studentsCount: 420, atRiskCount: 35 },
  Tumkur: { id: 'tumkur', name: 'Tumkur', risk: 'moderate', riskPercentage: 55.4, schoolsCount: 2, studentsCount: 310, atRiskCount: 22 },
  Shimoga: { id: 'shimoga', name: 'Shimoga', risk: 'low', riskPercentage: 42.1, schoolsCount: 2, studentsCount: 290, atRiskCount: 12 },
  Udupi: { id: 'udupi', name: 'Udupi', risk: 'low', riskPercentage: 38.6, schoolsCount: 3, studentsCount: 281, atRiskCount: 8 }
};

const INITIAL_SCHOOLS = [
  { id: 'sch-1', name: 'GHPS Mangaluru Port', taluk: 'Mangaluru', riskIndex: 87.4, medium: 'Kannada', enrolled: 124, status: 'Needs Bridge Kit' },
  { id: 'sch-2', name: 'GHPS Bantwal Rural', taluk: 'Bantwal', riskIndex: 76.8, medium: 'Kannada', enrolled: 85, status: 'Needs Home Visit' },
  { id: 'sch-3', name: 'GHS Puttur Town', taluk: 'Puttur', riskIndex: 69.4, medium: 'Kannada', enrolled: 198, status: 'Active Support' },
  { id: 'sch-4', name: 'GHPS Hunsur Forest Edge', taluk: 'Hunsur', riskIndex: 82.1, medium: 'Kannada', enrolled: 110, status: 'Needs Transport Subsidy' },
  { id: 'sch-5', name: 'GHS Mysore South', taluk: 'Mysore', riskIndex: 51.5, medium: 'Kannada', enrolled: 154, status: 'Stable' },
  { id: 'sch-6', name: 'GHPS Udupi Fishery', taluk: 'Udupi', riskIndex: 45.2, medium: 'Bilingual', enrolled: 98, status: 'Stable' },
  { id: 'sch-7', name: 'GHPS Kundapura Coast', taluk: 'Kundapura', riskIndex: 61.2, medium: 'Kannada', enrolled: 132, status: 'Pending Review' }
];

export const DepartmentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMedium, setFilterMedium] = useState('All');
  const [onlyHighRisk, setOnlyHighRisk] = useState(false);

  const handleDistrictClick = (districtId: string) => {
    if (selectedDistrict === districtId) {
      setSelectedDistrict(null);
    } else {
      setSelectedDistrict(districtId);
    }
  };

  // Load schools dynamically
  const schools = React.useMemo(() => {
    const saved = localStorage.getItem('ks-schools-registry-details');
    return saved ? JSON.parse(saved) : INITIAL_SCHOOLS;
  }, []);

  // Enrolment Trends chart data
  const enrolmentTrendsData = React.useMemo(() => {
    const saved = localStorage.getItem('ks-enrolment-data');
    if (saved) {
      return JSON.parse(saved).map((e: any) => ({
        year: e.year,
        English: e.englishCount,
        Kannada: e.kannadaCount
      }));
    }
    return [
      { year: '2022', English: 38, Kannada: 62 },
      { year: '2023', English: 44, Kannada: 56 },
      { year: '2024', English: 50, Kannada: 50 },
      { year: '2025', English: 55, Kannada: 45 },
      { year: '2026', English: 61, Kannada: 39 }
    ];
  }, []);

  // Thresholds
  const thresholds = React.useMemo(() => {
    const saved = localStorage.getItem('ks-analytics-thresholds');
    return saved ? JSON.parse(saved) : { high: 80, medium: 65, attendanceTrigger: 75, languageGap: 70 };
  }, []);

  // Dropout Risk Index by Taluk data (aggregate from schools)
  const talukRiskData = React.useMemo(() => {
    const defaultData = [
      { name: 'Mangaluru', Risk: 82 },
      { name: 'Puttur', Risk: 68 },
      { name: 'Bantwal', Risk: 76 },
      { name: 'Udupi', Risk: 45 },
      { name: 'Kundapura', Risk: 59 },
      { name: 'Mysore', Risk: 52 },
      { name: 'Narasimpur', Risk: 71 },
      { name: 'Hunsur', Risk: 80 }
    ];
    // Attempt to aggregate or map
    const talukMap: Record<string, { total: number, count: number }> = {};
    schools.forEach((s: any) => {
      if (!talukMap[s.taluk]) {
        talukMap[s.taluk] = { total: 0, count: 0 };
      }
      talukMap[s.taluk].total += s.riskIndex;
      talukMap[s.taluk].count += 1;
    });

    const list = Object.keys(talukMap).map(name => ({
      name,
      Risk: Math.round(talukMap[name].total / talukMap[name].count)
    }));

    return list.length > 0 ? list : defaultData;
  }, [schools]);

  // Filtered Schools
  const filteredSchools = schools.filter((school: any) => {
    if (selectedDistrict) {
      if (selectedDistrict === 'Dakshina' && !['Mangaluru', 'Puttur', 'Bantwal'].includes(school.taluk)) return false;
      if (selectedDistrict === 'Mysore' && !['Mysore', 'Hunsur'].includes(school.taluk)) return false;
      if (selectedDistrict === 'Udupi' && !['Udupi', 'Kundapura'].includes(school.taluk)) return false;
      if (!['Dakshina', 'Mysore', 'Udupi'].includes(selectedDistrict)) return false;
    }

    if (searchQuery && !school.name.toLowerCase().includes(searchQuery.toLowerCase()) && !school.taluk.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    if (filterMedium !== 'All' && school.medium !== filterMedium) {
      return false;
    }

    if (onlyHighRisk && school.riskIndex < thresholds.high) {
      return false;
    }

    return true;
  });

  // Calculate filtered stats
  const activeDistrictInfo = selectedDistrict ? DISTRICTS_INFO[selectedDistrict] : null;
  const schoolsCount = activeDistrictInfo ? activeDistrictInfo.schoolsCount : 20;
  const studentsCount = activeDistrictInfo ? activeDistrictInfo.studentsCount : 2961;
  const atRiskCount = activeDistrictInfo ? activeDistrictInfo.atRiskCount : 319;
  const declineRate = activeDistrictInfo ? (activeDistrictInfo.risk === 'high' ? '6.8%' : activeDistrictInfo.risk === 'low' ? '3.2%' : '5.6%') : '5.6%';

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-[#05050f] text-white space-y-6">
      
      {/* Title Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 pb-5">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white font-mono-header">Dashboard</h2>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Real-time dropout predictive modeling and linguistic assessment analytics.
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-2 px-3.5 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-950/20 text-emerald-400 text-xs font-bold font-mono">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>SYSTEM INTEGRITY: 100%</span>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1 */}
        <div className="glow-card p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Monitored Schools</span>
            <Building className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="mt-4 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-cyan-400 font-mono-header">{schoolsCount}</span>
            <span className="text-xs text-slate-500">/ {studentsCount} Students</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-2 font-sans">Government institutes across 8 regions.</p>
        </div>

        {/* Card 2 */}
        <div className="glow-card p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Enrolment Trend</span>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </div>
          <div className="mt-4 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-red-500 font-mono-header">-{declineRate}</span>
            <span className="text-xs text-slate-500">Annualized Decline</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-2 font-sans">Calculated across Kannada-medium rosters.</p>
        </div>

        {/* Card 3 */}
        <div className="glow-card p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">At-Risk Students</span>
            <AlertTriangle className="h-4 w-4 text-pink-500" />
          </div>
          <div className="mt-4 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-pink-500 font-mono-header">{atRiskCount}</span>
            <span className="text-xs text-slate-500 font-sans">Require Interventions</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-2 font-sans">Triggered by attendance & language gaps.</p>
        </div>

        {/* Card 4 */}
        <div className="glow-card p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Districts Monitored</span>
            <Map className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="mt-4 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-white font-mono-header">8</span>
            <span className="text-xs text-slate-500 font-sans">Active Regions Mapped</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-2 font-sans">Select a region below to filter metrics.</p>
        </div>

      </div>

      {/* Map + Enrollment Line Chart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Clickable Map (Left Panel, 5 Cols) */}
        <div className="lg:col-span-5 glow-card p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold tracking-wider uppercase mb-1">Interactive Karnataka Risk Map</h3>
            <p className="text-[10px] text-slate-400 font-sans mb-4">
              Click a district below to filter dashboard statistics and schools list.
            </p>
          </div>

          {/* SVG Map Container */}
          <div className="flex items-center justify-center py-4 relative">
            <svg viewBox="0 0 400 420" className="w-full max-w-[280px] h-auto">
              
              {/* Belagavi */}
              <g className="cursor-pointer group" onClick={() => handleDistrictClick('Belagavi')}>
                <path d="M 80 50 L 140 40 L 160 80 L 120 120 L 70 90 Z" 
                      fill={selectedDistrict === 'Belagavi' ? '#a855f7' : '#9333ea'} 
                      stroke={selectedDistrict === 'Belagavi' ? '#00e5ff' : 'rgba(255,255,255,0.15)'} 
                      strokeWidth={selectedDistrict === 'Belagavi' ? 2 : 1}
                      className="transition-all duration-200 hover:opacity-80" />
                <text x="115" y="75" fill="white" fontSize="10" fontWeight="bold" className="pointer-events-none text-center">Belagavi</text>
              </g>

              {/* Shimoga */}
              <g className="cursor-pointer group" onClick={() => handleDistrictClick('Shimoga')}>
                <path d="M 80 150 L 130 140 L 140 190 L 90 200 Z" 
                      fill={selectedDistrict === 'Shimoga' ? '#00e5ff' : '#cbd5e1'} 
                      stroke={selectedDistrict === 'Shimoga' ? '#ffffff' : 'rgba(255,255,255,0.15)'}
                      strokeWidth={selectedDistrict === 'Shimoga' ? 2 : 1}
                      className="transition-all duration-200 hover:opacity-80" />
                <text x="105" y="175" fill="black" fontSize="9" fontWeight="bold" className="pointer-events-none">Shimoga</text>
              </g>

              {/* Udupi */}
              <g className="cursor-pointer group" onClick={() => handleDistrictClick('Udupi')}>
                <path d="M 50 210 L 95 210 L 80 250 L 45 240 Z" 
                      fill={selectedDistrict === 'Udupi' ? '#00e5ff' : '#cbd5e1'} 
                      stroke={selectedDistrict === 'Udupi' ? '#ffffff' : 'rgba(255,255,255,0.15)'}
                      strokeWidth={selectedDistrict === 'Udupi' ? 2 : 1}
                      className="transition-all duration-200 hover:opacity-80" />
                <text x="56" y="232" fill="black" fontSize="9" fontWeight="bold" className="pointer-events-none">Udupi</text>
              </g>

              {/* Dakshina Kannada */}
              <g className="cursor-pointer group" onClick={() => handleDistrictClick('Dakshina')}>
                <path d="M 80 255 L 125 245 L 110 300 L 70 290 Z" 
                      fill={selectedDistrict === 'Dakshina' ? '#a855f7' : '#9333ea'} 
                      stroke={selectedDistrict === 'Dakshina' ? '#00e5ff' : 'rgba(255,255,255,0.15)'}
                      strokeWidth={selectedDistrict === 'Dakshina' ? 2 : 1}
                      className="transition-all duration-200 hover:opacity-80" />
                <text x="83" y="278" fill="white" fontSize="9" fontWeight="bold" className="pointer-events-none">Dakshina</text>
              </g>

              {/* Tumkur */}
              <g className="cursor-pointer group" onClick={() => handleDistrictClick('Tumkur')}>
                <path d="M 180 180 L 230 170 L 240 230 L 190 240 Z" 
                      fill={selectedDistrict === 'Tumkur' ? '#00e5ff' : '#22c55e'} 
                      stroke={selectedDistrict === 'Tumkur' ? '#ffffff' : 'rgba(255,255,255,0.15)'}
                      strokeWidth={selectedDistrict === 'Tumkur' ? 2 : 1}
                      className="transition-all duration-200 hover:opacity-80" />
                <text x="200" y="210" fill="white" fontSize="9" fontWeight="bold" className="pointer-events-none">Tumkur</text>
              </g>

              {/* Bangalore */}
              <g className="cursor-pointer group" onClick={() => handleDistrictClick('Bangalore')}>
                <path d="M 245 235 L 290 225 L 300 270 L 255 280 Z" 
                      fill={selectedDistrict === 'Bangalore' ? '#00e5ff' : '#ec4899'} 
                      stroke={selectedDistrict === 'Bangalore' ? '#ffffff' : 'rgba(255,255,255,0.15)'}
                      strokeWidth={selectedDistrict === 'Bangalore' ? 2 : 1}
                      className="transition-all duration-200 hover:opacity-80" />
                <text x="254" y="258" fill="white" fontSize="9" fontWeight="bold" className="pointer-events-none">Bangalore</text>
              </g>

              {/* Mysore */}
              <g className="cursor-pointer group" onClick={() => handleDistrictClick('Mysore')}>
                <path d="M 130 305 L 180 295 L 195 345 L 140 355 Z" 
                      fill={selectedDistrict === 'Mysore' ? '#00e5ff' : '#22c55e'} 
                      stroke={selectedDistrict === 'Mysore' ? '#ffffff' : 'rgba(255,255,255,0.15)'}
                      strokeWidth={selectedDistrict === 'Mysore' ? 2 : 1}
                      className="transition-all duration-200 hover:opacity-80" />
                <text x="145" y="330" fill="white" fontSize="9" fontWeight="bold" className="pointer-events-none">Mysore</text>
              </g>

              {/* Chamarajanagar */}
              <g className="cursor-pointer group" onClick={() => handleDistrictClick('Chamarajanagar')}>
                <path d="M 197 348 L 250 338 L 240 395 L 190 395 Z" 
                      fill={selectedDistrict === 'Chamarajanagar' ? '#00e5ff' : '#ec4899'} 
                      stroke={selectedDistrict === 'Chamarajanagar' ? '#ffffff' : 'rgba(255,255,255,0.15)'}
                      strokeWidth={selectedDistrict === 'Chamarajanagar' ? 2 : 1}
                      className="transition-all duration-200 hover:opacity-80" />
                <text x="200" y="375" fill="white" fontSize="8" fontWeight="bold" className="pointer-events-none">Chamarajanagar</text>
              </g>

            </svg>
          </div>

          {/* Map Legend */}
          <div className="flex flex-wrap justify-between text-[9px] border-t border-white/5 pt-3 font-sans mt-2">
            <span className="flex items-center"><span className="h-2 w-2 rounded-full bg-pink-500 mr-1.5"></span>🔴 High Risk (&gt;80%)</span>
            <span className="flex items-center"><span className="h-2 w-2 rounded-full bg-purple-600 mr-1.5"></span>🟣 Elevated (65–80%)</span>
            <span className="flex items-center"><span className="h-2 w-2 rounded-full bg-emerald-500 mr-1.5"></span>🟢 Moderate (50–65%)</span>
            <span className="flex items-center"><span className="h-2 w-2 rounded-full bg-slate-300 mr-1.5"></span>⚪ Low Risk (&lt;50%)</span>
          </div>

          {selectedDistrict && (
            <div className="mt-3 bg-purple-950/20 border border-purple-500/20 p-2.5 rounded-xl text-xs flex justify-between items-center">
              <span>Selected Filter: <strong>{DISTRICTS_INFO[selectedDistrict]?.name}</strong></span>
              <button 
                onClick={() => setSelectedDistrict(null)}
                className="text-cyan-400 font-bold hover:underline cursor-pointer"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {/* Enrollment line chart (Right Panel, 7 Cols) */}
        <div className="lg:col-span-7 glow-card p-6 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-sm font-bold tracking-wider uppercase">Enrolment Trends (2022–2026)</h3>
              <p className="text-[10px] text-slate-400 font-sans">
                Annual demographic shifts inside mapped regional schools.
              </p>
            </div>
            <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-white/5 text-slate-400 font-mono">
              MEDIUM COMPARISON
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={enrolmentTrendsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} tickFormatter={(val) => `${val}%`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0d0d1f', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8 }}
                  labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Line type="monotone" dataKey="Kannada" stroke="#00e5ff" strokeWidth={3} activeDot={{ r: 8 }} name="Kannada Medium (%)" />
                <Line type="monotone" dataKey="English" stroke="#a855f7" strokeWidth={3} name="English Medium (%)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Bar Chart (Taluk Risk) + High Risk Schools Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Taluk Risk Bar Chart (Left, 5 Cols) */}
        <div className="lg:col-span-5 glow-card p-6">
          <h3 className="text-sm font-bold tracking-wider uppercase mb-1">Dropout Risk Index by Taluk</h3>
          <p className="text-[10px] text-slate-400 font-sans mb-4">
            Averaged threat quotients (0–100) mapped per region.
          </p>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={talukRiskData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} interval={0} tick={{ fill: '#94a3b8' }} />
                <YAxis stroke="#94a3b8" fontSize={10} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0d0d1f', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8 }}
                  labelStyle={{ color: '#fff' }}
                />
                <Bar dataKey="Risk" fill="#a855f7" radius={[4, 4, 0, 0]} name="Risk Rating" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* High Risk Schools Checklist (Right, 7 Cols) */}
        <div className="lg:col-span-7 glow-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold tracking-wider uppercase font-mono-header">HIGH-RISK SCHOOLS CHECKLIST</h3>
                <p className="text-[10px] text-slate-400 font-sans">
                  Filtered and ranked government institutes requiring intervention logs.
                </p>
              </div>
              
              {/* High Risk filter checkbox button */}
              <button 
                onClick={() => setOnlyHighRisk(!onlyHighRisk)}
                className={`mt-2 sm:mt-0 px-2.5 py-1 rounded text-[10px] font-bold border transition-all cursor-pointer ${
                  onlyHighRisk 
                    ? 'bg-pink-500/20 text-pink-400 border-pink-500/35' 
                    : 'bg-white/5 text-slate-400 border-white/5 hover:border-white/10'
                }`}
              >
                {onlyHighRisk ? '✓ High Risk Only' : 'Filter High Risk (>70%)'}
              </button>
            </div>

            {/* Filter controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <Search className="h-3.5 w-3.5" />
                </span>
                <input
                  type="text"
                  placeholder="Search by school or taluk..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#05050f] border border-white/10 rounded-xl py-2 pl-9 pr-4 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 font-sans"
                />
              </div>

              <div className="flex items-center space-x-2 bg-[#05050f] border border-white/10 rounded-xl px-3 py-1.5">
                <Filter className="h-3.5 w-3.5 text-slate-500" />
                <select
                  value={filterMedium}
                  onChange={(e) => setFilterMedium(e.target.value)}
                  className="bg-transparent text-xs text-white focus:outline-none w-full cursor-pointer font-sans"
                >
                  <option value="All">All Mediums</option>
                  <option value="Kannada">Kannada Medium</option>
                  <option value="Bilingual">Bilingual</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-sans">
              <thead>
                <tr className="border-b border-white/5 text-slate-500 font-mono-header uppercase text-[10px]">
                  <th className="py-2.5 px-3">School Name</th>
                  <th className="py-2.5 px-3">Taluk</th>
                  <th className="py-2.5 px-3">Risk Index</th>
                  <th className="py-2.5 px-3">Status / Needs</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSchools.length > 0 ? (
                  filteredSchools.map((school: any) => (
                    <tr key={school.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-3 font-bold text-white">{school.name}</td>
                      <td className="py-3 px-3 text-slate-400">{school.taluk}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          school.riskIndex >= 80 
                            ? 'bg-pink-500/10 text-pink-400 border border-pink-500/20' 
                            : school.riskIndex >= 65 
                            ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                            : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                        }`}>
                          {school.riskIndex}%
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-300 font-medium">{school.status}</td>
                      <td className="py-3 px-3 text-right">
                        <button 
                          onClick={() => navigate('/department/interventions')}
                          className="text-cyan-400 hover:text-white transition-colors cursor-pointer"
                          title="View Interventions"
                        >
                          <ExternalLink className="h-3.5 w-3.5 inline" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">
                      No schools match active filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
};
