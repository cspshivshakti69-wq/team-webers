import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Search, 
  Trash2, 
  Download, 
  FileText, 
  CheckCircle2, 
  Sparkles,
  AlertCircle
} from 'lucide-react';

interface StudyNote {
  id: string;
  subject: string;
  name: string;
  date: string;
  size: string;
}

export const MyNotes: React.FC = () => {
  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [selectedTag, setSelectedTag] = useState('Physics');
  const [searchQuery, setSearchQuery] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      addMockFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      addMockFile(e.target.files[0]);
    }
  };

  const addMockFile = (file: File) => {
    if (file.type !== "application/pdf" && !file.name.endsWith('.pdf')) {
      setUploadMessage("Error: Only PDF files are allowed.");
      setTimeout(() => setUploadMessage(null), 3000);
      return;
    }

    const sizeKB = Math.round(file.size / 1024);
    const sizeString = sizeKB > 1024 
      ? `${(sizeKB / 1024).toFixed(1)} MB` 
      : `${sizeKB} KB`;

    const newNote: StudyNote = {
      id: `note-${Date.now()}`,
      subject: selectedTag,
      name: file.name,
      date: new Date().toLocaleDateString(),
      size: sizeString
    };

    setNotes(prev => [newNote, ...prev]);
    setUploadMessage(`Success: "${file.name}" uploaded successfully!`);
    setTimeout(() => setUploadMessage(null), 3000);
  };

  const handleDeleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  // Filter notes
  const filteredNotes = notes.filter(note => {
    return note.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
           note.subject.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-[#05050f] text-white space-y-6">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 pb-5">
        <div>
          <h2 className="text-2xl font-bold tracking-tight font-mono-header">My Notes</h2>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Upload and manage your study PDF notes.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start font-sans">
        
        {/* Upload Notes Panel (5 Cols) */}
        <div className="lg:col-span-5 glow-card p-6 space-y-5">
          <h3 className="text-sm font-bold tracking-wider uppercase font-mono-header flex items-center space-x-2">
            <Sparkles className="h-4.5 w-4.5 text-cyan-400" />
            <span>Upload PDF Note</span>
          </h3>

          {/* Subject Pills selector */}
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Tag Subject
            </label>
            <div className="flex flex-wrap gap-1.5">
              {['Physics', 'Chemistry', 'Mathematics', 'Biology', 'General Knowledge', 'Other'].map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTag(tag)}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all cursor-pointer ${
                    selectedTag === tag
                      ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40 shadow-sm'
                      : 'bg-white/5 text-slate-400 border-transparent hover:border-white/10'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Drag & Drop Zone */}
          <div 
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-3 ${
              dragActive 
                ? 'border-cyan-400 bg-cyan-950/10' 
                : 'border-white/10 hover:border-white/20 bg-[#05050f]'
            }`}
          >
            <input 
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
            />
            <Upload className="h-7 w-7 text-slate-500" />
            <div className="text-xs text-slate-300">
              Drop PDFs here or <span className="text-cyan-400 font-bold hover:underline">click to browse</span>
            </div>
            <p className="text-[9px] text-slate-500">
              PDF only · Max 10 MB per file
            </p>
          </div>

          {uploadMessage && (
            <div className={`p-3 rounded-xl text-xs flex items-center space-x-2 border ${
              uploadMessage.startsWith('Success') 
                ? 'bg-emerald-950/20 border-emerald-500/25 text-emerald-400' 
                : 'bg-red-950/20 border-red-500/25 text-red-400'
            }`}>
              {uploadMessage.startsWith('Success') ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              <span className="font-semibold">{uploadMessage}</span>
            </div>
          )}
        </div>

        {/* Saved Notes List (7 Cols) */}
        <div className="lg:col-span-7 glow-card p-6 flex flex-col justify-between min-h-[340px]">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold tracking-wider uppercase font-mono-header">
                📚 Saved Notes ({notes.length})
              </h3>
              
              {/* Search input */}
              <div className="relative max-w-xs w-full">
                <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-500">
                  <Search className="h-3.5 w-3.5" />
                </span>
                <input
                  type="text"
                  placeholder="Search notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#05050f] border border-white/10 rounded-lg py-1.5 pl-8 pr-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto mt-2 space-y-3">
            {filteredNotes.length > 0 ? (
              filteredNotes.map(note => (
                <div key={note.id} className="p-3.5 bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-between text-xs hover:border-white/10 transition-colors">
                  <div className="flex items-center space-x-3.5">
                    <div className="h-9 w-9 rounded-lg bg-purple-950/50 border border-purple-500/25 flex items-center justify-center text-purple-400">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-bold text-white max-w-[200px] truncate">{note.name}</div>
                      <div className="text-[9px] text-slate-500 mt-1 flex space-x-2 font-mono">
                        <span>📅 {note.date}</span>
                        <span>📦 {note.size}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded text-[8px] font-extrabold uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      {note.subject}
                    </span>
                    <button 
                      onClick={() => alert("Simulating file download...")}
                      className="text-slate-400 hover:text-cyan-400 transition-colors p-1.5 rounded hover:bg-white/5 cursor-pointer"
                      title="Download PDF"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteNote(note.id)}
                      className="text-slate-500 hover:text-red-400 transition-colors p-1.5 rounded hover:bg-white/5 cursor-pointer"
                      title="Delete Note"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16 text-xs text-slate-600 font-sans">
                No notes yet. Upload a PDF above.
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
