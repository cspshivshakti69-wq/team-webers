import React, { useState } from 'react';
import { 
  Plus, 
  Calendar, 
  User, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  RotateCcw, 
  Sparkles, 
  X, 
  FileText 
} from 'lucide-react';

interface InterventionCard {
  id: string;
  tag: string;
  tagColor: 'cyan' | 'pink' | 'gray';
  title: string;
  desc: string;
  school: string;
  student?: string;
  targetDate: string;
  status: 'ASSIGNED' | 'INACTION' | 'RESOLVED';
}

const INITIAL_CARDS: InterventionCard[] = [
  {
    id: 'int-1',
    tag: 'BILINGUAL',
    tagColor: 'cyan',
    title: 'Bilingual Bridge Materials Distribution',
    desc: 'Ship 40 copies of language bridging workbooks mapping Kannada letters to English phonetics.',
    school: 'GHPS Hunsur Forest Edge',
    targetDate: '2026-06-30',
    status: 'ASSIGNED'
  },
  {
    id: 'int-2',
    tag: 'ABSENTEE',
    tagColor: 'pink',
    title: 'Absenteeism Intervention Campaign',
    desc: 'Conduct a home visit to verify student commute and engage guardians on daily attendance importance.',
    school: 'GHPS Bantwal Rural',
    student: 'Abhishek Gowda (Bantwal)',
    targetDate: '2026-06-15',
    status: 'INACTION'
  },
  {
    id: 'int-3',
    tag: 'DAILY',
    tagColor: 'gray',
    title: 'Daily Commute Transport Subsidy',
    desc: 'Partner with local auto services to resolve the 6.2km deep forest commuting barrier for 12 students.',
    school: 'GHPS Chamarajanagar Hill',
    targetDate: '2026-05-30',
    status: 'RESOLVED'
  }
];

export const InterventionsBoard: React.FC = () => {
  const [cards, setCards] = useState<InterventionCard[]>(INITIAL_CARDS);
  const [modalOpen, setModalOpen] = useState(false);

  // Form state
  const [formTag, setFormTag] = useState('BILINGUAL');
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formSchool, setFormSchool] = useState('');
  const [formStudent, setFormStudent] = useState('');
  const [formDate, setFormDate] = useState('2026-07-15');

  const handleMoveStatus = (id: string, newStatus: 'ASSIGNED' | 'INACTION' | 'RESOLVED') => {
    setCards(prev => prev.map(card => {
      if (card.id === id) {

        
        return {
          ...card,
          status: newStatus,
          // Re-evaluate color on movement if needed
          tagColor: newStatus === 'RESOLVED' ? 'gray' : card.tag === 'ABSENTEE' ? 'pink' : 'cyan'
        };
      }
      return card;
    }));
  };

  const handleAddIntervention = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formSchool) return;

    const newCard: InterventionCard = {
      id: `int-${Date.now()}`,
      tag: formTag,
      tagColor: formTag === 'ABSENTEE' ? 'pink' : formTag === 'DAILY' ? 'gray' : 'cyan',
      title: formTitle,
      desc: formDesc,
      school: formSchool,
      student: formStudent || undefined,
      targetDate: formDate,
      status: 'ASSIGNED'
    };

    setCards(prev => [...prev, newCard]);
    setFormTitle('');
    setFormDesc('');
    setFormSchool('');
    setFormStudent('');
    setModalOpen(false);
  };

  const getCardsByStatus = (status: 'ASSIGNED' | 'INACTION' | 'RESOLVED') => {
    return cards.filter(card => card.status === status);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-[#05050f] text-white space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 pb-5">
        <div>
          <h2 className="text-2xl font-bold tracking-tight font-mono-header">Active Interventions Board</h2>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Designate, monitor, and finalize language bridge campaigns and support systems.
          </p>
        </div>
        
        {/* Top-right "+ Design Intervention" button */}
        <button
          onClick={() => setModalOpen(true)}
          className="mt-4 md:mt-0 btn-gradient px-4 py-2.5 rounded-xl text-xs font-semibold shadow-lg shadow-cyan-500/10 cursor-pointer flex items-center space-x-1.5"
        >
          <Plus className="h-4 w-4" />
          <span>Design Intervention</span>
        </button>
      </div>

      {/* 3 Kanban-style columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start font-sans">
        
        {/* COLUMN 1: ASSIGNED */}
        <div className="bg-[#0d0d1f]/40 border border-white/5 rounded-2xl p-4 flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center space-x-2">
              <span className="h-2 w-2 rounded-full bg-cyan-400"></span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">● ASSIGNED</h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 text-slate-400">
              {getCardsByStatus('ASSIGNED').length}
            </span>
          </div>

          <div className="space-y-4">
            {getCardsByStatus('ASSIGNED').map(card => (
              <div key={card.id} className="glow-card p-5 bg-[#0d0d1f] flex flex-col justify-between space-y-4">
                
                {/* Pill Tag */}
                <div className="flex justify-between items-center">
                  <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                    card.tagColor === 'pink' 
                      ? 'bg-pink-500/10 text-pink-400 border border-pink-500/20' 
                      : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                  }`}>
                    {card.tag}
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono">#{card.id}</span>
                </div>

                {/* Content */}
                <div>
                  <h4 className="text-sm font-bold text-white leading-tight font-mono-header">{card.title}</h4>
                  <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">{card.desc}</p>
                </div>

                {/* Details row */}
                <div className="space-y-1.5 text-[10px] text-slate-400 border-t border-white/5 pt-3">
                  <div className="flex items-center">
                    <span className="mr-1.5 text-slate-500">🏫</span>
                    <span>{card.school}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1.5 text-slate-500" />
                    <span>Target Date: {card.targetDate}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => handleMoveStatus(card.id, 'INACTION')}
                    className="flex items-center space-x-1.5 text-xs text-cyan-400 hover:text-white border border-cyan-500/20 hover:bg-cyan-500/10 px-3 py-1.5 rounded-lg transition-all cursor-pointer font-bold"
                  >
                    <span>Start Action</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>

              </div>
            ))}
            {getCardsByStatus('ASSIGNED').length === 0 && (
              <div className="text-center py-12 text-xs text-slate-600 border border-dashed border-white/5 rounded-2xl">
                No interventions assigned.
              </div>
            )}
          </div>
        </div>

        {/* COLUMN 2: IN ACTION */}
        <div className="bg-[#0d0d1f]/40 border border-white/5 rounded-2xl p-4 flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center space-x-2">
              <span className="h-2 w-2 rounded-full bg-pink-500 animate-pulse"></span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">● IN ACTION</h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 text-slate-400">
              {getCardsByStatus('INACTION').length}
            </span>
          </div>

          <div className="space-y-4">
            {getCardsByStatus('INACTION').map(card => (
              <div key={card.id} className="glow-card p-5 bg-[#0d0d1f] border-t-pink-500/10 flex flex-col justify-between space-y-4">
                
                {/* Pill Tag */}
                <div className="flex justify-between items-center">
                  <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                    card.tagColor === 'pink' 
                      ? 'bg-pink-500/10 text-pink-400 border border-pink-500/20' 
                      : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                  }`}>
                    {card.tag}
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono">#{card.id}</span>
                </div>

                {/* Content */}
                <div>
                  <h4 className="text-sm font-bold text-white leading-tight font-mono-header">{card.title}</h4>
                  <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">{card.desc}</p>
                </div>

                {/* Details row */}
                <div className="space-y-1.5 text-[10px] text-slate-400 border-t border-white/5 pt-3">
                  <div className="flex items-center">
                    <span className="mr-1.5 text-slate-500">🏫</span>
                    <span>{card.school}</span>
                  </div>
                  {card.student && (
                    <div className="flex items-center">
                      <User className="h-3 w-3 mr-1.5 text-slate-500" />
                      <span>Student: {card.student}</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1.5 text-slate-500" />
                    <span>Target Date: {card.targetDate}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => handleMoveStatus(card.id, 'ASSIGNED')}
                    className="flex items-center space-x-1 text-slate-500 hover:text-white text-[11px] transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="h-3 w-3" />
                    <span>Revert</span>
                  </button>
                  <button
                    onClick={() => handleMoveStatus(card.id, 'RESOLVED')}
                    className="flex items-center space-x-1.5 text-xs text-white bg-cyan-600 hover:bg-cyan-700 px-3 py-1.5 rounded-lg transition-all cursor-pointer font-bold shadow shadow-cyan-600/10"
                  >
                    <span>Mark Resolved</span>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </button>
                </div>

              </div>
            ))}
            {getCardsByStatus('INACTION').length === 0 && (
              <div className="text-center py-12 text-xs text-slate-600 border border-dashed border-white/5 rounded-2xl">
                No active interventions.
              </div>
            )}
          </div>
        </div>

        {/* COLUMN 3: RESOLVED */}
        <div className="bg-[#0d0d1f]/40 border border-white/5 rounded-2xl p-4 flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center space-x-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">● RESOLVED</h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 text-slate-400">
              {getCardsByStatus('RESOLVED').length}
            </span>
          </div>

          <div className="space-y-4">
            {getCardsByStatus('RESOLVED').map(card => (
              <div key={card.id} className="p-5 bg-[#0d0d1f]/60 border border-white/5 rounded-2xl opacity-60 flex flex-col justify-between space-y-4">
                
                {/* Pill Tag */}
                <div className="flex justify-between items-center">
                  <span className="px-2 py-0.5 rounded text-[8px] font-bold bg-white/5 text-slate-500 border border-white/5">
                    {card.tag}
                  </span>
                  <span className="text-[9px] text-slate-600 font-mono">#{card.id}</span>
                </div>

                {/* Content */}
                <div>
                  <h4 className="text-sm font-bold text-slate-400 line-through leading-tight font-mono-header">{card.title}</h4>
                  <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">{card.desc}</p>
                </div>

                {/* Details row */}
                <div className="space-y-1.5 text-[10px] text-slate-500 border-t border-white/5 pt-3">
                  <div className="flex items-center">
                    <span className="mr-1.5">🏫</span>
                    <span>{card.school}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex pt-2">
                  <button
                    onClick={() => handleMoveStatus(card.id, 'INACTION')}
                    className="flex items-center space-x-1 text-slate-400 hover:text-white text-[11px] transition-colors cursor-pointer"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Re-activate</span>
                  </button>
                </div>

              </div>
            ))}
            {getCardsByStatus('RESOLVED').length === 0 && (
              <div className="text-center py-12 text-xs text-slate-600 border border-dashed border-white/5 rounded-2xl">
                No resolved interventions.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* DESIGN INTERVENTION MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-sans">
          <div className="max-w-md w-full bg-[#0d0d1f] border border-white/10 rounded-2xl shadow-2xl overflow-hidden text-slate-300">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-sm font-bold tracking-wider uppercase font-mono-header flex items-center space-x-2">
                <Sparkles className="h-4 w-4 text-cyan-400" />
                <span>Design New Intervention</span>
              </h3>
              <button 
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-all cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAddIntervention} className="p-5 space-y-4">
              
              {/* Type tag */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Intervention Tag
                </label>
                <select
                  value={formTag}
                  onChange={(e) => setFormTag(e.target.value)}
                  className="w-full bg-[#05050f] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
                >
                  <option value="BILINGUAL">Bilingual Kit</option>
                  <option value="ABSENTEE">Absenteeism Outreach</option>
                  <option value="DAILY">Daily Subsidy</option>
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Campaign Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bilingual Bridge Materials"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full bg-[#05050f] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>

              {/* School */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Target Government School
                </label>
                <input
                  type="text"
                  placeholder="e.g. GHPS Bantwal Rural"
                  value={formSchool}
                  onChange={(e) => setFormSchool(e.target.value)}
                  className="w-full bg-[#05050f] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>

              {/* Student */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Target Student (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Abhishek Gowda"
                  value={formStudent}
                  onChange={(e) => setFormStudent(e.target.value)}
                  className="w-full bg-[#05050f] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Target Completion Date
                </label>
                <input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full bg-[#05050f] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Scope Description
                </label>
                <textarea
                  placeholder="Describe campaign goals and ship quantities..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full bg-[#05050f] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 h-20"
                  required
                />
              </div>

              {/* Buttons */}
              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="w-1/2 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl text-xs font-bold cursor-pointer transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 btn-gradient py-2.5 rounded-xl text-xs font-bold shadow shadow-cyan-500/10 cursor-pointer flex justify-center items-center space-x-1"
                >
                  <FileText className="h-4 w-4" />
                  <span>Create Campaign</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
