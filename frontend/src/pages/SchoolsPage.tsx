import React, { useState } from 'react';
import { 
  Building, 
  Search, 
  Filter, 
  X, 
  TrendingDown, 
  User, 
  History, 
  Sparkles,
  MapPin
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

interface SchoolDetail {
  id: string;
  name: string;
  taluk: string;
  district: string;
  enrolled: number;
  riskIndex: number;
  declineRate: string;
  status: string;
  medium: string;
  enrollmentHistory: { year: string; count: number }[];
  students: { id: string; name: string; grade: string; attendance: number; risk: 'High' | 'Medium' | 'Low'; trigger: string }[];
  interventions: { date: string; type: string; title: string; status: string }[];
}

const SCHOOLS_DATA: SchoolDetail[] = [
  {
    id: 'sch-1',
    name: 'GHPS Mangaluru Port',
    taluk: 'Mangaluru',
    district: 'Dakshina Kannada',
    enrolled: 124,
    riskIndex: 87.4,
    declineRate: '6.4%',
    status: 'Needs Bridge Kit',
    medium: 'Kannada',
    enrollmentHistory: [
      { year: '2022', count: 160 },
      { year: '2023', count: 148 },
      { year: '2024', count: 135 },
      { year: '2025', count: 124 }
    ],
    students: [
      { id: 'st-1', name: 'Abhishek Gowda', grade: 'Grade 6', attendance: 61, risk: 'High', trigger: 'Chronic absenteeism' },
      { id: 'st-2', name: 'Chethan Kumar', grade: 'Grade 7', attendance: 76, risk: 'Medium', trigger: 'Linguistic gap' },
      { id: 'st-3', name: 'Divya M', grade: 'Grade 4', attendance: 85, risk: 'Medium', trigger: 'Socio-economic risk' },
      { id: 'st-4', name: 'Karthik S', grade: 'Grade 6', attendance: 92, risk: 'Low', trigger: 'Stable' }
    ],
    interventions: [
      { date: '2026-05-12', type: 'Bilingual Kit', title: 'Bilingual Bridge Materials Distribution', status: 'Assigned' },
      { date: '2026-04-10', type: 'Absenteeism Call', title: 'Guardian Attendance Engagement', status: 'Resolved' }
    ]
  },
  {
    id: 'sch-2',
    name: 'GHPS Bantwal Rural',
    taluk: 'Bantwal',
    district: 'Dakshina Kannada',
    enrolled: 85,
    riskIndex: 76.8,
    declineRate: '5.2%',
    status: 'Needs Home Visit',
    medium: 'Kannada',
    enrollmentHistory: [
      { year: '2022', count: 110 },
      { year: '2023', count: 102 },
      { year: '2024', count: 91 },
      { year: '2025', count: 85 }
    ],
    students: [
      { id: 'st-5', name: 'Ramya N', grade: 'Grade 4', attendance: 68.8, risk: 'High', trigger: 'Linguistic gap / Chronic' },
      { id: 'st-6', name: 'Girish K', grade: 'Grade 5', attendance: 81, risk: 'Medium', trigger: 'Absenteeism warning' }
    ],
    interventions: [
      { date: '2026-05-18', type: 'Absenteeism Visit', title: 'Home Visit Verification campaign', status: 'In Action' }
    ]
  },
  {
    id: 'sch-3',
    name: 'GHS Puttur Town',
    taluk: 'Puttur',
    district: 'Dakshina Kannada',
    enrolled: 198,
    riskIndex: 69.4,
    declineRate: '4.8%',
    status: 'Active Support',
    medium: 'Kannada',
    enrollmentHistory: [
      { year: '2022', count: 230 },
      { year: '2023', count: 221 },
      { year: '2024', count: 208 },
      { year: '2025', count: 198 }
    ],
    students: [
      { id: 'st-7', name: 'Naveen Rao', grade: 'Grade 8', attendance: 78.5, risk: 'Medium', trigger: 'Linguistic gap' }
    ],
    interventions: [
      { date: '2026-02-15', type: 'Daily Subsidy', title: 'Transport Subsidy Scheme', status: 'Resolved' }
    ]
  },
  {
    id: 'sch-4',
    name: 'GHPS Hunsur Forest Edge',
    taluk: 'Hunsur',
    district: 'Mysore',
    enrolled: 110,
    riskIndex: 82.1,
    declineRate: '6.8%',
    status: 'Needs Transport Subsidy',
    medium: 'Kannada',
    enrollmentHistory: [
      { year: '2022', count: 145 },
      { year: '2023', count: 132 },
      { year: '2024', count: 120 },
      { year: '2025', count: 110 }
    ],
    students: [
      { id: 'st-8', name: 'Pooja Hegde', grade: 'Grade 5', attendance: 59, risk: 'High', trigger: 'Severe commute barrier' }
    ],
    interventions: [
      { date: '2026-05-20', type: 'Commute Scheme', title: 'Forest Edge commute partner network', status: 'Assigned' }
    ]
  },
  {
    id: 'sch-5',
    name: 'GHPS Chamarajanagar Hill',
    taluk: 'Chamarajanagar',
    district: 'Chamarajanagar',
    enrolled: 72,
    riskIndex: 81.2,
    declineRate: '7.1%',
    status: 'Intervention Complete',
    medium: 'Kannada',
    enrollmentHistory: [
      { year: '2022', count: 100 },
      { year: '2023', count: 91 },
      { year: '2024', count: 82 },
      { year: '2025', count: 72 }
    ],
    students: [
      { id: 'st-9', name: 'Manju B', grade: 'Grade 6', attendance: 88, risk: 'Low', trigger: 'Stable' }
    ],
    interventions: [
      { date: '2026-01-20', type: 'Transport', title: 'Daily Commute Transport Subsidy', status: 'Resolved' }
    ]
  }
];

export const SchoolsPage: React.FC = () => {
  const [schools] = useState<SchoolDetail[]>(() => {
    const saved = localStorage.getItem('ks-schools-registry-details');
    return saved ? JSON.parse(saved) : SCHOOLS_DATA;
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [selectedTaluk, setSelectedTaluk] = useState('All');
  const [activeSchool, setActiveSchool] = useState<SchoolDetail | null>(null);

  // Filters mapping
  const filteredSchools = schools.filter(school => {
    if (searchQuery && !school.name.toLowerCase().includes(searchQuery.toLowerCase()) && !school.taluk.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (selectedDistrict !== 'All' && school.district !== selectedDistrict) {
      return false;
    }
    if (selectedTaluk !== 'All' && school.taluk !== selectedTaluk) {
      return false;
    }
    return true;
  });

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-[#05050f] text-white space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 pb-5">
        <div>
          <h2 className="text-2xl font-bold tracking-tight font-mono-header">Schools Directory</h2>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Track student enrolment, risk quotients, and historic intervention logs across Karnataka state government institutes.
          </p>
        </div>
      </div>

      {/* Filter Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#0d0d1f] p-4 rounded-2xl border border-white/5 font-sans">
        
        {/* Search */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="Search school name or taluk..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#05050f] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400"
          />
        </div>

        {/* District Filter */}
        <div className="flex items-center space-x-2 bg-[#05050f] border border-white/10 rounded-xl px-3 py-2">
          <Filter className="h-4 w-4 text-slate-500" />
          <select
            value={selectedDistrict}
            onChange={(e) => {
              setSelectedDistrict(e.target.value);
              setSelectedTaluk('All'); // Reset taluk filter
            }}
            className="bg-transparent text-xs text-white focus:outline-none w-full cursor-pointer"
          >
            <option value="All">All Districts</option>
            <option value="Dakshina Kannada">Dakshina Kannada</option>
            <option value="Mysore">Mysore</option>
            <option value="Chamarajanagar">Chamarajanagar</option>
          </select>
        </div>

        {/* Taluk Filter */}
        <div className="flex items-center space-x-2 bg-[#05050f] border border-white/10 rounded-xl px-3 py-2">
          <Filter className="h-4 w-4 text-slate-500" />
          <select
            value={selectedTaluk}
            onChange={(e) => setSelectedTaluk(e.target.value)}
            className="bg-transparent text-xs text-white focus:outline-none w-full cursor-pointer"
          >
            <option value="All">All Taluks</option>
            {selectedDistrict === 'All' || selectedDistrict === 'Dakshina Kannada' ? (
              <>
                <option value="Mangaluru">Mangaluru</option>
                <option value="Bantwal">Bantwal</option>
                <option value="Puttur">Puttur</option>
              </>
            ) : null}
            {selectedDistrict === 'All' || selectedDistrict === 'Mysore' ? (
              <option value="Hunsur">Hunsur</option>
            ) : null}
            {selectedDistrict === 'All' || selectedDistrict === 'Chamarajanagar' ? (
              <option value="Chamarajanagar">Chamarajanagar</option>
            ) : null}
          </select>
        </div>

      </div>

      {/* Directory Table */}
      <div className="glow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-sans">
            <thead>
              <tr className="border-b border-white/5 text-slate-500 font-mono-header uppercase text-[10px] bg-white/[0.01]">
                <th className="py-3.5 px-4">School Name</th>
                <th className="py-3.5 px-4">Taluk / District</th>
                <th className="py-3.5 px-4 text-center">Medium</th>
                <th className="py-3.5 px-4 text-center">Students</th>
                <th className="py-3.5 px-4 text-center">Decline Rate</th>
                <th className="py-3.5 px-4 text-center">Risk Index</th>
                <th className="py-3.5 px-4">Primary Trigger status</th>
              </tr>
            </thead>
            <tbody>
              {filteredSchools.map((school) => (
                <tr 
                  key={school.id} 
                  onClick={() => setActiveSchool(school)}
                  className="border-b border-white/5 hover:bg-white/[0.02] transition-colors cursor-pointer"
                >
                  <td className="py-4 px-4 font-bold text-white flex items-center space-x-2">
                    <Building className="h-4 w-4 text-cyan-400 flex-shrink-0" />
                    <span>{school.name}</span>
                  </td>
                  <td className="py-4 px-4 text-slate-400">
                    {school.taluk} ({school.district})
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="px-2.5 py-0.5 rounded bg-white/5 text-slate-300 font-medium">
                      {school.medium}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center font-semibold text-white">
                    {school.enrolled}
                  </td>
                  <td className="py-4 px-4 text-center text-red-400 font-mono flex items-center justify-center space-x-1 mt-1">
                    <TrendingDown className="h-3 w-3" />
                    <span>{school.declineRate}</span>
                  </td>
                  <td className="py-4 px-4 text-center">
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
                  <td className="py-4 px-4">
                    <span className="text-slate-300 font-medium">{school.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {activeSchool && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="max-w-3xl w-full bg-[#0d0d1f] border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col font-sans">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-white/5 flex justify-between items-start">
              <div>
                <div className="flex items-center space-x-2 text-xs text-cyan-400 font-bold uppercase tracking-wider mb-1">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{activeSchool.taluk} taluk · {activeSchool.district}</span>
                </div>
                <h3 className="text-xl font-bold text-white font-mono-header flex items-center space-x-2">
                  <Building className="h-5 w-5 text-cyan-400" />
                  <span>{activeSchool.name}</span>
                </h3>
              </div>
              <button 
                onClick={() => setActiveSchool(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-300">
              
              {/* Stats Summary row */}
              <div className="grid grid-cols-3 gap-4 border-b border-white/5 pb-5">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Enrolled Students</span>
                  <div className="text-lg font-bold text-white mt-1">{activeSchool.enrolled}</div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Dropout Threat Index</span>
                  <div className="text-lg font-bold text-pink-400 mt-1">{activeSchool.riskIndex}%</div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Demographic Medium</span>
                  <div className="text-lg font-bold text-cyan-400 mt-1">{activeSchool.medium}</div>
                </div>
              </div>

              {/* Enrollment mini-chart */}
              <div>
                <h4 className="text-xs font-bold uppercase text-white tracking-widest mb-3 flex items-center space-x-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Enrollment Decline curve (2022-2025)</span>
                </h4>
                <div className="h-44 bg-[#05050f] rounded-xl border border-white/5 p-3">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={activeSchool.enrollmentHistory} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                      <XAxis dataKey="year" stroke="#475569" fontSize={10} />
                      <YAxis stroke="#475569" fontSize={10} domain={['dataMin - 10', 'dataMax + 10']} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0d0d1f', border: '1px solid rgba(255,255,255,0.08)' }}
                        labelStyle={{ color: '#fff' }}
                      />
                      <Area type="monotone" dataKey="count" stroke="#00e5ff" fill="rgba(0, 229, 255, 0.1)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Roster & Logs 2-column Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                
                {/* Students list */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase text-white tracking-widest flex items-center space-x-1.5">
                    <User className="h-3.5 w-3.5 text-purple-400" />
                    <span>At-Risk Roster</span>
                  </h4>
                  <div className="space-y-2 bg-[#05050f] p-3 rounded-xl border border-white/5 max-h-[160px] overflow-y-auto">
                    {activeSchool.students.map(std => (
                      <div key={std.id} className="flex justify-between items-center text-xs border-b border-white/5 pb-2 last:border-0 last:pb-0">
                        <div>
                          <div className="font-bold text-white">{std.name} ({std.grade})</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">{std.trigger}</div>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          std.risk === 'High' ? 'bg-pink-500/10 text-pink-400' : 'bg-purple-500/10 text-purple-400'
                        }`}>
                          {std.attendance}% Att.
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Intervention logs */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase text-white tracking-widest flex items-center space-x-1.5">
                    <History className="h-3.5 w-3.5 text-pink-400" />
                    <span>Intervention History</span>
                  </h4>
                  <div className="space-y-2 bg-[#05050f] p-3 rounded-xl border border-white/5 max-h-[160px] overflow-y-auto">
                    {activeSchool.interventions.length > 0 ? (
                      activeSchool.interventions.map((int, idx) => (
                        <div key={idx} className="border-b border-white/5 pb-2 last:border-0 last:pb-0 text-xs">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-white truncate max-w-[130px]">{int.title}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                              int.status === 'Resolved' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'
                            }`}>{int.status}</span>
                          </div>
                          <div className="text-[9px] text-slate-500 mt-0.5 flex justify-between">
                            <span>Type: {int.type}</span>
                            <span>{int.date}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-[11px] text-slate-600">No interventions logged.</div>
                    )}
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
