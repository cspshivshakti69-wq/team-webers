import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../utils/api';
import { Plus, Search, ChevronDown, ChevronLeft, ChevronRight, X, Eye } from 'lucide-react';

export const StudentsPage: React.FC = () => {
  const { t } = useTranslation();
  
  // Data State
  const [students, setStudents] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [search, setSearch] = useState('');
  const [schoolFilter, setSchoolFilter] = useState('All');
  const [selectedGrades, setSelectedGrades] = useState<string[]>([]);
  const [tempGrades, setTempGrades] = useState<string[]>([]);
  const [isGradeDropdownOpen, setIsGradeDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Pagination
  const [page, setPage] = useState(1);
  const limit = 25;

  // Add Student Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    school: 'Government High School Bengaluru',
    grade: '09',
    tags: '', // Comma-separated string, e.g. "EL,SWD"
    attendanceRate: '95.5',
    inSchoolSuspensions: '0',
    outSchoolSuspensions: '0',
    mapQuintile: '3',
    gpa: '3.8'
  });

  // Load students data
  const loadStudents = async () => {
    setLoading(true);
    try {
      const result = await api.students.getStudents(
        search,
        schoolFilter,
        selectedGrades,
        page,
        limit
      );
      setStudents(result.students);
      setTotal(result.total);
    } catch (err) {
      console.error('Failed to load students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, [search, schoolFilter, selectedGrades, page]);

  // Handle outside clicks for Grade dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsGradeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleGradeToggle = (grade: string) => {
    setTempGrades(prev =>
      prev.includes(grade) ? prev.filter(g => g !== grade) : [...prev, grade]
    );
  };

  const handleGradeDone = () => {
    setSelectedGrades(tempGrades);
    setPage(1);
    setIsGradeDropdownOpen(false);
  };

  const handleGradeDeselectAll = () => {
    setTempGrades([]);
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.school || !formData.grade) {
      alert('Name, school, and grade are required');
      return;
    }
    setSubmitting(true);

    try {
      await api.students.addStudent(formData);
      setIsAddModalOpen(false);
      
      // Reset form
      setFormData({
        name: '',
        school: 'Government High School Bengaluru',
        grade: '09',
        tags: '',
        attendanceRate: '95.5',
        inSchoolSuspensions: '0',
        outSchoolSuspensions: '0',
        mapQuintile: '3',
        gpa: '3.8'
      });

      // Reload students table
      setPage(1);
      await loadStudents();
      alert('Student added successfully!');
    } catch (err: any) {
      alert(`Error adding student: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Helper for tag badge colors
  const getTagBadge = (tag: string) => {
    const t = tag.trim().toUpperCase();
    if (t === 'EL') {
      return (
        <span key={tag} className="px-2 py-0.5 text-[9px] font-bold rounded bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400">
          EL
        </span>
      );
    }
    if (t === 'SWD') {
      return (
        <span key={tag} className="px-2 py-0.5 text-[9px] font-bold rounded bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400">
          SWD
        </span>
      );
    }
    if (t === '504') {
      return (
        <span key={tag} className="px-2 py-0.5 text-[9px] font-bold rounded bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400">
          504
        </span>
      );
    }
    return null;
  };

  // Pagination calculation
  const totalPages = Math.ceil(total / limit);
  const startRow = (page - 1) * limit + 1;
  const endRow = Math.min(page * limit, total);

  return (
    <div className="flex-1 space-y-6 p-6 overflow-y-auto bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      
      {/* Title & Add Student Button */}
      <div className="flex justify-between items-center">
        <div>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">{t('students')}</span>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-1 m-0">Student Registry</h2>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl shadow-md font-semibold text-xs transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>{t('addStudent')}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800/60 p-4 rounded-2xl shadow-sm flex flex-wrap gap-4 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder={t('searchByName')}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-xs focus:outline-none focus:border-emerald-500 text-gray-900 dark:text-white"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          
          {/* School Dropdown */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">School:</span>
            <select
              value={schoolFilter}
              onChange={(e) => { setSchoolFilter(e.target.value); setPage(1); }}
              className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 text-xs font-semibold px-3 py-2 rounded-xl text-gray-800 dark:text-gray-200 focus:outline-none cursor-pointer"
            >
              <option value="All">{t('all')}</option>
              <option value="Government High School Bengaluru">GHS Bengaluru</option>
              <option value="Kannada Seva Academy Mysuru">Seva Academy Mysuru</option>
              <option value="Adarsha Vidyalaya Hubballi">Adarsha Vidyalaya</option>
            </select>
          </div>

          {/* Grade Level Dropdown Checklist */}
          <div className="relative" ref={dropdownRef}>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">Grade:</span>
              <button
                onClick={() => {
                  setTempGrades(selectedGrades);
                  setIsGradeDropdownOpen(!isGradeDropdownOpen);
                }}
                className="flex items-center justify-between w-40 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 text-xs font-semibold px-3 py-2 rounded-xl text-gray-800 dark:text-gray-200 focus:outline-none cursor-pointer"
              >
                <span>
                  {selectedGrades.length === 0 ? t('all') : `Selected (${selectedGrades.length})`}
                </span>
                <ChevronDown className="h-3.5 w-3.5 ml-1.5 text-gray-400" />
              </button>
            </div>

            {isGradeDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xl p-4 z-10 space-y-3">
                <div className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  Select Grade Levels
                </div>
                
                {/* Grades Checkbox List */}
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                  {Array.from({ length: 12 }, (_, i) => {
                    const gradeVal = i + 1 < 10 ? `0${i + 1}` : `${i + 1}`;
                    return (
                      <label key={gradeVal} className="flex items-center space-x-2 text-xs text-gray-700 dark:text-gray-300 font-medium cursor-pointer">
                        <input
                          type="checkbox"
                          checked={tempGrades.includes(gradeVal)}
                          onChange={() => handleGradeToggle(gradeVal)}
                          className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span>Grade {gradeVal}</span>
                      </label>
                    );
                  })}
                </div>

                {/* Dropdown controls */}
                <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-800 text-[10px]">
                  <button
                    onClick={handleGradeDeselectAll}
                    className="text-gray-500 hover:text-gray-800 font-bold cursor-pointer"
                  >
                    Deselect All
                  </button>
                  <button
                    onClick={handleGradeDone}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1 rounded-lg cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Table grid */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800/60 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-900/40 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                <th className="py-3.5 px-6 w-12 text-center">Drill</th>
                <th className="py-3.5 px-6">{t('studentName')}</th>
                <th className="py-3.5 px-6">{t('school')}</th>
                <th className="py-3.5 px-6">{t('studentGrade')}</th>
                <th className="py-3.5 px-6">{t('studentTags')}</th>
                <th className="py-3.5 px-6">{t('attendanceRate')}</th>
                <th className="py-3.5 px-6">{t('gpa')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-xs font-medium text-gray-700 dark:text-gray-300">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center">
                    <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-gray-400">
                    No student records found.
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition-colors">
                    <td className="py-3 px-6 text-center">
                      <button
                        onClick={() => alert(`Drill down details for ${student.name} (GPA: ${student.gpa}, Attendance: ${student.attendanceRate}%)`)}
                        className="p-1 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded transition-all cursor-pointer"
                        title="Drill Down"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                    <td className="py-3 px-6">
                      <div className="font-bold text-gray-900 dark:text-white">{student.name}</div>
                      <div className="text-[10px] text-gray-400">{student.id}</div>
                    </td>
                    <td className="py-3 px-6">{student.school}</td>
                    <td className="py-3 px-6">Grade {student.grade}</td>
                    <td className="py-3 px-6">
                      <div className="flex gap-1.5">
                        {student.tags ? (
                          student.tags.split(',').map((tag: string) => getTagBadge(tag))
                        ) : (
                          <span className="text-gray-400 dark:text-gray-600">-</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-6">
                      <span className={`font-bold ${student.attendanceRate < 90.0 ? 'text-red-500' : 'text-gray-800 dark:text-gray-200'}`}>
                        {student.attendanceRate}%
                      </span>
                    </td>
                    <td className="py-3 px-6 font-bold">{student.gpa}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Toolbar */}
        <div className="px-6 py-4 bg-gray-50/70 dark:bg-gray-900/40 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 font-semibold">
          <div>
            {t('rowsPerPage')} <strong className="text-gray-800 dark:text-gray-200">25</strong>
          </div>
          <div>
            {startRow}–{endRow} of {total.toLocaleString()}
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setPage(prev => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:bg-gray-100 disabled:opacity-50 transition-all cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:bg-gray-100 disabled:opacity-50 transition-all cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

      </div>

      {/* ADD STUDENT MODAL FORM */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="px-6 py-4 bg-emerald-600 text-white flex justify-between items-center">
              <h3 className="font-bold text-base">{t('addStudent')}</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-emerald-100 hover:text-white rounded-lg transition-colors cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAddStudent} className="p-6 space-y-4 max-h-[450px] overflow-y-auto">
              
              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                  Student Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter full name"
                  className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl p-2.5 text-xs text-gray-950 dark:text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              {/* School */}
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                  School
                </label>
                <select
                  value={formData.school}
                  onChange={(e) => setFormData(prev => ({ ...prev, school: e.target.value }))}
                  className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl p-2.5 text-xs text-gray-950 dark:text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="Government High School Bengaluru">Government High School Bengaluru</option>
                  <option value="Kannada Seva Academy Mysuru">Kannada Seva Academy Mysuru</option>
                  <option value="Adarsha Vidyalaya Hubballi">Adarsha Vidyalaya Hubballi</option>
                </select>
              </div>

              {/* Grade */}
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                  Grade Level
                </label>
                <select
                  value={formData.grade}
                  onChange={(e) => setFormData(prev => ({ ...prev, grade: e.target.value }))}
                  className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl p-2.5 text-xs text-gray-950 dark:text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  {Array.from({ length: 12 }, (_, i) => {
                    const gradeVal = i + 1 < 10 ? `0${i + 1}` : `${i + 1}`;
                    return (
                      <option key={gradeVal} value={gradeVal}>
                        Grade {gradeVal}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Tags (EL, SWD, 504) */}
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                  Demographic Tags (Comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="e.g. EL, SWD, 504"
                  className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl p-2.5 text-xs text-gray-950 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Attendance */}
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                  Attendance Rate (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={formData.attendanceRate}
                  onChange={(e) => setFormData(prev => ({ ...prev, attendanceRate: e.target.value }))}
                  className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl p-2.5 text-xs text-gray-950 dark:text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              {/* GPA */}
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                  GPA (Cumulative)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="4"
                  value={formData.gpa}
                  onChange={(e) => setFormData(prev => ({ ...prev, gpa: e.target.value }))}
                  className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl p-2.5 text-xs text-gray-950 dark:text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 dark:border-gray-800 text-xs font-semibold rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white text-xs font-semibold rounded-xl shadow-md cursor-pointer"
                >
                  {submitting ? 'Adding...' : 'Add Student'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
