import React, { useState, useEffect } from 'react';
import { 
  Building, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Download, 
  Upload, 
  Check, 
  History,
  Sliders,
  User,
  LineChart,
  ClipboardList
} from 'lucide-react';
import Papa from 'papaparse';

interface School {
  id: string;
  name: string;
  diseCode: string;
  taluk: string;
  district: string;
  enrolled: number;
  riskIndex: number;
  medium: string;
  principalName: string;
  contact: string;
  status: 'Active' | 'Inactive' | 'Needs Bridge Kit' | 'Needs Home Visit' | 'Active Support' | 'Needs Transport Subsidy';
}

interface Student {
  id: string;
  name: string;
  schoolName: string;
  grade: string;
  attendance: number;
  riskScore: number;
  status: 'Active' | 'At Risk' | 'Needs Attention';
  notes?: string;
}

interface Enrolment {
  id: string;
  year: string;
  schoolName: string;
  kannadaCount: number;
  englishCount: number;
  total: number;
}

interface Intervention {
  id: string;
  title: string;
  type: string;
  school: string;
  targetDate: string;
  status: 'Assigned' | 'In Action' | 'Resolved';
  officer: string;
  notes?: string;
}

interface Thresholds {
  high: number;
  medium: number;
  attendanceTrigger: number;
  languageGap: number;
}

interface AuditLog {
  timestamp: string;
  editor: string;
  section: string;
  fieldChanged: string;
  oldValue: string;
  newValue: string;
}

export const DataManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'schools' | 'students' | 'enrolment' | 'interventions' | 'thresholds' | 'audit'>('schools');

  // Load username
  const editorName = (() => {
    try {
      const saved = localStorage.getItem('ks-user');
      return saved ? JSON.parse(saved).name : 'Dr. Ramesh Rao';
    } catch {
      return 'Dr. Ramesh Rao';
    }
  })();

  // ==========================================
  // STATE DEFINITIONS
  // ==========================================
  const [schools, setSchools] = useState<School[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [enrolment, setEnrolment] = useState<Enrolment[]>([]);
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [thresholds, setThresholds] = useState<Thresholds>({ high: 80, medium: 65, attendanceTrigger: 75, languageGap: 70 });
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [selectedTaluk, setSelectedTaluk] = useState('All');

  // Modals / Edit states
  const [isSchoolModalOpen, setIsSchoolModalOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const [isInterventionModalOpen, setIsInterventionModalOpen] = useState(false);
  const [editingIntervention, setEditingIntervention] = useState<Intervention | null>(null);

  const [bulkAttendanceVal, setBulkAttendanceVal] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  // ==========================================
  // SEED DEFAULTS ONCE
  // ==========================================
  useEffect(() => {
    const localSchools = localStorage.getItem('ks-schools-registry-details');
    if (localSchools) {
      setSchools(JSON.parse(localSchools));
    } else {
      const defaults: School[] = [
        { id: 'sch-1', name: 'GHPS Mangaluru Port', diseCode: '29240304501', taluk: 'Mangaluru', district: 'Dakshina Kannada', enrolled: 124, riskIndex: 87.4, medium: 'Kannada', principalName: 'Suresh Gowda', contact: '9845012345', status: 'Needs Bridge Kit' },
        { id: 'sch-2', name: 'GHPS Bantwal Rural', diseCode: '29240304502', taluk: 'Bantwal', district: 'Dakshina Kannada', enrolled: 85, riskIndex: 76.8, medium: 'Kannada', principalName: 'Manjula Rao', contact: '9845012346', status: 'Needs Home Visit' },
        { id: 'sch-3', name: 'GHS Puttur Town', diseCode: '29240304503', taluk: 'Puttur', district: 'Dakshina Kannada', enrolled: 198, riskIndex: 69.4, medium: 'Kannada', principalName: 'Devappa K', contact: '9845012347', status: 'Active Support' },
        { id: 'sch-4', name: 'GHPS Hunsur Forest Edge', diseCode: '29240504101', taluk: 'Hunsur', district: 'Mysore', enrolled: 110, riskIndex: 82.1, medium: 'Kannada', principalName: 'Kenchaiah M', contact: '9845012348', status: 'Needs Transport Subsidy' },
        { id: 'sch-5', name: 'GHPS Chamarajanagar Hill', diseCode: '29240604201', taluk: 'Chamarajanagar', district: 'Chamarajanagar', enrolled: 72, riskIndex: 81.2, medium: 'Kannada', principalName: 'Basavaraj S', contact: '9845012349', status: 'Active' }
      ];
      setSchools(defaults);
      localStorage.setItem('ks-schools-registry-details', JSON.stringify(defaults));
    }

    const localStudents = localStorage.getItem('ks-student-records');
    if (localStudents) {
      setStudents(JSON.parse(localStudents));
    } else {
      const defaults: Student[] = [
        { id: 'st-1', name: 'Abhishek Gowda', schoolName: 'GHPS Mangaluru Port', grade: 'Grade 6', attendance: 61, riskScore: 87.4, status: 'At Risk', notes: 'Chronic absenteeism' },
        { id: 'st-2', name: 'Chethan Kumar', schoolName: 'GHPS Mangaluru Port', grade: 'Grade 7', attendance: 76, riskScore: 68.1, status: 'Needs Attention', notes: 'Linguistic gaps' },
        { id: 'st-3', name: 'Divya M', schoolName: 'GHPS Mangaluru Port', grade: 'Grade 4', attendance: 85, riskScore: 45.2, status: 'Active' },
        { id: 'st-4', name: 'Ramya N', schoolName: 'GHPS Bantwal Rural', grade: 'Grade 4', attendance: 68.8, riskScore: 78.4, status: 'At Risk', notes: 'Needs home visits' },
        { id: 'st-5', name: 'Pooja Hegde', schoolName: 'GHPS Hunsur Forest Edge', grade: 'Grade 5', attendance: 59, riskScore: 82.1, status: 'At Risk', notes: 'Severe commute barriers' }
      ];
      setStudents(defaults);
      localStorage.setItem('ks-student-records', JSON.stringify(defaults));
    }

    const localEnrolment = localStorage.getItem('ks-enrolment-data');
    if (localEnrolment) {
      setEnrolment(JSON.parse(localEnrolment));
    } else {
      const defaults: Enrolment[] = [
        { id: 'en-1', year: '2022', schoolName: 'All Schools', kannadaCount: 62, englishCount: 38, total: 100 },
        { id: 'en-2', year: '2023', schoolName: 'All Schools', kannadaCount: 56, englishCount: 44, total: 100 },
        { id: 'en-3', year: '2024', schoolName: 'All Schools', kannadaCount: 50, englishCount: 50, total: 100 },
        { id: 'en-4', year: '2025', schoolName: 'All Schools', kannadaCount: 45, englishCount: 55, total: 100 },
        { id: 'en-5', year: '2026', schoolName: 'All Schools', kannadaCount: 39, englishCount: 61, total: 100 }
      ];
      setEnrolment(defaults);
      localStorage.setItem('ks-enrolment-data', JSON.stringify(defaults));
    }

    const localInterventions = localStorage.getItem('ks-interventions-data');
    if (localInterventions) {
      setInterventions(JSON.parse(localInterventions));
    } else {
      const defaults: Intervention[] = [
        { id: 'int-1', title: 'Bilingual Bridge Materials Distribution', type: 'Bilingual Kit', school: 'GHPS Mangaluru Port', targetDate: '2026-05-12', status: 'Assigned', officer: 'Dr. Ramesh Rao', notes: 'Materials distributed to grades 4-7.' },
        { id: 'int-2', title: 'Home Visit Verification campaign', type: 'Absenteeism Visit', school: 'GHPS Bantwal Rural', targetDate: '2026-05-18', status: 'In Action', officer: 'Dr. Ramesh Rao' }
      ];
      setInterventions(defaults);
      localStorage.setItem('ks-interventions-data', JSON.stringify(defaults));
    }

    const localThresholds = localStorage.getItem('ks-analytics-thresholds');
    if (localThresholds) {
      setThresholds(JSON.parse(localThresholds));
    }

    const localAudit = localStorage.getItem('ks-audit-log');
    if (localAudit) {
      setAuditLogs(JSON.parse(localAudit));
    }
  }, []);

  // Save changes helper with audit log integration
  const logAudit = (section: string, field: string, oldVal: string, newVal: string) => {
    const logEntry: AuditLog = {
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      editor: editorName,
      section,
      fieldChanged: field,
      oldValue: oldVal,
      newValue: newVal
    };
    const nextLogs = [logEntry, ...auditLogs];
    setAuditLogs(nextLogs);
    localStorage.setItem('ks-audit-log', JSON.stringify(nextLogs));
  };

  // ==========================================
  // TAB 1: SCHOOLS CRUD LOGIC
  // ==========================================
  const handleSaveSchool = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = fd.get('name') as string;
    const diseCode = fd.get('diseCode') as string;
    const taluk = fd.get('taluk') as string;
    const district = fd.get('district') as string;
    const enrolled = parseInt(fd.get('enrolled') as string) || 0;
    const riskIndex = parseFloat(fd.get('riskIndex') as string) || 0;
    const medium = fd.get('medium') as string;
    const principalName = fd.get('principalName') as string;
    const contact = fd.get('contact') as string;
    const status = fd.get('status') as School['status'];

    if (editingSchool) {
      const old = schools.find(s => s.id === editingSchool.id);
      const updated = schools.map(s => s.id === editingSchool.id ? { ...s, name, diseCode, taluk, district, enrolled, riskIndex, medium, principalName, contact, status } : s);
      setSchools(updated);
      localStorage.setItem('ks-schools-registry-details', JSON.stringify(updated));
      logAudit('Schools Registry', `Edit School (${name})`, old ? JSON.stringify(old) : '', JSON.stringify({ name, enrolled, riskIndex, status }));
      setEditingSchool(null);
    } else {
      const newSch: School = {
        id: `sch-${Date.now()}`,
        name, diseCode, taluk, district, enrolled, riskIndex, medium, principalName, contact, status
      };
      const updated = [...schools, newSch];
      setSchools(updated);
      localStorage.setItem('ks-schools-registry-details', JSON.stringify(updated));
      logAudit('Schools Registry', `Add School`, '', JSON.stringify(newSch));
    }
    setIsSchoolModalOpen(false);
    alert('Data updated successfully');
  };

  const handleDeleteSchool = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      const updated = schools.filter(s => s.id !== id);
      setSchools(updated);
      localStorage.setItem('ks-schools-registry-details', JSON.stringify(updated));
      logAudit('Schools Registry', 'Delete School', name, 'Deleted');
    }
  };

  // ==========================================
  // TAB 2: STUDENTS CRUD LOGIC
  // ==========================================
  const handleSaveStudent = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = fd.get('name') as string;
    const schoolName = fd.get('schoolName') as string;
    const grade = fd.get('grade') as string;
    const attendance = parseFloat(fd.get('attendance') as string) || 0;
    const riskScore = parseFloat(fd.get('riskScore') as string) || 0;
    const status = fd.get('status') as Student['status'];
    const notes = fd.get('notes') as string;

    if (editingStudent) {
      const old = students.find(s => s.id === editingStudent.id);
      const updated = students.map(s => s.id === editingStudent.id ? { ...s, name, schoolName, grade, attendance, riskScore, status, notes } : s);
      setStudents(updated);
      localStorage.setItem('ks-student-records', JSON.stringify(updated));
      logAudit('Student Records', `Edit Student (${name})`, old ? JSON.stringify(old) : '', JSON.stringify({ name, attendance, riskScore, status }));
      setEditingStudent(null);
    } else {
      const newSt: Student = {
        id: `st-${Date.now()}`,
        name, schoolName, grade, attendance, riskScore, status, notes
      };
      const updated = [...students, newSt];
      setStudents(updated);
      localStorage.setItem('ks-student-records', JSON.stringify(updated));
      logAudit('Student Records', 'Add Student', '', JSON.stringify(newSt));
    }
    setIsStudentModalOpen(false);
  };

  const handleBulkAttendance = () => {
    if (selectedStudentIds.length === 0) {
      alert('Please select at least one student.');
      return;
    }
    const val = parseFloat(bulkAttendanceVal);
    if (isNaN(val) || val < 0 || val > 100) {
      alert('Enter a valid attendance percentage (0-100).');
      return;
    }

    const updated = students.map(s => {
      if (selectedStudentIds.includes(s.id)) {
        return { ...s, attendance: val, riskScore: val < thresholds.attendanceTrigger ? 82 : s.riskScore };
      }
      return s;
    });

    setStudents(updated);
    localStorage.setItem('ks-student-records', JSON.stringify(updated));
    logAudit('Student Records', 'Bulk Attendance Update', `Affected: ${selectedStudentIds.length} students`, `New Attendance: ${val}%`);
    setSelectedStudentIds([]);
    setBulkAttendanceVal('');
    alert('Bulk attendance updated successfully');
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      Papa.parse(e.target.files[0], {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const imported = results.data.map((row: any, index) => ({
            id: `imported-${Date.now()}-${index}`,
            name: row.Name || row.name || 'Unknown',
            schoolName: row.School || row.school || 'GHPS Mangaluru Port',
            grade: row.Grade || row.grade || 'Grade 6',
            attendance: parseFloat(row.Attendance || row.attendance) || 80,
            riskScore: parseFloat(row.RiskScore || row.riskscore) || 50,
            status: (row.Status || row.status || 'Active') as Student['status'],
            notes: row.Notes || row.notes || ''
          }));
          const updated = [...imported, ...students];
          setStudents(updated);
          localStorage.setItem('ks-student-records', JSON.stringify(updated));
          logAudit('Student Records', 'CSV Import', `Count: ${imported.length}`, 'Imported into Registry');
          alert(`Successfully imported ${imported.length} student records!`);
        }
      });
    }
  };

  const handleExportCSV = () => {
    const csv = Papa.unparse(students.map(s => ({
      ID: s.id,
      Name: s.name,
      School: s.schoolName,
      Grade: s.grade,
      Attendance: `${s.attendance}%`,
      RiskScore: `${s.riskScore}%`,
      Status: s.status,
      Notes: s.notes || ''
    })));
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'student_records_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ==========================================
  // TAB 3: ENROLMENT DATA INLINE SAVES
  // ==========================================
  const handleEnrolmentCellChange = (id: string, field: 'kannadaCount' | 'englishCount', val: string) => {
    const num = parseInt(val) || 0;
    const updated = enrolment.map(e => {
      if (e.id === id) {
        const nextKannada = field === 'kannadaCount' ? num : e.kannadaCount;
        const nextEnglish = field === 'englishCount' ? num : e.englishCount;
        return {
          ...e,
          [field]: num,
          total: nextKannada + nextEnglish
        };
      }
      return e;
    });

    setEnrolment(updated);
    localStorage.setItem('ks-enrolment-data', JSON.stringify(updated));
    const old = enrolment.find(e => e.id === id);
    logAudit('Enrolment Data', `Inline Cell Edit (${old?.year})`, `${field}: ${old ? (old as any)[field] : ''}`, `${field}: ${num}`);
  };

  const handleAddEnrolmentRow = () => {
    const lastYear = enrolment.length > 0 ? parseInt(enrolment[enrolment.length - 1].year) : 2025;
    const newRow: Enrolment = {
      id: `en-${Date.now()}`,
      year: String(lastYear + 1),
      schoolName: 'All Schools',
      kannadaCount: 40,
      englishCount: 60,
      total: 100
    };
    const updated = [...enrolment, newRow];
    setEnrolment(updated);
    localStorage.setItem('ks-enrolment-data', JSON.stringify(updated));
    logAudit('Enrolment Data', 'Add Year Row', '', JSON.stringify(newRow));
  };

  // ==========================================
  // TAB 4: INTERVENTIONS CRUD LOGIC
  // ==========================================
  const handleSaveIntervention = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const title = fd.get('title') as string;
    const type = fd.get('type') as string;
    const school = fd.get('school') as string;
    const targetDate = fd.get('targetDate') as string;
    const status = fd.get('status') as Intervention['status'];
    const notes = fd.get('notes') as string;

    if (editingIntervention) {
      const old = interventions.find(i => i.id === editingIntervention.id);
      const updated = interventions.map(i => i.id === editingIntervention.id ? { ...i, title, type, school, targetDate, status, notes } : i);
      setInterventions(updated);
      localStorage.setItem('ks-interventions-data', JSON.stringify(updated));
      logAudit('Interventions', `Edit Intervention (${title})`, old ? JSON.stringify(old) : '', JSON.stringify({ title, status }));
      setEditingIntervention(null);
    } else {
      const newInt: Intervention = {
        id: `int-${Date.now()}`,
        title, type, school, targetDate, status, officer: editorName, notes
      };
      const updated = [...interventions, newInt];
      setInterventions(updated);
      localStorage.setItem('ks-interventions-data', JSON.stringify(updated));
      logAudit('Interventions', 'Add Intervention', '', JSON.stringify(newInt));
    }
    setIsInterventionModalOpen(false);
  };

  const handleDeleteIntervention = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      const updated = interventions.filter(i => i.id !== id);
      setInterventions(updated);
      localStorage.setItem('ks-interventions-data', JSON.stringify(updated));
      logAudit('Interventions', 'Delete Intervention', title, 'Deleted');
    }
  };

  // ==========================================
  // TAB 5: ANALYTICS THRESHOLDS
  // ==========================================
  const handleSaveThresholds = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('ks-analytics-thresholds', JSON.stringify(thresholds));
    logAudit('Analytics Thresholds', 'Save Configurations', '', JSON.stringify(thresholds));
    alert('Analytics thresholds updated successfully');
  };

  // ==========================================
  // EXPORTS
  // ==========================================
  const handleExportAuditLogs = () => {
    const csv = Papa.unparse(auditLogs);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'data_management_audit_log.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtering
  const filteredSchools = schools.filter(s => {
    if (selectedDistrict !== 'All' && s.district !== selectedDistrict) return false;
    if (selectedTaluk !== 'All' && s.taluk !== selectedTaluk) return false;
    if (searchQuery && !s.name.toLowerCase().includes(searchQuery.toLowerCase()) && !s.taluk.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-[#05050f] text-white space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 pb-5">
        <div>
          <h2 className="text-2xl font-bold tracking-tight font-mono-header">⚙️ Data Management Center</h2>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Add, update, or edit live metrics. Change thresholds, registry tables, and track change audit logs.
          </p>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="flex flex-wrap gap-1 bg-[#0d0d1f] p-1 rounded-xl border border-white/5 font-sans max-w-3xl">
        {[
          { id: 'schools', label: 'Schools Registry', icon: Building },
          { id: 'students', label: 'Student Records', icon: User },
          { id: 'enrolment', label: 'Enrolment Data', icon: LineChart },
          { id: 'interventions', label: 'Interventions', icon: ClipboardList },
          { id: 'thresholds', label: 'Thresholds Config', icon: Sliders },
          { id: 'audit', label: 'Audit Logs', icon: History }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setSearchQuery('');
              }}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-cyan-500 text-black font-extrabold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ==========================================
          TAB 1: SCHOOLS REGISTRY
          ========================================== */}
      {activeTab === 'schools' && (
        <div className="space-y-4 font-sans text-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0d0d1f] p-4 rounded-xl border border-white/5">
            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative max-w-xs">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <Search className="h-3.5 w-3.5" />
                </span>
                <input
                  type="text"
                  placeholder="Search school or taluk..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-[#05050f] border border-white/10 rounded-lg py-1.5 pl-9 pr-3 text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* District Filter */}
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="bg-[#05050f] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-cyan-400 cursor-pointer"
              >
                <option value="All">All Districts</option>
                <option value="Dakshina Kannada">Dakshina Kannada</option>
                <option value="Mysore">Mysore</option>
                <option value="Chamarajanagar">Chamarajanagar</option>
              </select>

              {/* Taluk Filter */}
              <select
                value={selectedTaluk}
                onChange={(e) => setSelectedTaluk(e.target.value)}
                className="bg-[#05050f] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-cyan-400 cursor-pointer"
              >
                <option value="All">All Taluks</option>
                <option value="Mangaluru">Mangaluru</option>
                <option value="Bantwal">Bantwal</option>
                <option value="Puttur">Puttur</option>
                <option value="Hunsur">Hunsur</option>
                <option value="Chamarajanagar">Chamarajanagar</option>
              </select>
            </div>

            <button
              onClick={() => { setEditingSchool(null); setIsSchoolModalOpen(true); }}
              className="btn-gradient px-4.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1 cursor-pointer text-white"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add School</span>
            </button>
          </div>

          {/* Directory Table */}
          <div className="glow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/5 text-slate-400 uppercase text-[10px] bg-white/[0.01]">
                    <th className="p-3.5">School Name</th>
                    <th className="p-3.5">Taluk/District</th>
                    <th className="p-3.5 text-center">DISE Code</th>
                    <th className="p-3.5 text-center">Enrolled</th>
                    <th className="p-3.5 text-center">Risk Index</th>
                    <th className="p-3.5 text-center">Status</th>
                    <th className="p-3.5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSchools.map((school) => (
                    <tr key={school.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="p-3.5 font-bold text-white flex items-center space-x-2">
                        <Building className="h-4 w-4 text-cyan-400" />
                        <span>{school.name}</span>
                      </td>
                      <td className="p-3.5 text-slate-400">{school.taluk} ({school.district})</td>
                      <td className="p-3.5 text-center font-mono text-slate-300">{school.diseCode}</td>
                      <td className="p-3.5 text-center font-semibold">{school.enrolled}</td>
                      <td className="p-3.5 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-400">
                          {school.riskIndex}%
                        </span>
                      </td>
                      <td className="p-3.5 text-center text-slate-300">{school.status}</td>
                      <td className="p-3.5 text-center space-x-2">
                        <button 
                          onClick={() => { setEditingSchool(school); setIsSchoolModalOpen(true); }}
                          className="text-cyan-400 hover:text-white p-1 rounded hover:bg-white/5 cursor-pointer"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button 
                          onClick={() => handleDeleteSchool(school.id, school.name)}
                          className="text-slate-500 hover:text-red-400 p-1 rounded hover:bg-white/5 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          TAB 2: STUDENT RECORDS
          ========================================== */}
      {activeTab === 'students' && (
        <div className="space-y-4 font-sans text-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0d0d1f] p-4 rounded-xl border border-white/5">
            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative max-w-xs">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <Search className="h-3.5 w-3.5" />
                </span>
                <input
                  type="text"
                  placeholder="Search student name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-[#05050f] border border-white/10 rounded-lg py-1.5 pl-9 pr-3 text-xs focus:outline-none"
                />
              </div>

              {/* Bulk Attendance Form */}
              <div className="flex items-center space-x-2 bg-[#05050f] px-3 py-1.5 rounded-lg border border-white/10">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Bulk Attendance:</span>
                <input 
                  type="number" 
                  placeholder="85"
                  value={bulkAttendanceVal}
                  onChange={(e) => setBulkAttendanceVal(e.target.value)}
                  className="w-12 bg-transparent text-center focus:outline-none font-bold text-cyan-400"
                />
                <button
                  type="button"
                  onClick={handleBulkAttendance}
                  className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-cyan-500 text-black hover:opacity-90 cursor-pointer"
                >
                  Apply
                </button>
              </div>
            </div>

            {/* CSV Actions */}
            <div className="flex items-center space-x-2">
              <label className="flex items-center space-x-1 px-3 py-2 rounded-xl border border-white/10 hover:bg-white/5 text-xs text-slate-300 font-bold cursor-pointer">
                <Upload className="h-3.5 w-3.5 text-cyan-400" />
                <span>Import CSV</span>
                <input type="file" accept=".csv" onChange={handleImportCSV} className="hidden" />
              </label>
              <button
                onClick={handleExportCSV}
                className="flex items-center space-x-1 px-3 py-2 rounded-xl border border-white/10 hover:bg-white/5 text-xs text-slate-300 font-bold cursor-pointer"
              >
                <Download className="h-3.5 w-3.5 text-cyan-400" />
                <span>Export CSV</span>
              </button>
              <button
                onClick={() => { setEditingStudent(null); setIsStudentModalOpen(true); }}
                className="btn-gradient px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1 cursor-pointer text-white"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Record</span>
              </button>
            </div>
          </div>

          {/* Student Table */}
          <div className="glow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/5 text-slate-400 uppercase text-[10px] bg-white/[0.01]">
                    <th className="p-3.5 text-center">
                      <input 
                        type="checkbox" 
                        onChange={(e) => {
                          if (e.target.checked) setSelectedStudentIds(students.map(s => s.id));
                          else setSelectedStudentIds([]);
                        }}
                        className="cursor-pointer" 
                      />
                    </th>
                    <th className="p-3.5">Student Name</th>
                    <th className="p-3.5">School Name</th>
                    <th className="p-3.5 text-center">Grade</th>
                    <th className="p-3.5 text-center">Attendance</th>
                    <th className="p-3.5 text-center">Risk Score</th>
                    <th className="p-3.5 text-center">Status</th>
                    <th className="p-3.5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase())).map((student) => (
                    <tr key={student.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="p-3.5 text-center">
                        <input 
                          type="checkbox"
                          checked={selectedStudentIds.includes(student.id)}
                          onChange={() => {
                            setSelectedStudentIds(prev => 
                              prev.includes(student.id) ? prev.filter(i => i !== student.id) : [...prev, student.id]
                            );
                          }}
                          className="cursor-pointer" 
                        />
                      </td>
                      <td className="p-3.5 font-bold text-white">{student.name}</td>
                      <td className="p-3.5 text-slate-300">{student.schoolName}</td>
                      <td className="p-3.5 text-center">{student.grade}</td>
                      <td className="p-3.5 text-center font-mono font-semibold">{student.attendance}%</td>
                      <td className="p-3.5 text-center font-mono">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          student.riskScore >= thresholds.high ? 'bg-pink-500/10 text-pink-400' :
                          student.riskScore >= thresholds.medium ? 'bg-purple-500/10 text-purple-400' :
                          'bg-cyan-500/10 text-cyan-400'
                        }`}>
                          {student.riskScore}%
                        </span>
                      </td>
                      <td className="p-3.5 text-center">{student.status}</td>
                      <td className="p-3.5 text-center">
                        <button 
                          onClick={() => { setEditingStudent(student); setIsStudentModalOpen(true); }}
                          className="text-cyan-400 hover:text-white p-1 rounded hover:bg-white/5 cursor-pointer"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          TAB 3: ENROLMENT DATA (INLINE EDIT)
          ========================================== */}
      {activeTab === 'enrolment' && (
        <div className="space-y-4 font-sans text-xs">
          <div className="flex justify-between items-center bg-[#0d0d1f] p-4 rounded-xl border border-white/5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
              <LineChart className="h-4 w-4 text-cyan-400" />
              <span>Year-wise Demographic Enrolments</span>
            </h3>
            <button
              onClick={handleAddEnrolmentRow}
              className="btn-gradient px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1 cursor-pointer text-white"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Year Row</span>
            </button>
          </div>

          <div className="glow-card overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/5 text-slate-400 uppercase text-[10px] bg-white/[0.01]">
                  <th className="p-3.5 text-center">Academic Year</th>
                  <th className="p-3.5">School / Target</th>
                  <th className="p-3.5 text-center">Kannada Medium (%)</th>
                  <th className="p-3.5 text-center">English Medium (%)</th>
                  <th className="p-3.5 text-center">Total Ratio</th>
                </tr>
              </thead>
              <tbody>
                {enrolment.map((row) => (
                  <tr key={row.id} className="border-b border-white/5 hover:bg-white/[0.01]">
                    <td className="p-3.5 text-center font-mono font-bold text-white">{row.year}</td>
                    <td className="p-3.5 text-slate-300">{row.schoolName}</td>
                    <td className="p-3.5 text-center">
                      <input 
                        type="number" 
                        value={row.kannadaCount} 
                        onChange={(e) => handleEnrolmentCellChange(row.id, 'kannadaCount', e.target.value)}
                        className="bg-[#05050f] border border-white/10 rounded px-2.5 py-1 text-xs text-center w-16 focus:outline-none focus:border-cyan-400 font-mono"
                      />
                    </td>
                    <td className="p-3.5 text-center">
                      <input 
                        type="number" 
                        value={row.englishCount} 
                        onChange={(e) => handleEnrolmentCellChange(row.id, 'englishCount', e.target.value)}
                        className="bg-[#05050f] border border-white/10 rounded px-2.5 py-1 text-xs text-center w-16 focus:outline-none focus:border-cyan-400 font-mono"
                      />
                    </td>
                    <td className="p-3.5 text-center font-mono font-semibold text-slate-400">{row.total}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==========================================
          TAB 4: INTERVENTIONS DATA
          ========================================== */}
      {activeTab === 'interventions' && (
        <div className="space-y-4 font-sans text-xs">
          <div className="flex justify-between items-center bg-[#0d0d1f] p-4 rounded-xl border border-white/5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Active Interventions Directory
            </h3>
            <button
              onClick={() => { setEditingIntervention(null); setIsInterventionModalOpen(true); }}
              className="btn-gradient px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1 cursor-pointer text-white"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Intervention</span>
            </button>
          </div>

          <div className="glow-card overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/5 text-slate-400 uppercase text-[10px] bg-white/[0.01]">
                  <th className="p-3.5">Campaign Title</th>
                  <th className="p-3.5">Type</th>
                  <th className="p-3.5">School Target</th>
                  <th className="p-3.5 text-center">Target Date</th>
                  <th className="p-3.5 text-center">Status</th>
                  <th className="p-3.5">Assigned Officer</th>
                  <th className="p-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {interventions.map((item) => (
                  <tr key={item.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="p-3.5 font-bold text-white">{item.title}</td>
                    <td className="p-3.5 text-slate-300">{item.type}</td>
                    <td className="p-3.5 text-slate-300">{item.school}</td>
                    <td className="p-3.5 text-center font-mono">{item.targetDate}</td>
                    <td className="p-3.5 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-400' :
                        item.status === 'In Action' ? 'bg-amber-500/10 text-amber-400' :
                        'bg-purple-500/10 text-purple-400'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-300">{item.officer}</td>
                    <td className="p-3.5 text-center space-x-2">
                      <button 
                        onClick={() => { setEditingIntervention(item); setIsInterventionModalOpen(true); }}
                        className="text-cyan-400 hover:text-white p-1 rounded hover:bg-white/5 cursor-pointer"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button 
                        onClick={() => handleDeleteIntervention(item.id, item.title)}
                        className="text-slate-500 hover:text-red-400 p-1 rounded hover:bg-white/5 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==========================================
          TAB 5: ANALYTICS THRESHOLDS
          ========================================== */}
      {activeTab === 'thresholds' && (
        <form onSubmit={handleSaveThresholds} className="max-w-2xl bg-[#0d0d1f] p-6 rounded-2xl border border-white/5 font-sans space-y-6 text-xs">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center space-x-2">
              <Sliders className="h-4.5 w-4.5 text-cyan-400" />
              <span>Configure predictive risk scoring calculations</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">
              Threshold variables configure dropout risks, attendance flags, and language barriers across all dashboards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                High Dropout Risk threshold (%)
              </label>
              <input 
                type="number"
                value={thresholds.high}
                onChange={(e) => setThresholds({...thresholds, high: parseInt(e.target.value) || 80})}
                className="w-full bg-[#05050f] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Medium Dropout Risk threshold (%)
              </label>
              <input 
                type="number"
                value={thresholds.medium}
                onChange={(e) => setThresholds({...thresholds, medium: parseInt(e.target.value) || 65})}
                className="w-full bg-[#05050f] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Attendance Warning Trigger (%)
              </label>
              <input 
                type="number"
                value={thresholds.attendanceTrigger}
                onChange={(e) => setThresholds({...thresholds, attendanceTrigger: parseInt(e.target.value) || 75})}
                className="w-full bg-[#05050f] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Linguistic Gap Warning Trigger (%)
              </label>
              <input 
                type="number"
                value={thresholds.languageGap}
                onChange={(e) => setThresholds({...thresholds, languageGap: parseInt(e.target.value) || 70})}
                className="w-full bg-[#05050f] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-gradient px-5 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-1 cursor-pointer text-white"
          >
            <Check className="h-4 w-4" />
            <span>Save Threshold Configurations</span>
          </button>
        </form>
      )}

      {/* ==========================================
          TAB 6: AUDIT LOG
          ========================================== */}
      {activeTab === 'audit' && (
        <div className="space-y-4 font-sans text-xs">
          <div className="flex justify-between items-center bg-[#0d0d1f] p-4 rounded-xl border border-white/5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Registry Modification Audit Trails
            </h3>
            <button
              onClick={handleExportAuditLogs}
              className="flex items-center space-x-1 px-3 py-2 rounded-xl border border-white/10 hover:bg-white/5 text-xs text-slate-300 font-bold cursor-pointer"
            >
              <Download className="h-3.5 w-3.5 text-cyan-400" />
              <span>Export Audit Trail CSV</span>
            </button>
          </div>

          <div className="glow-card overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/5 text-slate-400 uppercase text-[10px] bg-white/[0.01]">
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5">Editor Name</th>
                  <th className="p-3.5 text-center">Section</th>
                  <th className="p-3.5">Action / Field</th>
                  <th className="p-3.5">Old Value</th>
                  <th className="p-3.5">New Value</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.length > 0 ? (
                  auditLogs.map((log, index) => (
                    <tr key={index} className="border-b border-white/5 hover:bg-white/[0.01] text-[11px]">
                      <td className="p-3.5 font-mono text-slate-400">{log.timestamp}</td>
                      <td className="p-3.5 font-bold text-white">{log.editor}</td>
                      <td className="p-3.5 text-center font-semibold text-purple-400">{log.section}</td>
                      <td className="p-3.5 text-cyan-400 font-mono font-medium">{log.fieldChanged}</td>
                      <td className="p-3.5 text-slate-500 max-w-[150px] truncate" title={log.oldValue}>{log.oldValue || '—'}</td>
                      <td className="p-3.5 text-slate-300 max-w-[150px] truncate font-medium" title={log.newValue}>{log.newValue}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-10 text-center text-slate-500">No modifications logged yet. Changes will appear here.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==========================================
          MODALS IMPLEMENTATION
          ========================================== */}
      {/* 1. School Edit Modal */}
      {isSchoolModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSaveSchool} className="max-w-md w-full bg-[#0d0d1f] border border-white/10 rounded-2xl p-6 font-sans text-xs text-white space-y-4">
            <h3 className="text-md font-bold text-white font-mono-header">
              {editingSchool ? 'Edit School Record' : 'Add School Record'}
            </h3>
            
            <div className="grid grid-cols-2 gap-3 max-h-[350px] overflow-y-auto pr-1">
              <div className="col-span-2">
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">School Name</label>
                <input type="text" name="name" defaultValue={editingSchool?.name || ''} className="w-full bg-[#05050f] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none" required />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">DISE Code</label>
                <input type="text" name="diseCode" defaultValue={editingSchool?.diseCode || ''} className="w-full bg-[#05050f] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none" required />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Medium</label>
                <input type="text" name="medium" defaultValue={editingSchool?.medium || 'Kannada'} className="w-full bg-[#05050f] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none" required />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Taluk</label>
                <input type="text" name="taluk" defaultValue={editingSchool?.taluk || ''} className="w-full bg-[#05050f] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none" required />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">District</label>
                <input type="text" name="district" defaultValue={editingSchool?.district || ''} className="w-full bg-[#05050f] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none" required />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Enrolled Students</label>
                <input type="number" name="enrolled" defaultValue={editingSchool?.enrolled || ''} className="w-full bg-[#05050f] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none" required />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Risk Index (%)</label>
                <input type="number" step="0.1" name="riskIndex" defaultValue={editingSchool?.riskIndex || ''} className="w-full bg-[#05050f] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none" required />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Principal Name</label>
                <input type="text" name="principalName" defaultValue={editingSchool?.principalName || ''} className="w-full bg-[#05050f] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none" />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Contact No</label>
                <input type="text" name="contact" defaultValue={editingSchool?.contact || ''} className="w-full bg-[#05050f] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none" />
              </div>
              <div className="col-span-2">
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Status</label>
                <select name="status" defaultValue={editingSchool?.status || 'Active'} className="w-full bg-[#05050f] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none cursor-pointer">
                  <option>Active</option>
                  <option>Inactive</option>
                  <option>Needs Bridge Kit</option>
                  <option>Needs Home Visit</option>
                  <option>Active Support</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button type="button" onClick={() => setIsSchoolModalOpen(false)} className="px-3.5 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 cursor-pointer">Cancel</button>
              <button type="submit" className="px-4 py-1.5 rounded-lg btn-gradient text-white cursor-pointer font-bold">Save Changes</button>
            </div>
          </form>
        </div>
      )}

      {/* 2. Student Edit Modal */}
      {isStudentModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSaveStudent} className="max-w-md w-full bg-[#0d0d1f] border border-white/10 rounded-2xl p-6 font-sans text-xs text-white space-y-4">
            <h3 className="text-md font-bold text-white font-mono-header">
              {editingStudent ? 'Edit Student Record' : 'Add Student Record'}
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Student Name</label>
                <input type="text" name="name" defaultValue={editingStudent?.name || ''} className="w-full bg-[#05050f] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none" required />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">School Name</label>
                <input type="text" name="schoolName" defaultValue={editingStudent?.schoolName || ''} className="w-full bg-[#05050f] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none" required />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Grade</label>
                  <input type="text" name="grade" defaultValue={editingStudent?.grade || 'Grade 6'} className="w-full bg-[#05050f] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none" required />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Attendance (%)</label>
                  <input type="number" step="0.1" name="attendance" defaultValue={editingStudent?.attendance || ''} className="w-full bg-[#05050f] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none" required />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Risk Score (%)</label>
                  <input type="number" step="0.1" name="riskScore" defaultValue={editingStudent?.riskScore || ''} className="w-full bg-[#05050f] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none" required />
                </div>
              </div>
              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Status</label>
                <select name="status" defaultValue={editingStudent?.status || 'Active'} className="w-full bg-[#05050f] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none cursor-pointer">
                  <option>Active</option>
                  <option>At Risk</option>
                  <option>Needs Attention</option>
                </select>
              </div>
              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Notes / Logs</label>
                <textarea name="notes" defaultValue={editingStudent?.notes || ''} className="w-full bg-[#05050f] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none h-16 resize-none" />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button type="button" onClick={() => setIsStudentModalOpen(false)} className="px-3.5 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 cursor-pointer">Cancel</button>
              <button type="submit" className="px-4 py-1.5 rounded-lg btn-gradient text-white cursor-pointer font-bold">Save Changes</button>
            </div>
          </form>
        </div>
      )}

      {/* 3. Intervention Modal */}
      {isInterventionModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSaveIntervention} className="max-w-md w-full bg-[#0d0d1f] border border-white/10 rounded-2xl p-6 font-sans text-xs text-white space-y-4">
            <h3 className="text-md font-bold text-white font-mono-header">
              {editingIntervention ? 'Edit Intervention' : 'Add Intervention'}
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Campaign Title</label>
                <input type="text" name="title" defaultValue={editingIntervention?.title || ''} className="w-full bg-[#05050f] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Type</label>
                  <input type="text" name="type" defaultValue={editingIntervention?.type || 'Bilingual Kit'} className="w-full bg-[#05050f] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none" required />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Target Date</label>
                  <input type="date" name="targetDate" defaultValue={editingIntervention?.targetDate || ''} className="w-full bg-[#05050f] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none" required />
                </div>
              </div>
              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">School Target</label>
                <input type="text" name="school" defaultValue={editingIntervention?.school || ''} className="w-full bg-[#05050f] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none" required />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Status</label>
                <select name="status" defaultValue={editingIntervention?.status || 'Assigned'} className="w-full bg-[#05050f] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none cursor-pointer">
                  <option>Assigned</option>
                  <option>In Action</option>
                  <option>Resolved</option>
                </select>
              </div>
              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Notes / Objectives</label>
                <textarea name="notes" defaultValue={editingIntervention?.notes || ''} className="w-full bg-[#05050f] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none h-16 resize-none" />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button type="button" onClick={() => setIsInterventionModalOpen(false)} className="px-3.5 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 cursor-pointer">Cancel</button>
              <button type="submit" className="px-4 py-1.5 rounded-lg btn-gradient text-white cursor-pointer font-bold">Save Changes</button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
