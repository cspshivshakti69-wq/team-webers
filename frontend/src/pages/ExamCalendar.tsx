import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  Bookmark
} from 'lucide-react';

interface CalendarEvent {
  date: number; // Day of June 2026
  type: 'exam' | 'task' | 'reminder';
  title: string;
  note?: string;
}

const INITIAL_EVENTS: CalendarEvent[] = [
  { date: 15, type: 'exam', title: 'JEE Advanced 2026', note: 'Bring admit card & photo ID.' },
  { date: 18, type: 'exam', title: 'NEET UG 2026 Exam', note: 'Reporting time 11:30 AM.' },
  { date: 10, type: 'task', title: 'Mathematics Mock Test Revision', note: 'Practice past integral problems.' },
  { date: 20, type: 'reminder', title: 'KCET Counselling Round 1 Registration', note: 'Verify documents upload.' }
];

export const ExamCalendar: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<number>(4); // Default selected is June 4 (today)
  const [events, setEvents] = useState<CalendarEvent[]>(INITIAL_EVENTS);
  
  // Add Event Form State
  const [formType, setFormType] = useState<'exam' | 'task' | 'reminder'>('task');
  const [formTitle, setFormTitle] = useState('');
  const [formNote, setFormNote] = useState('');

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle) return;

    const newEvent: CalendarEvent = {
      date: selectedDate,
      type: formType,
      title: formTitle,
      note: formNote || undefined
    };

    setEvents(prev => [...prev, newEvent]);
    setFormTitle('');
    setFormNote('');
  };

  const getEventsForDate = (date: number) => {
    return events.filter(e => e.date === date);
  };

  // June 2026 Calendar Details
  // June 1, 2026 starts on Monday.
  // Sun=0, Mon=1, Tue=2, Wed=3, Thu=4, Fri=5, Sat=6
  // Days in June = 30.
  // Grid offset = 1 empty cell at Sunday (index 0).
  const daysInMonth = 30;
  const startOffset = 1; // June 1st is Monday, so Sunday is empty offset.
  
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const upcomingExams = [
    { name: 'NEET UG 2026 Exam', date: '18 Jun', countdown: '6d' }, // Displays countdowns matching specs
    { name: 'JEE Advanced 2026', date: '15 Jun', countdown: '11d' },
    { name: 'CET Karnataka 2026', date: '1 Jul', countdown: '27d' },
    { name: 'KCET Counselling Round 1', date: '20 Jul', countdown: '46d' },
    { name: 'CUET PG 2026', date: '5 Aug', countdown: '62d' }
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-[#05050f] text-white space-y-6">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 pb-5">
        <div>
          <h2 className="text-2xl font-bold tracking-tight font-mono-header">Exam Calendar</h2>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Track exam dates and add study tasks to any day.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start font-sans">
        
        {/* Calendar Widget Panel (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glow-card p-6 space-y-4">
            
            {/* Calendar header */}
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h3 className="text-sm font-bold tracking-wider uppercase font-mono-header text-white">
                June 2026
              </h3>
              <div className="flex space-x-1">
                <button className="p-1 rounded hover:bg-white/5 text-slate-400 hover:text-white cursor-pointer"><ChevronLeft className="h-4 w-4" /></button>
                <button className="p-1 rounded hover:bg-white/5 text-slate-400 hover:text-white cursor-pointer"><ChevronRight className="h-4 w-4" /></button>
              </div>
            </div>

            {/* Sun - Sat headers */}
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-500 font-mono">
              <span>SUN</span>
              <span>MON</span>
              <span>TUE</span>
              <span>WED</span>
              <span>THU</span>
              <span>FRI</span>
              <span>SAT</span>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-2">
              {/* Offsets (May days/empty) */}
              {Array.from({ length: startOffset }).map((_, idx) => (
                <div key={`offset-${idx}`} className="h-10 bg-transparent rounded-lg"></div>
              ))}

              {/* Active days */}
              {daysArray.map(day => {
                const isToday = day === 4;
                const isSelected = selectedDate === day;
                const dayEvents = getEventsForDate(day);
                
                const hasExam = dayEvents.some(e => e.type === 'exam');
                const hasTask = dayEvents.some(e => e.type === 'task');
                const hasReminder = dayEvents.some(e => e.type === 'reminder');

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDate(day)}
                    className={`h-10 rounded-lg flex flex-col items-center justify-between py-1 transition-all cursor-pointer relative ${
                      isSelected 
                        ? 'border border-cyan-400 bg-cyan-950/20' 
                        : isToday 
                        ? 'border border-white/20 bg-white/5' 
                        : 'bg-[#0d0d1f] hover:bg-white/[0.02] border border-transparent'
                    }`}
                  >
                    {/* Day number */}
                    <span className={`text-[10px] font-bold ${isSelected ? 'text-cyan-400' : 'text-slate-300'}`}>
                      {day}
                    </span>

                    {/* Event Dots */}
                    <div className="flex space-x-0.5 justify-center pb-0.5">
                      {hasExam && <span className="h-1 w-1 rounded-full bg-pink-500"></span>}
                      {hasTask && <span className="h-1 w-1 rounded-full bg-emerald-500"></span>}
                      {hasReminder && <span className="h-1 w-1 rounded-full bg-blue-500"></span>}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex justify-center space-x-6 text-[10px] font-bold text-slate-400 pt-3 border-t border-white/5">
              <span className="flex items-center"><span className="h-1.5 w-1.5 rounded-full bg-pink-500 mr-1.5"></span>Exam</span>
              <span className="flex items-center"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1.5"></span>Task</span>
              <span className="flex items-center"><span className="h-1.5 w-1.5 rounded-full bg-blue-500 mr-1.5"></span>Reminder</span>
            </div>

          </div>

          {/* Click Panel: Event view and creation (below calendar) */}
          <div className="glow-card p-6 space-y-4">
            <h3 className="text-sm font-bold tracking-wider uppercase font-mono-header flex items-center space-x-2">
              <CalendarIcon className="h-4.5 w-4.5 text-cyan-400" />
              <span>Notes for June {selectedDate}, 2026</span>
            </h3>

            {/* Existing notes */}
            <div className="space-y-2 max-h-[140px] overflow-y-auto">
              {getEventsForDate(selectedDate).length > 0 ? (
                getEventsForDate(selectedDate).map((e, idx) => (
                  <div key={idx} className="p-3 bg-[#05050f] rounded-xl border border-white/5 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-white flex items-center space-x-1.5">
                        <span className={`h-2 w-2 rounded-full ${
                          e.type === 'exam' ? 'bg-pink-500' : e.type === 'task' ? 'bg-emerald-500' : 'bg-blue-500'
                        }`}></span>
                        <span>{e.title}</span>
                      </span>
                      <span className="text-[9px] uppercase font-bold text-slate-500 font-mono">{e.type}</span>
                    </div>
                    {e.note && <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">{e.note}</p>}
                  </div>
                ))
              ) : (
                <p className="text-[10px] text-slate-500 italic py-2">
                  No events logged on this date. Use form below to add.
                </p>
              )}
            </div>

            {/* Add Event Form */}
            <form onSubmit={handleAddEvent} className="border-t border-white/5 pt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                
                {/* Event Type */}
                <div>
                  <label className="block text-[8px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Type</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as any)}
                    className="w-full bg-[#05050f] border border-white/10 rounded-xl px-2 py-1.5 text-[10px] text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="task">Task</option>
                    <option value="exam">Exam</option>
                    <option value="reminder">Reminder</option>
                  </select>
                </div>

                {/* Event Title */}
                <div>
                  <label className="block text-[8px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Physics Revision"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full bg-[#05050f] border border-white/10 rounded-xl px-2 py-1.5 text-[10px] text-white focus:outline-none"
                    required
                  />
                </div>

              </div>

              {/* Note details */}
              <div>
                <label className="block text-[8px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Scope details</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="e.g. read pages 20-30"
                    value={formNote}
                    onChange={(e) => setFormNote(e.target.value)}
                    className="w-full bg-[#05050f] border border-white/10 rounded-xl px-2 py-1.5 text-[10px] text-white focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="bg-cyan-500 hover:bg-cyan-600 text-black text-[10px] font-bold px-3 py-1.5 rounded-xl flex items-center space-x-0.5 cursor-pointer flex-shrink-0"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            </form>

          </div>
        </div>

        {/* Upcoming Exams Countdown (5 Cols) */}
        <div className="lg:col-span-5 glow-card p-6 space-y-4">
          <h3 className="text-sm font-bold tracking-wider uppercase font-mono-header flex items-center space-x-2">
            <Bookmark className="h-4.5 w-4.5 text-yellow-500" />
            <span>⭐ Upcoming Exams</span>
          </h3>

          <div className="space-y-2.5">
            {upcomingExams.map((ex, idx) => (
              <div key={idx} className="p-3 bg-[#0d0d1f] hover:bg-white/[0.01] border border-white/5 rounded-xl flex items-center justify-between text-xs hover:border-white/10 transition-colors">
                <div className="flex items-start space-x-2.5">
                  <Clock className="h-4 w-4 text-purple-400 mt-0.5" />
                  <div>
                    <div className="font-bold text-white leading-tight">{ex.name}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{ex.date}</div>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded bg-cyan-500/10 text-cyan-400 font-mono font-bold text-[10px] border border-cyan-500/20">
                  {ex.countdown}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
