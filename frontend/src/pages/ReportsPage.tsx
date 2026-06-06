import React, { useState, useRef } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import Papa from 'papaparse';
import { 
  FileText, 
  Download, 
  Upload, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle,
  Clock
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [exportLoading, setExportLoading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);

  // Mock data for exports
  const metricsData = [
    { schoolName: 'GHPS Mangaluru Port', taluk: 'Mangaluru', enrolled: 124, threatCount: 18, declineRate: '-6.4%', riskIndex: 87.4 },
    { schoolName: 'GHS Puttur Town', taluk: 'Puttur', enrolled: 198, threatCount: 14, declineRate: '-4.8%', riskIndex: 69.4 },
    { schoolName: 'GHPS Bantwal Rural', taluk: 'Bantwal', enrolled: 85, threatCount: 19, declineRate: '-5.2%', riskIndex: 76.8 },
    { schoolName: 'GHPS Hunsur Forest Edge', taluk: 'Hunsur', enrolled: 110, threatCount: 12, declineRate: '-6.8%', riskIndex: 82.1 },
    { schoolName: 'GHPS Chamarajanagar Hill', taluk: 'Chamarajanagar', enrolled: 72, threatCount: 8, declineRate: '-7.1%', riskIndex: 81.2 }
  ];

  const interventionsData = [
    { id: 'int-1', tag: 'BILINGUAL', title: 'Bilingual Bridge Materials Distribution', school: 'GHPS Hunsur Forest Edge', date: '2026-06-30', status: 'ASSIGNED' },
    { id: 'int-2', tag: 'ABSENTEE', title: 'Absenteeism Intervention Campaign', school: 'GHPS Bantwal Rural', date: '2026-06-15', status: 'INACTION' },
    { id: 'int-3', tag: 'DAILY', title: 'Daily Commute Transport Subsidy', school: 'GHPS Chamarajanagar Hill', date: '2026-05-30', status: 'RESOLVED' }
  ];

  // 1. PDF Download using jsPDF & html2canvas
  const downloadPDFSummary = async () => {
    if (!summaryRef.current) return;
    setExportLoading(true);

    try {
      const element = summaryRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#ffffff', // Force white bg for high contrast print
        logging: false
      });

      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 size
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save('Kannada-Seva-Executive-Summary-2026.pdf');
    } catch (err) {
      console.error('Error generating PDF', err);
    } finally {
      setExportLoading(false);
    }
  };

  // 2. CSV Exports
  const downloadCSVSpreadsheet = (filename: string, data: any[]) => {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // 3. Drag and drop uploader
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
      parseCSV(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      parseCSV(e.target.files[0]);
    }
  };

  const parseCSV = (file: File) => {
    if (file.type !== "text/csv" && !file.name.endsWith('.csv')) {
      setUploadStatus("Error: Only CSV files are supported.");
      return;
    }

    Papa.parse(file, {
      complete: (results) => {
        setUploadStatus(`Success: Parsed ${results.data.length - 1} rows from "${file.name}" dynamically!`);
      },
      error: (error) => {
        setUploadStatus(`Error parsing CSV: ${error.message}`);
      }
    });
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-[#05050f] text-white space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 pb-5">
        <div>
          <h2 className="text-2xl font-bold tracking-tight font-mono-header">Analytics Export & Reports</h2>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Download legal compliance papers, local council slide decks, or batch upload student logs.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start font-sans">
        
        {/* Left Column: Export Controls & CSV Upload (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Analytical Export Hub */}
          <div className="glow-card p-6 space-y-4">
            <div>
              <h3 className="text-sm font-bold tracking-wider uppercase font-mono-header">Analytical Export Hub</h3>
              <p className="text-xs text-slate-400 mt-1">
                Generate high fidelity summaries for presentations, regulatory audits, or offline analysis.
              </p>
            </div>

            <div className="space-y-2 text-xs">
              
              {/* Row 1: PDF */}
              <button
                onClick={downloadPDFSummary}
                disabled={exportLoading}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-white/5 bg-[#05050f] hover:bg-white/5 hover:border-white/10 transition-all cursor-pointer text-left font-bold"
              >
                <div className="flex items-center space-x-3 text-white">
                  <FileText className="h-4.5 w-4.5 text-cyan-400" />
                  <span>{exportLoading ? 'Compiling PDF...' : 'Download PDF Analytical Summary'}</span>
                </div>
                <Download className="h-4 w-4 text-slate-500" />
              </button>

              {/* Row 2: CSV Metrics */}
              <button
                onClick={() => downloadCSVSpreadsheet('Kannada-Seva-Metrics-2026', metricsData)}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-white/5 bg-[#05050f] hover:bg-white/5 hover:border-white/10 transition-all cursor-pointer text-left font-bold"
              >
                <div className="flex items-center space-x-3 text-white">
                  <FileSpreadsheet className="h-4.5 w-4.5 text-purple-400" />
                  <span>Export Metrics Spreadsheet (CSV)</span>
                </div>
                <Download className="h-4 w-4 text-slate-500" />
              </button>

              {/* Row 3: CSV Interventions */}
              <button
                onClick={() => downloadCSVSpreadsheet('Kannada-Seva-Interventions-Logs-2026', interventionsData)}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-white/5 bg-[#05050f] hover:bg-white/5 hover:border-white/10 transition-all cursor-pointer text-left font-bold"
              >
                <div className="flex items-center space-x-3 text-white">
                  <FileSpreadsheet className="h-4.5 w-4.5 text-pink-400" />
                  <span>Export Interventions Logs (CSV)</span>
                </div>
                <Download className="h-4 w-4 text-slate-500" />
              </button>

            </div>

            <p className="text-[10px] text-slate-500 italic font-sans leading-normal pt-1">
              Note: Report matrices are automatically compiled from local database transactions. PDF generator incorporates active CSS printing protocols.
            </p>
          </div>

          {/* Batch Enrolment Uploader */}
          <div className="glow-card p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-sm font-bold tracking-wider uppercase font-mono-header">Batch Enrolment Uploader</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Import multiple student records from a CSV file directly.
                </p>
              </div>

              {/* Download Template */}
              <button
                onClick={() => downloadCSVSpreadsheet('Kannada-Seva-Enrolment-Template', [
                  { studentName: 'Full Name', school: 'School Name', grade: 'Grade Level', attendanceRate: '85.5', languageGap: '42.0' }
                ])}
                className="text-[9px] font-bold px-2 py-1 bg-white/5 border border-white/10 hover:border-white/20 text-slate-400 hover:text-white rounded cursor-pointer transition-all flex items-center space-x-1"
              >
                <span>📥 Template</span>
              </button>
            </div>

            {/* Drag & Drop Zone */}
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-3 ${
                dragActive 
                  ? 'border-cyan-400 bg-cyan-950/10' 
                  : 'border-white/10 hover:border-white/20 bg-[#05050f]'
              }`}
            >
              <input 
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <Upload className="h-7 w-7 text-slate-500" />
              <div className="text-xs text-slate-300">
                Drag and drop file or <span className="text-cyan-400 font-bold hover:underline">browse files</span>
              </div>
              <p className="text-[9px] text-slate-500">
                CSV format up to 2MB. (Primary columns matched dynamically)
              </p>
            </div>

            {uploadStatus && (
              <div className={`p-3 rounded-xl text-xs flex items-center space-x-2 border ${
                uploadStatus.startsWith('Success') 
                  ? 'bg-emerald-950/20 border-emerald-500/25 text-emerald-400' 
                  : 'bg-red-950/20 border-red-500/25 text-red-400'
              }`}>
                {uploadStatus.startsWith('Success') ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                <span className="font-semibold">{uploadStatus}</span>
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Live Summary Preview (7 Cols) */}
        <div className="lg:col-span-7 space-y-3">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-2">
            Executive Summary (Draft) — Live Preview
          </span>

          {/* Styled Document Card */}
          <div className="border border-white/10 rounded-2xl overflow-hidden shadow-2xl bg-white text-black p-8 max-w-2xl mx-auto font-serif" id="executive-summary-preview" ref={summaryRef}>
            
            {/* Document Header */}
            <div className="border-b-2 border-black pb-4 flex justify-between items-start">
              <div>
                <div className="flex items-center space-x-1">
                  <span className="h-3 w-3 bg-blue-700 block"></span>
                  <h1 className="text-lg font-black uppercase tracking-tight text-blue-900 font-sans">
                    KANNADA SEVA
                  </h1>
                </div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-700 font-sans mt-0.5">
                  AI-POWERED EDUCATION ANALYTICS & INTERVENTIONS
                </p>
              </div>
              <div className="text-right text-[9px] font-mono text-slate-600 space-y-0.5">
                <div>Reference: KS-AI-2026-COMP-094</div>
                <div className="flex items-center justify-end">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>Compiled: June 4, 2026</span>
                </div>
              </div>
            </div>

            {/* Document Content */}
            <div className="py-6 space-y-6 text-xs leading-relaxed text-slate-800">
              
              {/* Section 1 */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 font-sans">
                  1. EXECUTIVE OUTLINE
                </h3>
                <p className="mt-2 text-[11px]">
                  This report documents predictive demographics inside government schools across Karnataka. AI models analyze attendance dips against harvest cycles and linguistic gaps to target bilingual kits and transport subsidies, reversing enrolment declines.
                </p>
              </div>

              {/* Section 2 */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 font-sans">
                  2. CONSOLIDATED STATE PERFORMANCE STATISTICS
                </h3>
                <div className="mt-3 grid grid-cols-2 gap-4 text-[10px] font-sans font-semibold bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div>
                    <span className="text-slate-500 uppercase block text-[8px] tracking-wider">Monitored Schools</span>
                    <span className="text-slate-900">20 Schools | 2,961 Students</span>
                  </div>
                  <div>
                    <span className="text-slate-500 uppercase block text-[8px] tracking-wider">State Risk Profile</span>
                    <span className="text-slate-900">61.0% High/Elevated Quotient</span>
                  </div>
                  <div>
                    <span className="text-slate-500 uppercase block text-[8px] tracking-wider">Dropout Threat Level</span>
                    <span className="text-slate-900">319 Students requires action</span>
                  </div>
                  <div>
                    <span className="text-slate-500 uppercase block text-[8px] tracking-wider">Annual Medium Decline</span>
                    <span className="text-red-600">-5.6% Kannada medium</span>
                  </div>
                </div>
              </div>

              {/* Section 3 */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 font-sans">
                  3. SCHOOLS PERFORMANCE PROFILE
                </h3>
                
                <table className="w-full mt-3 text-left border-collapse text-[10px] font-sans">
                  <thead>
                    <tr className="border-b border-slate-300 text-slate-600 font-bold uppercase text-[9px]">
                      <th className="py-2">School Name</th>
                      <th className="py-2">Taluk / Dist</th>
                      <th className="py-2 text-center">Enrolled</th>
                      <th className="py-2 text-center">Threat Count</th>
                      <th className="py-2 text-center">Decline Rate</th>
                      <th className="py-2 text-right">Risk Index</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-100">
                      <td className="py-2 font-bold text-slate-900">GHPS Mangaluru Port</td>
                      <td className="py-2 text-slate-500">Mangaluru (Dakshina)</td>
                      <td className="py-2 text-center">124</td>
                      <td className="py-2 text-center">18</td>
                      <td className="py-2 text-center text-red-600 font-semibold">-6.4%</td>
                      <td className="py-2 text-right font-bold">87.4%</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-2 font-bold text-slate-900">GHS Puttur Town</td>
                      <td className="py-2 text-slate-500">Puttur (Dakshina)</td>
                      <td className="py-2 text-center">198</td>
                      <td className="py-2 text-center">14</td>
                      <td className="py-2 text-center text-red-600 font-semibold">-4.8%</td>
                      <td className="py-2 text-right font-bold">69.4%</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-2 font-bold text-slate-900">GHPS Bantwal Rural</td>
                      <td className="py-2 text-slate-500">Bantwal (Dakshina)</td>
                      <td className="py-2 text-center">85</td>
                      <td className="py-2 text-center">19</td>
                      <td className="py-2 text-center text-red-600 font-semibold">-5.2%</td>
                      <td className="py-2 text-right font-bold">76.8%</td>
                    </tr>
                  </tbody>
                </table>
              </div>

            </div>

            {/* Document Footer */}
            <div className="border-t border-slate-200 mt-6 pt-3 text-[9px] font-sans text-slate-500 flex justify-between">
              <span>Department of Primary Education, Government of Karnataka</span>
              <span>Page 1 of 1</span>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
