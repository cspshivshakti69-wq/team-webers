import React, { useState, useEffect, useMemo } from 'react';
import { 
  Target, 
  TrendingUp, 
  Sparkles, 
  Trash2, 
  Plus, 
  X,
  Bell,
  Megaphone,
  CheckCircle,
  AlertCircle,
  Calendar
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
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useAuth } from '../context/AuthContext';

interface ScoreEntry {
  id: string;
  exam: string;
  subject: string;
  score: string;
  percentage: number;
  date: string;
}

const DEFAULT_SCORES: ScoreEntry[] = [
  { id: 'sc-1', exam: 'Mock Test 2', subject: 'Mathematics', score: '90/100', percentage: 90, date: '2026-05-03' },
  { id: 'sc-2', exam: 'Mock Test 2', subject: 'Chemistry', score: '75/100', percentage: 75, date: '2026-05-02' },
  { id: 'sc-3', exam: 'Mock Test 2', subject: 'Physics', score: '82/100', percentage: 82, date: '2026-05-01' },
  { id: 'sc-4', exam: 'Mock Test 1', subject: 'Mathematics', score: '85/100', percentage: 85, date: '2026-04-07' },
  { id: 'sc-5', exam: 'Mock Test 1', subject: 'Chemistry', score: '70/100', percentage: 70, date: '2026-04-06' },
  { id: 'sc-6', exam: 'Mock Test 1', subject: 'Physics', score: '78/100', percentage: 78, date: '2026-04-05' }
];

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const studentGrade = user?.studentProfile?.grade || 'Grade 12';

  const [scores, setScores] = useState<ScoreEntry[]>(DEFAULT_SCORES);
  const [modalOpen, setModalOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiTips, setAiTips] = useState<string | null>(null);

  // Form states
  const [formExam, setFormExam] = useState('Unit Test 2');
  const [formSubject, setFormSubject] = useState('Mathematics');
  const [formRawScore, setFormRawScore] = useState('');
  const [formMaxScore, setFormMaxScore] = useState('100');
  const [formDate, setFormDate] = useState('2026-06-04');

  // Teacher Uploads (Dynamic notification hook)
  const [teacherUploads, setTeacherUploads] = useState<any[]>([]);
  const [dismissedAnnouncements, setDismissedAnnouncements] = useState<string[]>([]);

  useEffect(() => {
    // Read shared teacher resources targeted to this grade
    const checkUploads = () => {
      try {
        const raw = localStorage.getItem('ks-teacher-uploads');
        if (raw) {
          const uploads = JSON.parse(raw);
          // Filter to grade, e.g. "Grade 12" or matching partial
          const filtered = uploads.filter((u: any) => 
            u.targetGrade.toLowerCase() === studentGrade.toLowerCase() ||
            studentGrade.toLowerCase().includes(u.targetGrade.toLowerCase())
          );
          setTeacherUploads(filtered);
        }
      } catch (err) {
        console.error(err);
      }
    };

    checkUploads();
    // Poll every 5 seconds for simulation
    const interval = setInterval(checkUploads, 5000);
    return () => clearInterval(interval);
  }, [studentGrade]);

  const handleAddScore = (e: React.FormEvent) => {
    e.preventDefault();
    const rawVal = parseFloat(formRawScore);
    const maxVal = parseFloat(formMaxScore);
    if (isNaN(rawVal) || isNaN(maxVal) || maxVal <= 0) return;

    const percentage = Math.round((rawVal / maxVal) * 100);
    const newEntry: ScoreEntry = {
      id: `sc-${Date.now()}`,
      exam: formExam,
      subject: formSubject,
      score: `${rawVal}/${maxVal}`,
      percentage,
      date: formDate
    };

    setScores(prev => [newEntry, ...prev]);
    setFormRawScore('');
    setModalOpen(false);
    setAiTips(null);
  };

  const handleDeleteScore = (id: string) => {
    setScores(prev => prev.filter(s => s.id !== id));
    setAiTips(null);
  };

  // Get AI study tips
  const fetchAiAdvice = async () => {
    setAiLoading(true);
    setAiTips(null);

    try {
      const scoreSummary = scores.map(s => `${s.subject} in ${s.exam}: ${s.percentage}%`).join(', ');
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `I am a student. My mock averages are: ${scoreSummary}. Give 3 personalized study tips for my low topics. Keep it under 120 words.`
        })
      });

      if (response.ok) {
        const data = await response.json();
        setAiTips(data.reply);
      } else {
        throw new Error('Failed');
      }
    } catch {
      // Fallback
      setTimeout(() => {
        setAiTips(`🤖 **AI RECOMMENDATIONS FOR SHIVSHAKTI**

1. 📚 **Target Chemistry:** Focus on revision of Organic Chemistry mechanisms. Solve 10 mock questions daily.
2. ⏱ **Physics Speed:** Take timed mock quizzes (25 mins for 20 questions) to improve time management.
3. 🏆 **Maintain Math:** Leverage your strength (90%) by solving previous papers weekly to maximize ranking.`);
      }, 700);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSaveNote = (note: any) => {
    try {
      const notesKey = 'ks-student-notes-list';
      const existingRaw = localStorage.getItem(notesKey) || '[]';
      const existing = JSON.parse(existingRaw);
      
      const newNote = {
        id: `note-${Date.now()}`,
        name: note.fileName || `${note.title}.pdf`,
        subject: note.subject,
        date: new Date().toLocaleDateString(),
        size: '1.2 MB',
        sharedBy: note.teacherName
      };

      existing.push(newNote);
      localStorage.setItem(notesKey, JSON.stringify(existing));
      alert(`📌 "${newNote.name}" saved to My Notes successfully!`);
    } catch (err) {
      console.error(err);
    }
  };

  // Calculations
  const totalExams = scores.length;
  const overallAvg = totalExams > 0 ? Math.round(scores.reduce((acc, curr) => acc + curr.percentage, 0) / totalExams) : 0;

  // Announcements targeted to class
  const announcements = useMemo(() => {
    return teacherUploads.filter(u => u.type === 'Announcement' && !dismissedAnnouncements.includes(u.id));
  }, [teacherUploads, dismissedAnnouncements]);

  // General content from teacher
  const fromTeacherItems = useMemo(() => {
    return teacherUploads.filter(u => u.type !== 'Announcement');
  }, [teacherUploads]);

  // 1. Weekly Attendance Trend Data (Last 8 Weeks)
  const attendanceTrendData = [
    { week: 'Wk 1', Attendance: 70 },
    { week: 'Wk 2', Attendance: 72 },
    { week: 'Wk 3', Attendance: 75 },
    { week: 'Wk 4', Attendance: 80 },
    { week: 'Wk 5', Attendance: 78 },
    { week: 'Wk 6', Attendance: 82 },
    { week: 'Wk 7', Attendance: 85 },
    { week: 'Wk 8', Attendance: 88 }
  ];

  // 2. Assignment Completion Donut Data
  const assignmentData = [
    { name: 'Completed', value: 9, color: '#00e5ff' },
    { name: 'Missing', value: 3, color: '#ec4899' },
    { name: 'Pending', value: 2, color: '#a855f7' }
  ];

  // 3. Quiz Score History
  const quizHistoryData = [
    { name: 'Mock 1', Math: 80, Physics: 72, Chemistry: 65 },
    { name: 'Mock 2', Math: 85, Physics: 78, Chemistry: 70 },
    { name: 'Mock 3', Math: 90, Physics: 82, Chemistry: 75 }
  ];

  // 4. Study Streak Heatmap Calendar days
  const streakDays = [
    { day: 1, active: true }, { day: 2, active: true }, { day: 3, active: false }, { day: 4, active: true },
    { day: 5, active: true }, { day: 6, active: true }, { day: 7, active: false }, { day: 8, active: true },
    { day: 9, active: true }, { day: 10, active: false }, { day: 11, active: true }, { day: 12, active: true },
    { day: 13, active: true }, { day: 14, active: true }, { day: 15, active: false }, { day: 16, active: true },
    { day: 17, active: true }, { day: 18, active: true }, { day: 19, active: true }, { day: 20, active: false },
    { day: 21, active: true }, { day: 22, active: true }, { day: 23, active: true }, { day: 24, active: true },
    { day: 25, active: false }, { day: 26, active: true }, { day: 27, active: true }, { day: 28, active: true },
    { day: 29, active: true }, { day: 30, active: true }
  ];

  // 5. Subject Weakness Detector
  const weaknessData = [
    { name: 'Chemistry', Score: 70 },
    { name: 'Physics', Score: 77 },
    { name: 'Kannada', Score: 82 },
    { name: 'Mathematics', Score: 90 }
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-[#05050f] text-white space-y-6">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 pb-5">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white font-mono-header">Student Workspace</h2>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Review your grades, access shared content, and evaluate with AI diagnostics.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="mt-4 md:mt-0 flex items-center space-x-1.5 px-4 py-2 rounded-xl border border-cyan-500/35 hover:bg-cyan-500/10 text-cyan-400 text-xs font-bold font-mono transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>+ Add Score</span>
        </button>
      </div>

      {/* Announcements Banner List */}
      {announcements.length > 0 && (
        <div className="space-y-2 font-sans">
          {announcements.map(ann => (
            <div 
              key={ann.id} 
              className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/35 text-white flex items-start justify-between space-x-4 animate-pulse-slow"
            >
              <div className="flex items-start space-x-3 text-xs leading-relaxed">
                <Megaphone className="h-4.5 w-4.5 text-purple-400 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-bold text-purple-300">📢 Announcement from {ann.teacherName}:</span>
                  <p className="text-slate-300 mt-1">{ann.title} - {ann.description}</p>
                </div>
              </div>
              <button 
                onClick={() => setDismissedAnnouncements(prev => [...prev, ann.id])}
                className="text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-sans">
        <div className="glow-card p-5 relative">
          <span className="text-[9px] font-bold tracking-wider text-slate-400 uppercase">Overall Average</span>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-cyan-400 font-mono-header">{overallAvg}%</span>
            <span className="text-slate-500"><TrendingUp className="h-4.5 w-4.5 text-cyan-400 inline ml-1.5" /></span>
          </div>
        </div>
        <div className="glow-card p-5 relative">
          <span className="text-[9px] font-bold tracking-wider text-slate-400 uppercase">Class Enrolled</span>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-lg font-bold text-white font-mono-header">{studentGrade}</span>
          </div>
        </div>
        <div className="glow-card p-5 relative">
          <span className="text-[9px] font-bold tracking-wider text-slate-400 uppercase">Exams Logged</span>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-white font-mono-header">{totalExams}</span>
            <span className="text-slate-500"><Target className="h-4.5 w-4.5 text-slate-500 inline ml-1.5" /></span>
          </div>
        </div>
        <div className="glow-card p-5 relative">
          <span className="text-[9px] font-bold tracking-wider text-slate-400 uppercase">Pending Tasks</span>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-pink-400 font-mono-header">
              {fromTeacherItems.filter(i => i.type === 'Assignment').length}
            </span>
            <span className="text-slate-500 font-bold ml-1.5 text-xs text-slate-400">Tasks</span>
          </div>
        </div>
      </div>

      {/* Secondary layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start font-sans">
        
        {/* LEFT PANEL: 5 PERSONAL ANALYSIS GRAPHS (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* 1. Attendance Trend (8 Weeks) */}
            <div className="glow-card p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4 flex items-center space-x-1.5">
                <TrendingUp className="h-4 w-4 text-cyan-400" />
                <span>Attendance Trend (Weekly)</span>
              </h3>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={attendanceTrendData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" />
                    <XAxis dataKey="week" stroke="#475569" fontSize={9} />
                    <YAxis stroke="#475569" fontSize={9} domain={[60, 100]} />
                    <Tooltip contentStyle={{ backgroundColor: '#0d0d1f', border: '1px solid rgba(255,255,255,0.08)' }} />
                    <Line type="monotone" dataKey="Attendance" stroke="#00e5ff" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 2. Assignment Completion Rate Donut */}
            <div className="glow-card p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4 flex items-center space-x-1.5">
                <CheckCircle className="h-4 w-4 text-emerald-400" />
                <span>Task Submission Rates</span>
              </h3>
              <div className="h-40 flex items-center justify-between">
                <div className="h-full w-1/2">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={assignmentData}
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={45}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {assignmentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-1/2 space-y-1.5 text-[10px] text-slate-400">
                  {assignmentData.map(entry => (
                    <div key={entry.name} className="flex items-center space-x-2">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
                      <span className="font-bold text-white">{entry.name}:</span>
                      <span>{entry.value} tasks</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 3. Quiz Score History */}
            <div className="glow-card p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4 flex items-center space-x-1.5">
                <Sparkles className="h-4 w-4 text-purple-400" />
                <span>Quiz Score History</span>
              </h3>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={quizHistoryData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" />
                    <XAxis dataKey="name" stroke="#475569" fontSize={9} />
                    <YAxis stroke="#475569" fontSize={9} domain={[50, 100]} />
                    <Tooltip contentStyle={{ backgroundColor: '#0d0d1f', border: '1px solid rgba(255,255,255,0.08)' }} />
                    <Line type="monotone" dataKey="Math" stroke="#00e5ff" strokeWidth={2} name="Math" />
                    <Line type="monotone" dataKey="Physics" stroke="#a855f7" strokeWidth={2} name="Phys" />
                    <Line type="monotone" dataKey="Chemistry" stroke="#ec4899" strokeWidth={2} name="Chem" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 4. Subject Weakness Detector (Horizontal Bar) */}
            <div className="glow-card p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4 flex items-center space-x-1.5">
                <AlertCircle className="h-4 w-4 text-pink-400" />
                <span>Subject Performance margins</span>
              </h3>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weaknessData} layout="vertical" margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.01)" />
                    <XAxis type="number" domain={[0, 100]} stroke="#475569" fontSize={8} />
                    <YAxis dataKey="name" type="category" stroke="#475569" fontSize={8} width={65} />
                    <Tooltip contentStyle={{ backgroundColor: '#0d0d1f', border: '1px solid rgba(255,255,255,0.08)' }} />
                    <Bar dataKey="Score" fill="#00e5ff" radius={[0, 4, 4, 0]}>
                      {weaknessData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.Score < 75 ? '#ec4899' : '#00e5ff'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 5. Study Streak Heatmap */}
            <div className="glow-card p-5 md:col-span-2 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
                <Calendar className="h-4 w-4 text-cyan-400" />
                <span>Study Streak Calendar (June 2026)</span>
              </h3>
              <div className="grid grid-cols-7 sm:grid-cols-10 md:grid-cols-15 gap-1.5">
                {streakDays.map(d => (
                  <div 
                    key={d.day}
                    className={`h-6 w-6 rounded flex items-center justify-center text-[10px] font-bold border transition-colors ${
                      d.active 
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-sm shadow-emerald-500/5' 
                        : 'bg-white/5 text-slate-500 border-transparent'
                    }`}
                    title={`Day ${d.day}: ${d.active ? 'Active Study Log' : 'No logs'}`}
                  >
                    {d.day}
                  </div>
                ))}
              </div>
              <p className="text-[9px] text-slate-500">Green cells represent days with active quizzes, notes downloads, or lectures reviewed.</p>
            </div>

          </div>

          {/* Scores History Grid */}
          <div className="glow-card p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4">
              📝 Academic Score Registry
            </h3>
            <div className="space-y-3.5">
              {scores.map(entry => (
                <div key={entry.id} className="p-3 bg-white/[0.01] border border-white/5 rounded-xl flex items-center justify-between text-xs hover:border-white/10 transition-colors">
                  <div>
                    <div className="font-bold text-white">{entry.exam} - {entry.subject}</div>
                    <span className="text-[10px] text-slate-500 mt-1 block">📅 {entry.date}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-slate-300 font-bold font-mono">{entry.score}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      entry.percentage >= 80 ? 'bg-cyan-500/10 text-cyan-400' :
                      entry.percentage >= 65 ? 'bg-purple-500/10 text-purple-400' :
                      'bg-pink-500/10 text-pink-400'
                    }`}>{entry.percentage}%</span>
                    <button 
                      onClick={() => handleDeleteScore(entry.id)}
                      className="text-slate-500 hover:text-red-400 p-1 rounded hover:bg-white/5 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT PANEL: FROM TEACHER RESOURCE CENTER (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Widget: From Teacher Resource Center */}
          <div className="glow-card p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
              <Bell className="h-4.5 w-4.5 text-cyan-400 animate-swing" />
              <span>Resources From Teacher ({fromTeacherItems.length})</span>
            </h3>

            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
              {fromTeacherItems.length > 0 ? (
                fromTeacherItems.map(item => {
                  const isNotes = item.type === 'Notes';
                  const isAssignment = item.type === 'Assignment';
                  
                  return (
                    <div key={item.id} className="p-3 rounded-xl border border-white/5 bg-white/[0.01] hover:border-white/10 transition-colors text-xs space-y-2">
                      <div className="flex justify-between items-start">
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase ${
                          isNotes ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
                          isAssignment ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                          'bg-pink-500/10 text-pink-400 border border-pink-500/20'
                        }`}>
                          {item.type}
                        </span>
                        <span className="text-[9px] text-slate-500 font-mono">from {item.teacherName}</span>
                      </div>
                      
                      <div>
                        <div className="font-bold text-white">{item.title}</div>
                        <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">{item.description}</p>
                      </div>

                      {isAssignment && (
                        <div className="text-[9px] text-slate-500 flex justify-between font-mono bg-white/5 p-1.5 rounded">
                          <span>📅 Due: {item.dueDate}</span>
                          <span>Max: {item.maxMarks} marks</span>
                        </div>
                      )}

                      <div className="flex justify-end pt-1 space-x-2">
                        {isNotes && (
                          <button
                            type="button"
                            onClick={() => handleSaveNote(item)}
                            className="px-2.5 py-1 rounded text-[10px] font-bold border border-cyan-500/20 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 cursor-pointer"
                          >
                            Save to My Notes
                          </button>
                        )}
                        {!isNotes && (
                          <button
                            type="button"
                            onClick={() => alert(`Simulating opening targeted resource: ${item.title}`)}
                            className="px-2.5 py-1 rounded text-[10px] font-bold border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 cursor-pointer"
                          >
                            Open Task
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-10 text-[10px] text-slate-500 font-sans">
                  No materials shared by the teacher yet.
                </div>
              )}
            </div>
          </div>

          {/* AI Advisor Panel */}
          <div className="glow-card p-6 border-purple-500/20 bg-gradient-to-r from-[#0d0d1f] to-purple-950/10 relative overflow-hidden font-sans space-y-4">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl"></div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center space-x-1.5">
                <Sparkles className="h-4.5 w-4.5" />
                <span>AI Diagnostics & Advice</span>
              </h3>
              <p className="text-[10px] text-slate-400 mt-1">
                Evaluate logged scores to formulate tailored subject study recommendations.
              </p>
            </div>

            {aiTips ? (
              <div className="p-3 bg-[#05050f]/80 rounded-xl border border-white/5 text-[11px] text-slate-300 leading-relaxed font-mono whitespace-pre-line">
                {aiTips}
              </div>
            ) : null}

            <button
              onClick={fetchAiAdvice}
              disabled={aiLoading}
              className="w-full btn-gradient py-2 rounded-xl text-xs font-bold shadow-lg shadow-purple-500/15 flex items-center justify-center cursor-pointer text-white"
            >
              {aiLoading ? 'Evaluating Scores...' : '→ Get AI Study Advice'}
            </button>
          </div>

        </div>

      </div>

      {/* SCORE CREATION MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleAddScore} className="max-w-md w-full bg-[#0d0d1f] border border-white/10 rounded-2xl p-6 font-sans text-xs text-white space-y-4">
            <h3 className="text-md font-bold text-white font-mono-header">Add Assessment Score</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Assessment / Exam</label>
                <input 
                  type="text" 
                  value={formExam} 
                  onChange={(e) => setFormExam(e.target.value)}
                  className="w-full bg-[#05050f] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none" 
                  required 
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Subject</label>
                  <select 
                    value={formSubject} 
                    onChange={(e) => setFormSubject(e.target.value)}
                    className="w-full bg-[#0d0d1f] border border-white/10 rounded-lg px-2 py-1 text-xs focus:outline-none cursor-pointer"
                  >
                    <option>Mathematics</option>
                    <option>Physics</option>
                    <option>Chemistry</option>
                    <option>Biology</option>
                    <option>English</option>
                    <option>Kannada</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Date</label>
                  <input 
                    type="date" 
                    value={formDate} 
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full bg-[#05050f] border border-white/10 rounded-lg px-2 py-1 text-xs focus:outline-none font-mono" 
                    required 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Marks Obtained</label>
                  <input 
                    type="number" 
                    placeholder="90" 
                    value={formRawScore} 
                    onChange={(e) => setFormRawScore(e.target.value)}
                    className="w-full bg-[#05050f] border border-white/10 rounded-lg px-2 py-1 text-xs text-center focus:outline-none font-mono" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Out of (Max Marks)</label>
                  <input 
                    type="number" 
                    value={formMaxScore} 
                    onChange={(e) => setFormMaxScore(e.target.value)}
                    className="w-full bg-[#05050f] border border-white/10 rounded-lg px-2 py-1 text-xs text-center focus:outline-none font-mono" 
                    required 
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button 
                type="button" 
                onClick={() => setModalOpen(false)} 
                className="px-3.5 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-4 py-1.5 rounded-lg btn-gradient text-white cursor-pointer font-bold"
              >
                Save Score
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
