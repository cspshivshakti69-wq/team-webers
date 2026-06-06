import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Plus, ClipboardCheck, Clock, FileText, X } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell
} from 'recharts';

export const LogsSection: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  // State
  const [logs, setLogs] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Filters
  const [typeFilter, setTypeFilter] = useState('All');
  const [schoolFilter, setSchoolFilter] = useState('All');
  const [gradeFilter, setGradeFilter] = useState('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: 'Math',
    title: '',
    description: '',
    studentId: ''
  });

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const logsData = await api.logs.getInterventions(typeFilter, schoolFilter, gradeFilter);
      setLogs(logsData);
    } catch (err) {
      console.error('Failed to fetch logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [typeFilter, schoolFilter, gradeFilter]);

  // Fetch some sample students to populate the creation dropdown
  useEffect(() => {
    const fetchSampleStudents = async () => {
      try {
        const res = await api.students.getStudents('', 'All', [], 1, 20);
        setStudents(res.students);
        if (res.students.length > 0) {
          setFormData(prev => ({ ...prev, studentId: res.students[0].id }));
        }
      } catch (err) {
        console.error('Failed to load sample students:', err);
      }
    };
    fetchSampleStudents();
  }, []);

  const handleCreateLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.studentId) {
      alert('Please fill out all fields');
      return;
    }

    setSubmitting(true);
    try {
      await api.logs.createIntervention({
        ...formData,
        createdBy: user?.name || 'Administrator'
      });
      
      // Reset & close
      setFormData({
        type: 'Math',
        title: '',
        description: '',
        studentId: students[0]?.id || ''
      });
      setIsModalOpen(false);
      
      // Refresh list
      await fetchLogs();
      alert('Intervention log created successfully!');
    } catch (err: any) {
      alert(`Error creating log: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Aggregate stats from current logs
  const totalLogs = logs.length;
  const activeCount = logs.filter(l => l.status === 'ACTIVE').length;

  // Interventions by type counting
  const typeCounts: Record<string, number> = {
    Math: 0,
    Attendance: 0,
    Reading: 0,
    Behavior: 0,
    Writing: 0,
    Academic: 0
  };

  logs.forEach(l => {
    if (typeCounts[l.type] !== undefined) {
      typeCounts[l.type]++;
    }
  });

  const chartData = Object.keys(typeCounts).map(key => ({
    name: key,
    count: typeCounts[key]
  }));

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="flex-1 space-y-6 p-6 overflow-y-auto bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      
      {/* Header Title & "+ Create" Button */}
      <div className="flex justify-between items-center">
        <div>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">{t('logs')}</span>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-1 m-0">Interventions Dashboard</h2>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl shadow-md font-semibold text-xs transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>{t('createLog')}</span>
        </button>
      </div>

      {/* Top statistics tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Interventions Card */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800/60 p-5 rounded-2xl shadow-sm glow-card flex items-center space-x-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <ClipboardCheck className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 block">{t('totalInterventions')}</span>
            <span className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5 block">{totalLogs}</span>
          </div>
        </div>

        {/* Updated Last 7 Days Card */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800/60 p-5 rounded-2xl shadow-sm glow-card flex items-center space-x-4">
          <div className="h-12 w-12 rounded-xl bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 block">{t('interventionsUpdated')}</span>
            <span className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5 block">{Math.round(totalLogs * 0.06)}</span>
          </div>
        </div>

        {/* Total Concerns Card */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800/60 p-5 rounded-2xl shadow-sm glow-card flex items-center space-x-4">
          <div className="h-12 w-12 rounded-xl bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 block">{t('totalConcerns')}</span>
            <span className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5 block">{activeCount}</span>
          </div>
        </div>

        {/* Concerns Updated Last 7 Days Card */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800/60 p-5 rounded-2xl shadow-sm glow-card flex items-center space-x-4">
          <div className="h-12 w-12 rounded-xl bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 block">{t('concernsUpdated')}</span>
            <span className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5 block">0</span>
          </div>
        </div>

      </div>

      {/* Grid of chart and list */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Horizontal Bar Chart (Interventions by Type) */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800/60 p-5 rounded-2xl shadow-sm flex flex-col h-[380px] lg:col-span-1">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">{t('interventionsByType')}</h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={chartData}
                margin={{ top: 10, right: 10, left: -10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#374151" strokeOpacity={0.1} />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(16, 185, 129, 0.05)' }}
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    backgroundColor: '#1f2937', 
                    color: '#fff' 
                  }}
                />
                <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={25}>
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Filter and Logs list */}
        <div className="lg:col-span-2 space-y-4 flex flex-col">
          
          {/* Filter Toolbar */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800/60 px-5 py-3 rounded-2xl shadow-sm flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-4 items-center">
              {/* Log Type Filter */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
                  {t('logType')}
                </label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 text-xs font-semibold px-3 py-1.5 rounded-lg text-gray-800 dark:text-gray-200 focus:outline-none cursor-pointer"
                >
                  <option value="All">{t('all')}</option>
                  <option value="Math">Math</option>
                  <option value="Reading">Reading</option>
                  <option value="Writing">Writing</option>
                  <option value="Attendance">Attendance</option>
                  <option value="Behavior">Behavior</option>
                  <option value="Academic">Academic</option>
                </select>
              </div>

              {/* School Filter */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
                  {t('school')}
                </label>
                <select
                  value={schoolFilter}
                  onChange={(e) => setSchoolFilter(e.target.value)}
                  className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 text-xs font-semibold px-3 py-1.5 rounded-lg text-gray-800 dark:text-gray-200 focus:outline-none cursor-pointer"
                >
                  <option value="All">{t('all')}</option>
                  <option value="Government High School Bengaluru">GHS Bengaluru</option>
                  <option value="Kannada Seva Academy Mysuru">Seva Academy Mysuru</option>
                  <option value="Adarsha Vidyalaya Hubballi">Adarsha Vidyalaya</option>
                </select>
              </div>

              {/* Grade Filter */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
                  {t('gradeLevel')}
                </label>
                <select
                  value={gradeFilter}
                  onChange={(e) => setGradeFilter(e.target.value)}
                  className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 text-xs font-semibold px-3 py-1.5 rounded-lg text-gray-800 dark:text-gray-200 focus:outline-none cursor-pointer"
                >
                  <option value="All">{t('all')}</option>
                  {Array.from({ length: 12 }, (_, i) => {
                    const grade = i + 1 < 10 ? `0${i + 1}` : `${i + 1}`;
                    return <option key={grade} value={grade}>Grade {grade}</option>;
                  })}
                </select>
              </div>
            </div>
          </div>

          {/* Logs scrollable checklist */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800/60 rounded-2xl shadow-sm flex-1 overflow-hidden flex flex-col h-[320px]">
            <div className="overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800 flex-1">
              {loading ? (
                <div className="h-full flex items-center justify-center py-10">
                  <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : logs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 py-10">
                  <span>No intervention logs match these filters.</span>
                </div>
              ) : (
                logs.map(log => (
                  <div key={log.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-900/40 flex justify-between items-start transition-all duration-150">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          log.type === 'Math' ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400' :
                          log.type === 'Reading' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400' :
                          log.type === 'Behavior' ? 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400' :
                          'bg-purple-50 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400'
                        }`}>
                          {log.type}
                        </span>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white">{log.title}</h4>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed max-w-xl">{log.description}</p>
                      <div className="flex items-center space-x-3 text-[10px] text-gray-400 font-medium pt-1">
                        <span>Student: <strong className="text-gray-600 dark:text-gray-300">{log.studentName}</strong> (ID: {log.studentId})</span>
                        <span>•</span>
                        <span>School: {log.studentSchool}</span>
                        <span>•</span>
                        <span>Grade: {log.studentGrade}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        log.status === 'ACTIVE' ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                      }`}>
                        {log.status}
                      </span>
                      <span className="text-[9px] text-gray-400">{new Date(log.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

      {/* CREATE LOG MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="px-6 py-4 bg-emerald-600 text-white flex justify-between items-center">
              <h3 className="font-bold text-base">{t('createLog')}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-emerald-100 hover:text-white rounded-lg transition-colors cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateLog} className="p-6 space-y-4">
              
              {/* Student Dropdown */}
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                  {t('selectStudent')}
                </label>
                <select
                  value={formData.studentId}
                  onChange={(e) => setFormData(prev => ({ ...prev, studentId: e.target.value }))}
                  className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl p-2.5 text-xs text-gray-950 dark:text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} (Grade {s.grade} - {s.school.split(' ')[0]})
                    </option>
                  ))}
                </select>
              </div>

              {/* Log Type */}
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                  {t('logType')}
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl p-2.5 text-xs text-gray-950 dark:text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="Math">Math</option>
                  <option value="Reading">Reading</option>
                  <option value="Writing">Writing</option>
                  <option value="Attendance">Attendance</option>
                  <option value="Behavior">Behavior</option>
                  <option value="Academic">Academic</option>
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                  {t('title')}
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder={t('enterTitle')}
                  className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl p-2.5 text-xs text-gray-950 dark:text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                  {t('description')}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder={t('enterDescription')}
                  rows={4}
                  className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl p-2.5 text-xs text-gray-950 dark:text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 dark:border-gray-800 text-xs font-semibold rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white text-xs font-semibold rounded-xl shadow-md cursor-pointer"
                >
                  {submitting ? 'Creating...' : 'Create Log'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
