import React, { useState, useEffect } from 'react';
import { MOCK_PROFILES } from '../context/AuthContext';
import { Search, UserPlus, BookOpen, FileText, UserCheck } from 'lucide-react';

interface TeacherProfile {
  id: string;
  name: string;
  email: string;
  employeeId: string;
  subjects: string[];
  classes: string[];
  schoolName: string;
  status: string;
  uploadsCount: number;
}

export const AdminTeachers: React.FC = () => {
  const [teachers, setTeachers] = useState<TeacherProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');

  // Add/Edit teacher modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<TeacherProfile | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formEmpId, setFormEmpId] = useState('');
  const [formSubjects, setFormSubjects] = useState('');
  const [formClasses, setFormClasses] = useState('');
  const [formSchool, setFormSchool] = useState('Government High School Bengaluru');
  const [formStatus, setFormStatus] = useState('active');

  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = () => {
    try {
      // 1. Static mock profiles
      const mockTeacher = MOCK_PROFILES.TEACHER;
      const staticTeachers: TeacherProfile[] = [
        {
          id: mockTeacher.id,
          name: mockTeacher.name,
          email: mockTeacher.email,
          employeeId: 'EMP-TCH-1002',
          subjects: ['Physics', 'Chemistry'],
          classes: ['Grade 9', 'Grade 10'],
          schoolName: mockTeacher.schoolName || 'Government High School Bengaluru',
          status: 'active',
          uploadsCount: 0
        }
      ];

      // 2. Load registered users
      const registeredRaw = localStorage.getItem('ks-registered-users') || '[]';
      const registeredTeachers = JSON.parse(registeredRaw)
        .filter((u: any) => u.role === 'TEACHER')
        .map((u: any) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          employeeId: u.employeeId || `EMP-TCH-${Math.floor(1000 + Math.random() * 9000)}`,
          subjects: u.subjects || ['Mathematics'],
          classes: u.classes || ['Grade 9'],
          schoolName: u.schoolName || 'Government High School Bengaluru',
          status: u.status || 'active',
          uploadsCount: 0
        }));

      // Combine and filter out duplicates by email
      const combined = [...staticTeachers];
      registeredTeachers.forEach((regTch: TeacherProfile) => {
        if (!combined.some(u => u.email.toLowerCase() === regTch.email.toLowerCase())) {
          combined.push(regTch);
        }
      });

      // 3. Populate uploads count from ks-teacher-uploads local storage
      const uploadsRaw = localStorage.getItem('ks-teacher-uploads') || '[]';
      const uploads = JSON.parse(uploadsRaw);

      combined.forEach(tch => {
        const count = uploads.filter((up: any) => up.authorEmail?.toLowerCase() === tch.email.toLowerCase() || up.author?.toLowerCase() === tch.name.toLowerCase()).length;
        tch.uploadsCount = count;
      });

      setTeachers(combined);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditClick = (tch: TeacherProfile) => {
    setEditingTeacher(tch);
    setFormName(tch.name);
    setFormEmail(tch.email);
    setFormEmpId(tch.employeeId);
    setFormSubjects(tch.subjects.join(', '));
    setFormClasses(tch.classes.join(', '));
    setFormSchool(tch.schoolName);
    setFormStatus(tch.status);
    setIsModalOpen(true);
  };

  const handleAddClick = () => {
    setEditingTeacher(null);
    setFormName('');
    setFormEmail('');
    setFormEmpId('');
    setFormSubjects('Mathematics');
    setFormClasses('Grade 9');
    setFormSchool('Government High School Bengaluru');
    setFormStatus('active');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formEmail) return;

    try {
      const registeredRaw = localStorage.getItem('ks-registered-users') || '[]';
      const registeredUsers = JSON.parse(registeredRaw);

      const subjectsArr = formSubjects.split(',').map(s => s.trim()).filter(Boolean);
      const classesArr = formClasses.split(',').map(c => c.trim()).filter(Boolean);

      if (editingTeacher) {
        // Find in registered users and update or create entry
        const userIdx = registeredUsers.findIndex((u: any) => u.id === editingTeacher.id || u.email.toLowerCase() === editingTeacher.email.toLowerCase());
        
        if (userIdx > -1) {
          registeredUsers[userIdx].name = formName;
          registeredUsers[userIdx].email = formEmail;
          registeredUsers[userIdx].employeeId = formEmpId;
          registeredUsers[userIdx].subjects = subjectsArr;
          registeredUsers[userIdx].classes = classesArr;
          registeredUsers[userIdx].schoolName = formSchool;
          registeredUsers[userIdx].status = formStatus;
        } else {
          // Add static profile override
          registeredUsers.push({
            id: editingTeacher.id,
            name: formName,
            email: formEmail,
            role: 'TEACHER',
            employeeId: formEmpId,
            subjects: subjectsArr,
            classes: classesArr,
            schoolName: formSchool,
            status: formStatus,
            password: 'demo-password-123'
          });
        }
        setToast(`Updated profile details for Teacher: ${formName}`);
      } else {
        // Add new teacher
        registeredUsers.push({
          id: `tch-${Date.now()}`,
          name: formName,
          email: formEmail,
          role: 'TEACHER',
          employeeId: formEmpId || `EMP-TCH-${Math.floor(1000 + Math.random() * 9000)}`,
          subjects: subjectsArr,
          classes: classesArr,
          schoolName: formSchool,
          status: formStatus,
          password: 'demo-password-123'
        });
        setToast(`Successfully added Teacher: ${formName} to system registry.`);
      }

      localStorage.setItem('ks-registered-users', JSON.stringify(registeredUsers));

      // Save to audit log
      const auditTrail = JSON.parse(localStorage.getItem('ks-audit-log') || '[]');
      auditTrail.unshift({
        id: `aud-${Date.now()}`,
        timestamp: new Date().toLocaleString(),
        user: 'Super Admin',
        action: editingTeacher ? 'Updated Teacher Details' : 'Created Teacher Account',
        details: `Teacher: ${formName} (${formEmail})`
      });
      localStorage.setItem('ks-audit-log', JSON.stringify(auditTrail.slice(0, 50)));

      setIsModalOpen(false);
      loadTeachers();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredTeachers = teachers.filter(tch => {
    const matchesSearch = tch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tch.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tch.schoolName.toLowerCase().includes(searchQuery.toLowerCase());
    if (selectedSubject === 'All') return matchesSearch;
    return matchesSearch && tch.subjects.some(s => s.toLowerCase() === selectedSubject.toLowerCase());
  });

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-[#05050f] text-white space-y-6">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 pb-5">
        <div>
          <span className="text-xs font-bold text-purple-400 uppercase tracking-widest font-mono">Faculties</span>
          <h2 className="text-2xl font-bold tracking-tight mt-1 font-mono-header">Teachers Directory</h2>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Oversee certified teacher details, map subjects and instruction classes, and monitor digital content uploads and logs.
          </p>
        </div>
        <div>
          <button
            onClick={handleAddClick}
            className="btn-gradient px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center space-x-1.5 cursor-pointer shadow-lg shadow-cyan-500/15"
          >
            <UserPlus className="h-4 w-4" />
            <span>Add Faculty</span>
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="p-4 bg-emerald-950/20 border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-xl flex items-center justify-between">
          <span>✅ {toast}</span>
          <button onClick={() => setToast(null)} className="hover:text-white cursor-pointer">✕</button>
        </div>
      )}

      {/* Overview stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 font-sans">
        <div className="bg-white/5 border border-white/5 p-4 rounded-xl flex items-center space-x-3">
          <div className="h-10 w-10 bg-cyan-950/30 text-cyan-400 rounded-lg flex items-center justify-center border border-cyan-500/20">
            <UserCheck className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Total Active Teachers</span>
            <span className="text-xl font-bold text-white mt-0.5 block">{teachers.length} Faculty Members</span>
          </div>
        </div>
        <div className="bg-white/5 border border-white/5 p-4 rounded-xl flex items-center space-x-3">
          <div className="h-10 w-10 bg-emerald-950/30 text-emerald-400 rounded-lg flex items-center justify-center border border-emerald-500/20">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Subjects Supported</span>
            <span className="text-xl font-bold text-white mt-0.5 block">5 Core Subjects</span>
          </div>
        </div>
        <div className="bg-white/5 border border-white/5 p-4 rounded-xl flex items-center space-x-3">
          <div className="h-10 w-10 bg-purple-950/30 text-purple-400 rounded-lg flex items-center justify-center border border-purple-500/20">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Total Digital uploads</span>
            <span className="text-xl font-bold text-white mt-0.5 block">
              {teachers.reduce((acc, curr) => acc + curr.uploadsCount, 0)} Uploaded Files
            </span>
          </div>
        </div>
      </div>

      {/* Filter panel */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#0d0d1f] p-4 rounded-2xl border border-white/5 font-sans">
        <div className="relative sm:col-span-2">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
            <Search className="h-4 w-4" />
          </span>
          <input 
            type="text" 
            placeholder="Search teachers by name, email, or school affiliation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-[#05050f] border border-white/5 focus:border-cyan-500/40 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none transition-all"
          />
        </div>
        <div>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full py-2.5 px-3 bg-[#05050f] border border-white/5 focus:border-cyan-500/40 rounded-xl text-xs text-white focus:outline-none cursor-pointer"
          >
            <option value="All">All Subjects</option>
            <option value="Physics">Physics</option>
            <option value="Chemistry">Chemistry</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Biology">Biology</option>
            <option value="General Knowledge">General Knowledge</option>
          </select>
        </div>
      </div>

      {/* Teachers list table */}
      <div className="glass-morphism rounded-2xl border border-white/5 overflow-hidden font-sans">
        <div className="p-4 border-b border-white/5 bg-[#0d0d1f]/40 flex justify-between items-center font-mono text-[10px]">
          <span className="text-slate-400 uppercase font-bold">Staff Registry ({filteredTeachers.length} Active)</span>
        </div>

        {filteredTeachers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/5 text-slate-400 uppercase font-mono text-[10px]">
                  <th className="p-4">Name / ID</th>
                  <th className="p-4">Subjects Taught</th>
                  <th className="p-4">Assigned Classes</th>
                  <th className="p-4">School Registry</th>
                  <th className="p-4 text-center">Curriculum Uploads</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredTeachers.map(tch => (
                  <tr key={tch.id} className="hover:bg-white/[0.01] transition-colors">
                    
                    <td className="p-4">
                      <div className="font-bold text-white text-sm">{tch.name}</div>
                      <div className="text-slate-400 font-mono text-[10px] mt-0.5">{tch.email}</div>
                      <div className="text-slate-500 font-mono text-[9px] mt-1">ID: {tch.employeeId}</div>
                    </td>

                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {tch.subjects.map(s => (
                          <span key={s} className="px-1.5 py-0.5 bg-cyan-950/30 text-cyan-400 border border-cyan-500/20 rounded text-[9px] font-bold">
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="p-4 font-semibold text-slate-300">
                      {tch.classes.join(', ')}
                    </td>

                    <td className="p-4 text-slate-300 font-semibold">
                      {tch.schoolName}
                    </td>

                    <td className="p-4 text-center">
                      <span className="inline-flex h-6 px-2.5 items-center justify-center rounded-full bg-purple-950/20 border border-purple-500/25 text-purple-400 font-mono font-bold text-[10px]">
                        {tch.uploadsCount} uploads
                      </span>
                    </td>

                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase ${
                        tch.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25' : 'bg-red-500/10 text-red-400 border border-red-500/25 animate-pulse'
                      }`}>
                        {tch.status}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleEditClick(tch)}
                        className="px-2.5 py-1.5 bg-white/5 border border-white/10 hover:border-cyan-500/30 hover:bg-cyan-950/20 text-slate-300 hover:text-cyan-400 rounded-lg transition-all cursor-pointer font-bold"
                      >
                        Map Classes
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center text-slate-600">
            <BookOpen className="h-12 w-12 text-slate-700 mx-auto mb-3" />
            <p className="text-sm font-semibold">No teachers matches search parameters.</p>
          </div>
        )}
      </div>

      {/* Add / Edit Faculty Mapping Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <form 
            onSubmit={handleSave} 
            className="bg-[#0c0c1e] border border-white/10 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200"
          >
            
            <div className="p-4 border-b border-white/5 bg-[#0f0f29]/80 flex justify-between items-center">
              <h3 className="font-bold font-mono-header text-white text-sm">
                {editingTeacher ? 'Modify Faculty Settings' : 'Register New Faculty'}
              </h3>
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              
              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-[#05050f] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400 text-xs"
                  placeholder="Prof. Keshava Murthy"
                  required
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Email Address</label>
                <input 
                  type="email" 
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full bg-[#05050f] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400 text-xs"
                  placeholder="keshava.m@kannadaseva.edu"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Employee ID</label>
                  <input 
                    type="text" 
                    value={formEmpId}
                    onChange={(e) => setFormEmpId(e.target.value)}
                    className="w-full bg-[#05050f] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400 text-xs"
                    placeholder="EMP-TCH-4521"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">School Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="w-full bg-[#05050f] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400 text-xs cursor-pointer"
                  >
                    <option value="active">Active (Taching)</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Subjects (Comma separated)</label>
                <input 
                  type="text" 
                  value={formSubjects}
                  onChange={(e) => setFormSubjects(e.target.value)}
                  className="w-full bg-[#05050f] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400 text-xs"
                  placeholder="Mathematics, Physics, Chemistry"
                  required
                />
                <span className="text-[8px] text-slate-500 mt-1 block">Valid: Physics, Chemistry, Mathematics, Biology, General Knowledge</span>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Assigned Classes (Comma separated)</label>
                <input 
                  type="text" 
                  value={formClasses}
                  onChange={(e) => setFormClasses(e.target.value)}
                  className="w-full bg-[#05050f] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400 text-xs"
                  placeholder="Grade 9, Grade 10, Grade 12"
                  required
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Affiliated School Name</label>
                <input 
                  type="text" 
                  value={formSchool}
                  onChange={(e) => setFormSchool(e.target.value)}
                  className="w-full bg-[#05050f] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400 text-xs"
                  placeholder="Government High School Bengaluru"
                  required
                />
              </div>

            </div>

            <div className="p-4 border-t border-white/5 bg-[#0f0f29]/80 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-white/10 hover:bg-white/5 text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 btn-gradient text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-500/10 cursor-pointer"
              >
                Save Profile
              </button>
            </div>

          </form>
        </div>
      )}

    </div>
  );
};
