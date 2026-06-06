import React, { useState, useEffect } from 'react';

import { 
  CheckCircle2, 
  AlertTriangle, 
  Upload, 
  FileText, 
  Video, 
  Megaphone, 
  Activity, 
  UserPlus, 
  Sliders,
  X,
  Search,
  MessageSquare
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

interface StudentData {
  id: string;
  name: string;
  grade: string;
  lastActive: string;
  quizAvg: number;
  assignmentsDone: number;
  assignmentsTotal: number;
  attendance: number;
  riskFlag: 'Low' | 'Medium' | 'High';
  bestSubject?: string;
  lastQuizScore?: string;
  notesUploaded?: number;
  videosWatched?: number;
  scoreTrend?: { name: string; score: number }[];
}

export const TeacherDashboard: React.FC = () => {
  
  // ==========================================
  // STATE DEFINITIONS
  // ==========================================
  const [students, setStudents] = useState<StudentData[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Upload Content Form States
  const [uploadType, setUploadType] = useState<'Notes' | 'Assignment' | 'Video' | 'Announcement'>('Notes');
  const [targetGrade, setTargetGrade] = useState('Grade 6');
  const [subject, setSubject] = useState('Mathematics');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [maxMarks, setMaxMarks] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [fileName, setFileName] = useState('');

  // Notifications / Feeds
  const [activityFeed, setActivityFeed] = useState<any[]>([]);
  const [newRegistrations, setNewRegistrations] = useState<any[]>([]);

  // ==========================================
  // INITIAL SEEDS
  // ==========================================
  useEffect(() => {
    // Seeding mock student records for Teacher
    const defaultStudents: StudentData[] = [
      { 
        id: 'st-101', 
        name: 'Shivshakti Prachande', 
        grade: 'Grade 12', 
        lastActive: 'Today', 
        quizAvg: 78, 
        assignmentsDone: 9, 
        assignmentsTotal: 12, 
        attendance: 88, 
        riskFlag: 'Low',
        bestSubject: 'Mathematics (90%)',
        lastQuizScore: '8/10 (80%) — 2026-05-03',
        notesUploaded: 4,
        videosWatched: 2,
        scoreTrend: [
          { name: 'Unit 1', score: 72 },
          { name: 'Mock 1', score: 78 },
          { name: 'Mock 2', score: 85 }
        ]
      },
      { 
        id: 'st-102', 
        name: 'Manjula Bhat', 
        grade: 'Grade 10', 
        lastActive: 'Yesterday', 
        quizAvg: 54, 
        assignmentsDone: 5, 
        assignmentsTotal: 12, 
        attendance: 62, 
        riskFlag: 'High',
        bestSubject: 'Social Studies (65%)',
        lastQuizScore: '5/10 (50%) — 2026-05-01',
        notesUploaded: 1,
        videosWatched: 1,
        scoreTrend: [
          { name: 'Unit 1', score: 58 },
          { name: 'Mock 1', score: 52 },
          { name: 'Mock 2', score: 54 }
        ]
      },
      { 
        id: 'st-103', 
        name: 'Abhishek Gowda', 
        grade: 'Grade 6', 
        lastActive: 'Today', 
        quizAvg: 89, 
        assignmentsDone: 11, 
        assignmentsTotal: 12, 
        attendance: 94, 
        riskFlag: 'Low',
        bestSubject: 'Science (92%)',
        lastQuizScore: '9/10 (90%) — 2026-05-04',
        notesUploaded: 5,
        videosWatched: 4,
        scoreTrend: [
          { name: 'Unit 1', score: 85 },
          { name: 'Mock 1', score: 88 },
          { name: 'Mock 2', score: 92 }
        ]
      },
      { 
        id: 'st-104', 
        name: 'Ramya N', 
        grade: 'Grade 6', 
        lastActive: '3 days ago', 
        quizAvg: 58, 
        assignmentsDone: 6, 
        assignmentsTotal: 12, 
        attendance: 68, 
        riskFlag: 'High',
        bestSubject: 'English (60%)',
        lastQuizScore: '6/10 (60%) — 2026-04-28',
        notesUploaded: 2,
        videosWatched: 1,
        scoreTrend: [
          { name: 'Unit 1', score: 62 },
          { name: 'Mock 1', score: 55 },
          { name: 'Mock 2', score: 58 }
        ]
      },
      { 
        id: 'st-105', 
        name: 'Chethan Kumar', 
        grade: 'Grade 7', 
        lastActive: 'Today', 
        quizAvg: 72, 
        assignmentsDone: 8, 
        assignmentsTotal: 12, 
        attendance: 76, 
        riskFlag: 'Medium',
        bestSubject: 'Kannada (80%)',
        lastQuizScore: '7/10 (70%) — 2026-05-02',
        notesUploaded: 3,
        videosWatched: 3,
        scoreTrend: [
          { name: 'Unit 1', score: 68 },
          { name: 'Mock 1', score: 70 },
          { name: 'Mock 2', score: 72 }
        ]
      }
    ];

    setStudents(defaultStudents);

    // Seed activities
    setActivityFeed([
      { id: 1, text: 'Abhishek Gowda completed Math Quiz', time: '10 mins ago' },
      { id: 2, text: 'Shivshakti Prachande uploaded Notes PDF', time: '1 hr ago' },
      { id: 3, text: 'Chethan Kumar submitted Chemistry Assignment', time: '3 hrs ago' }
    ]);

    // Seed registrations
    setNewRegistrations([
      { id: 1, name: 'Girisha K', class: 'Grade 6', date: 'Joined today' },
      { id: 2, name: 'Srinidhi Hegde', class: 'Grade 9', date: 'Joined yesterday' }
    ]);
  }, []);

  // Check for newly registered students in local storage and add to newRegistrations
  useEffect(() => {
    try {
      const regUsersRaw = localStorage.getItem('ks-registered-users');
      if (regUsersRaw) {
        const regUsers = JSON.parse(regUsersRaw);
        // Find students
        const studentRegs = regUsers.filter((u: any) => u.role === 'STUDENT').map((u: any) => ({
          id: u.id,
          name: u.name,
          class: u.studentProfile?.grade || 'Grade 9',
          date: 'Newly Registered'
        }));
        if (studentRegs.length > 0) {
          setNewRegistrations(prev => {
            const ids = prev.map(p => p.id);
            const nextRegs = [...studentRegs.filter((s: any) => !ids.includes(s.id)), ...prev];
            return nextRegs;
          });
        }
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  // ==========================================
  // UPLOAD CONTENT LOGIC
  // ==========================================
  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      alert('Please fill out the title field.');
      return;
    }

    const newUpload = {
      id: `up-${Date.now()}`,
      type: uploadType,
      targetGrade,
      subject,
      title,
      description,
      dueDate,
      maxMarks,
      youtubeUrl,
      fileName: fileName || (uploadType === 'Notes' ? 'Notes_Ref.pdf' : ''),
      timestamp: new Date().toISOString(),
      teacherName: 'Venkatesh Kulkarni'
    };

    try {
      const existingRaw = localStorage.getItem('ks-teacher-uploads') || '[]';
      const existing = JSON.parse(existingRaw);
      existing.push(newUpload);
      localStorage.setItem('ks-teacher-uploads', JSON.stringify(existing));
      
      // Save teacher activity feed log
      const feedLog = { id: Date.now(), text: `You uploaded ${uploadType}: "${title}" for ${targetGrade}`, time: 'Just now' };
      setActivityFeed(prev => [feedLog, ...prev]);

      alert(`✅ Successfully shared ${uploadType} with ${targetGrade} ${subject}!`);
      
      // Clear form
      setTitle('');
      setDescription('');
      setDueDate('');
      setMaxMarks('');
      setYoutubeUrl('');
      setFileName('');
    } catch (err) {
      console.error(err);
      alert('❌ Failed to upload content.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
    }
  };

  // Class performance averages chart data
  const classPerformanceData = [
    { name: 'Grade 6', Score: 81 },
    { name: 'Grade 7', Score: 72 },
    { name: 'Grade 8', Score: 68 },
    { name: 'Grade 9', Score: 85 },
    { name: 'Grade 10', Score: 54 },
    { name: 'Grade 12', Score: 78 }
  ];

  const studentsNeedingAttention = students.filter(s => s.quizAvg < 60 || (s.assignmentsTotal - s.assignmentsDone) >= 3);

  // Filter students roster
  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.grade.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-[#05050f] text-white space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 pb-5">
        <div>
          <h2 className="text-2xl font-bold tracking-tight font-mono-header">Teacher Workspace</h2>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Manage your advisory classrooms, track student achievements, and upload curriculum resources.
          </p>
        </div>
      </div>

      {/* Grid of Main widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start font-sans">
        
        {/* LEFT COLUMN: CHARTS, STATS & ROSTER (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Widget 1: Class Performance Overview */}
            <div className="glow-card p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center space-x-1.5">
                <Activity className="h-4 w-4 text-cyan-400" />
                <span>Class Performance Overview</span>
              </h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={classPerformanceData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                    <XAxis dataKey="name" stroke="#475569" fontSize={10} />
                    <YAxis stroke="#475569" fontSize={10} domain={[0, 100]} />
                    <Tooltip contentStyle={{ backgroundColor: '#0d0d1f', border: '1px solid rgba(255,255,255,0.08)' }} />
                    <Bar dataKey="Score" fill="#a855f7" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Widget 2: Students Needing Attention */}
            <div className="glow-card p-5 flex flex-col justify-between min-h-[220px]">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center space-x-1.5">
                  <AlertTriangle className="h-4 w-4 text-pink-400 animate-pulse" />
                  <span>Students Needing Attention ({studentsNeedingAttention.length})</span>
                </h3>
                <div className="space-y-2 max-h-[140px] overflow-y-auto">
                  {studentsNeedingAttention.map(s => (
                    <div 
                      key={s.id} 
                      onClick={() => setSelectedStudent(s)}
                      className="flex justify-between items-center text-xs p-2 rounded bg-white/[0.01] hover:bg-white/5 border border-white/5 cursor-pointer transition-colors"
                    >
                      <div>
                        <span className="font-bold text-white">{s.name}</span>
                        <span className="text-[10px] text-slate-500 ml-2">({s.grade})</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-pink-500/10 text-pink-400">
                        {s.quizAvg < 60 ? `Avg: ${s.quizAvg}%` : `${s.assignmentsTotal - s.assignmentsDone} Missing`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Roster: My Students */}
          <div className="glow-card p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                📚 Active Classroom Roster
              </h3>
              
              {/* Search */}
              <div className="relative max-w-xs w-full">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <Search className="h-3.5 w-3.5" />
                </span>
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#05050f] border border-white/10 rounded-lg py-1.5 pl-9 pr-3 text-xs focus:outline-none"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/5 text-slate-400 uppercase text-[9px] bg-white/[0.01]">
                    <th className="p-3">Student Name</th>
                    <th className="p-3 text-center">Class</th>
                    <th className="p-3 text-center">Last Active</th>
                    <th className="p-3 text-center">Quiz Avg</th>
                    <th className="p-3 text-center">Assignments Done</th>
                    <th className="p-3 text-center">Attendance</th>
                    <th className="p-3 text-center">Risk Level</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map(student => (
                    <tr 
                      key={student.id} 
                      onClick={() => setSelectedStudent(student)}
                      className="border-b border-white/5 hover:bg-white/[0.02] cursor-pointer transition-colors"
                    >
                      <td className="p-3 font-bold text-white">{student.name}</td>
                      <td className="p-3 text-center text-slate-300">{student.grade}</td>
                      <td className="p-3 text-center text-slate-400">{student.lastActive}</td>
                      <td className="p-3 text-center font-mono font-semibold">{student.quizAvg}%</td>
                      <td className="p-3 text-center text-slate-300">
                        {student.assignmentsDone} <span className="text-[10px] text-slate-500">/ {student.assignmentsTotal}</span>
                      </td>
                      <td className="p-3 text-center font-semibold">{student.attendance}%</td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          student.riskFlag === 'High' ? 'bg-pink-500/10 text-pink-400' :
                          student.riskFlag === 'Medium' ? 'bg-purple-500/10 text-purple-400' :
                          'bg-cyan-500/10 text-cyan-400'
                        }`}>
                          {student.riskFlag}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: UPLOAD CONTENT & LOGS (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Widget 3: Upload content form */}
          <form onSubmit={handleUploadSubmit} className="glow-card p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
              <Upload className="h-4.5 w-4.5 text-cyan-400 animate-bounce" />
              <span>Share Content with Students</span>
            </h3>

            {/* Type Selector */}
            <div className="grid grid-cols-4 gap-1.5 p-1 rounded-xl bg-[#05050f] border border-white/5">
              {[
                { id: 'Notes', icon: FileText, label: 'Notes' },
                { id: 'Assignment', icon: Sliders, label: 'Task' },
                { id: 'Video', icon: Video, label: 'Video' },
                { id: 'Announcement', icon: Megaphone, label: 'Alert' }
              ].map(t => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => { setUploadType(t.id as any); setFileName(''); }}
                    className={`flex flex-col items-center p-2 rounded-lg transition-all cursor-pointer ${
                      uploadType === t.id
                        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-sm'
                        : 'text-slate-400 hover:text-white border border-transparent'
                    }`}
                    title={t.label}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-[9px] font-bold mt-1">{t.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Common dropdowns: Grade and Subject */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Target Class</label>
                <select 
                  value={targetGrade} 
                  onChange={(e) => setTargetGrade(e.target.value)}
                  className="w-full bg-[#0d0d1f] border border-white/10 rounded-lg px-2 py-1.5 text-xs cursor-pointer focus:outline-none"
                >
                  {['Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'].map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Subject</label>
                <select 
                  value={subject} 
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-[#0d0d1f] border border-white/10 rounded-lg px-2 py-1.5 text-xs cursor-pointer focus:outline-none"
                >
                  {['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Kannada'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Conditional Title / Fields */}
            <div>
              <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Title / Caption</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={uploadType === 'Announcement' ? 'Important holiday alert...' : 'Chapter 4 Notes PDF...'}
                className="w-full bg-[#05050f] border border-[#ffffff1a] rounded-lg px-3 py-1.5 text-xs focus:outline-none"
                required
              />
            </div>

            {/* Conditional YouTube URL */}
            {uploadType === 'Video' && (
              <div>
                <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">YouTube URL</label>
                <input 
                  type="url" 
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full bg-[#05050f] border border-[#ffffff1a] rounded-lg px-3 py-1.5 text-xs focus:outline-none"
                  required
                />
              </div>
            )}

            {/* Conditional Assignment Info */}
            {uploadType === 'Assignment' && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Due Date</label>
                  <input 
                    type="date" 
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-[#05050f] border border-[#ffffff1a] rounded-lg px-2 py-1 text-xs focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Max Marks</label>
                  <input 
                    type="number" 
                    value={maxMarks}
                    onChange={(e) => setMaxMarks(e.target.value)}
                    placeholder="100"
                    className="w-full bg-[#05050f] border border-[#ffffff1a] rounded-lg px-2 py-1 text-xs text-center focus:outline-none font-mono"
                    required
                  />
                </div>
              </div>
            )}

            {/* Description textarea */}
            <div>
              <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Description / Notes</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Details of resources or submissions..."
                className="w-full bg-[#05050f] border border-[#ffffff1a] rounded-lg px-3 py-1.5 text-xs h-16 resize-none focus:outline-none"
              />
            </div>

            {/* PDF Notes File Uploader UI */}
            {uploadType === 'Notes' && (
              <div className="border border-white/5 rounded-xl p-3.5 bg-white/[0.01] flex items-center justify-between">
                <input 
                  type="file" 
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden" 
                  id="notes-uploader-field" 
                />
                <label htmlFor="notes-uploader-field" className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-[10px] font-bold cursor-pointer transition-colors text-slate-300">
                  Select PDF notes
                </label>
                <span className="text-[10px] text-slate-400 max-w-[150px] truncate font-mono">
                  {fileName || 'No file chosen'}
                </span>
              </div>
            )}

            <button
              type="submit"
              className="w-full btn-gradient py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-cyan-500/20 flex items-center justify-center space-x-1.5 cursor-pointer text-white"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Share Upload</span>
            </button>
          </form>

          {/* New Registrations Feed */}
          <div className="glow-card p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
              <UserPlus className="h-4.5 w-4.5 text-purple-400" />
              <span>Advisory Registrations</span>
            </h3>
            <div className="space-y-3">
              {newRegistrations.map(reg => (
                <div key={reg.id} className="flex justify-between items-center text-xs border-b border-white/5 pb-2 last:border-0 last:pb-0">
                  <div>
                    <div className="font-bold text-white">{reg.name}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{reg.class}</div>
                  </div>
                  <span className="text-[9px] font-mono text-cyan-400 uppercase font-semibold bg-cyan-950/20 border border-cyan-500/10 px-2 py-0.5 rounded">
                    {reg.date}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Feed */}
          <div className="glow-card p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
              <Activity className="h-4.5 w-4.5 text-cyan-400" />
              <span>Recent Activity Feed</span>
            </h3>
            <div className="space-y-3">
              {activityFeed.map(act => (
                <div key={act.id} className="border-b border-white/5 pb-2 last:border-0 last:pb-0 text-xs">
                  <p className="text-slate-300 leading-relaxed font-sans">{act.text}</p>
                  <span className="text-[9px] text-slate-500 font-mono mt-1 block">{act.time}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* STUDENT DETAIL PANEL SIDE DRAWERS */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end">
          <div className="max-w-md w-full bg-[#0d0d1f] border-l border-white/10 h-full p-6 shadow-2xl overflow-y-auto space-y-6 flex flex-col justify-between font-sans text-xs text-white">
            
            {/* Header info */}
            <div>
              <div className="flex justify-between items-start border-b border-white/5 pb-4">
                <div className="flex items-center space-x-3.5">
                  <div className="h-10 w-10 rounded-full bg-cyan-950/80 border border-cyan-500/20 flex items-center justify-center font-bold text-cyan-400 text-lg">
                    {selectedStudent.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white leading-tight font-mono-header">
                      {selectedStudent.name}
                    </h3>
                    <div className="text-[10px] text-slate-400 mt-1">
                      Joined: 2026-03-10 | Last Active: {selectedStudent.lastActive}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedStudent(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Stat card row */}
              <div className="grid grid-cols-3 gap-2 border-b border-white/5 py-4">
                <div className="text-center bg-white/[0.01] border border-white/5 rounded-lg py-2">
                  <span className="text-[8px] font-bold text-slate-500 uppercase">Quiz Average</span>
                  <div className="text-sm font-bold text-white mt-1 font-mono">{selectedStudent.quizAvg}%</div>
                </div>
                <div className="text-center bg-white/[0.01] border border-white/5 rounded-lg py-2">
                  <span className="text-[8px] font-bold text-slate-500 uppercase">Tasks Submitted</span>
                  <div className="text-sm font-bold text-cyan-400 mt-1 font-mono">
                    {selectedStudent.assignmentsDone} <span className="text-[10px] text-slate-500">/ {selectedStudent.assignmentsTotal}</span>
                  </div>
                </div>
                <div className="text-center bg-white/[0.01] border border-white/5 rounded-lg py-2">
                  <span className="text-[8px] font-bold text-slate-500 uppercase">Attendance</span>
                  <div className="text-sm font-bold text-white mt-1 font-mono">{selectedStudent.attendance}%</div>
                </div>
              </div>

              {/* Student detailed logs */}
              <div className="space-y-4 pt-4">
                {/* QUIZ SECTION */}
                <div className="space-y-2">
                  <span className="text-[9px] font-extrabold tracking-wider text-purple-400 uppercase">Quiz Performance</span>
                  <div className="p-3 bg-[#05050f] rounded-xl border border-white/5 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Best Topic:</span>
                      <strong className="text-white">{selectedStudent.bestSubject || 'Mathematics'}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Last Attempt:</span>
                      <span className="text-slate-300 font-mono text-[10px]">{selectedStudent.lastQuizScore || 'No score logged'}</span>
                    </div>
                  </div>
                </div>

                {/* ACTIVITY COUNTS */}
                <div className="space-y-2">
                  <span className="text-[9px] font-extrabold tracking-wider text-cyan-400 uppercase">Learning Activity Logs</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 bg-[#05050f] rounded-xl border border-white/5">
                      <span className="text-slate-400 text-[10px] block">Shared Notes</span>
                      <strong className="text-white font-mono text-sm block mt-1">📚 {selectedStudent.notesUploaded || 0} PDFs</strong>
                    </div>
                    <div className="p-3 bg-[#05050f] rounded-xl border border-white/5">
                      <span className="text-slate-400 text-[10px] block">Lectures Watched</span>
                      <strong className="text-white font-mono text-sm block mt-1">🎥 {selectedStudent.videosWatched || 0} Videos</strong>
                    </div>
                  </div>
                </div>

                {/* SCORE TRENDS CHART */}
                {selectedStudent.scoreTrend && (
                  <div className="space-y-2">
                    <span className="text-[9px] font-extrabold tracking-wider text-slate-400 uppercase">Academic Score Progression</span>
                    <div className="h-28 bg-[#05050f] rounded-xl border border-white/5 p-2 flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={selectedStudent.scoreTrend} margin={{ top: 5, right: 15, left: -30, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" />
                          <XAxis dataKey="name" stroke="#475569" fontSize={8} />
                          <YAxis stroke="#475569" fontSize={8} domain={[50, 100]} />
                          <Tooltip contentStyle={{ backgroundColor: '#0d0d1f', border: '1px solid rgba(255,255,255,0.08)' }} />
                          <Line type="monotone" dataKey="score" stroke="#00e5ff" strokeWidth={2} dot={{ r: 3 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Bottom Actions */}
            <div className="border-t border-white/5 pt-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">Predictive AI Risk Flag:</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  selectedStudent.riskFlag === 'High' ? 'bg-pink-500/10 text-pink-400' :
                  selectedStudent.riskFlag === 'Medium' ? 'bg-purple-500/10 text-purple-400' :
                  'bg-cyan-500/10 text-cyan-400'
                }`}>
                  {selectedStudent.riskFlag} Risk
                </span>
              </div>
              <button
                type="button"
                onClick={() => alert(`Opening chat channel with ${selectedStudent.name}...`)}
                className="w-full btn-gradient py-2.5 rounded-xl font-bold flex items-center justify-center space-x-1.5 cursor-pointer text-white"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Send Message to Student</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
