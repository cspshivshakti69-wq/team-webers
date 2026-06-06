import React, { useState, useEffect } from 'react';
import { ShieldCheck, XCircle, Check, AlertCircle, Eye } from 'lucide-react';

interface PendingUser {
  id: string;
  name: string;
  email: string;
  role: string;
  schoolName?: string;
  employeeId?: string;
  diseCode?: string;
  district?: string;
  taluk?: string;
  designation?: string;
  mobile?: string;
  status: string;
  fileName?: string;
}

export const AdminPendingApprovals: React.FC = () => {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadPendingUsers();
  }, []);

  const loadPendingUsers = () => {
    try {
      const usersRaw = localStorage.getItem('ks-registered-users');
      if (usersRaw) {
        const allUsers: PendingUser[] = JSON.parse(usersRaw);
        // Filter only pending status
        const pending = allUsers.filter(u => u.status === 'pending');
        setPendingUsers(pending);
      } else {
        // Populate default pending users if none exist for demo
        const defaultPending: PendingUser[] = [
          {
            id: 'demo-pend-1',
            name: 'Dr. Girish Karnad',
            email: 'girish.karnad@karnataka.gov.in',
            role: 'DEPARTMENT',
            designation: 'Senior Education Officer',
            employeeId: 'EMP-SEO-8910',
            district: 'Dakshina Kannada',
            taluk: 'Mangaluru',
            mobile: '9845012345',
            status: 'pending',
            fileName: 'authorized_gov_letter_seo.pdf'
          },
          {
            id: 'demo-pend-2',
            name: 'Shruthi Hegde',
            email: 'shruthi.hegde@kannadaseva.edu',
            role: 'ADMIN',
            schoolName: 'GHPS Bantwal Rural',
            diseCode: '29240101502',
            mobile: '8877665544',
            status: 'pending',
            fileName: 'dise_declaration_bantwal.png'
          }
        ];
        localStorage.setItem('ks-registered-users', JSON.stringify(defaultPending));
        setPendingUsers(defaultPending);
      }
    } catch (err) {
      console.error('Failed to load pending users', err);
    }
  };

  const handleAction = (userId: string, action: 'approve' | 'reject') => {
    try {
      const usersRaw = localStorage.getItem('ks-registered-users');
      if (usersRaw) {
        let allUsers: PendingUser[] = JSON.parse(usersRaw);
        const userIndex = allUsers.findIndex(u => u.id === userId);

        if (userIndex > -1) {
          if (action === 'approve') {
            allUsers[userIndex].status = 'active';
            setFeedbackMsg({ type: 'success', text: `Successfully approved ${allUsers[userIndex].name}'s registration.` });
            
            // Add to audit trail
            const auditTrail = JSON.parse(localStorage.getItem('ks-audit-log') || '[]');
            auditTrail.unshift({
              id: `aud-${Date.now()}`,
              timestamp: new Date().toLocaleString(),
              user: 'Super Admin',
              action: `Approved User Account`,
              details: `User: ${allUsers[userIndex].name} (${allUsers[userIndex].role})`
            });
            localStorage.setItem('ks-audit-log', JSON.stringify(auditTrail.slice(0, 50)));

          } else {
            allUsers[userIndex].status = 'rejected';
            setFeedbackMsg({ type: 'error', text: `Rejected and removed ${allUsers[userIndex].name}'s request.` });
            // Actually delete or keep as rejected
            allUsers = allUsers.filter(u => u.id !== userId);
          }

          localStorage.setItem('ks-registered-users', JSON.stringify(allUsers));
          loadPendingUsers();
          setIsModalOpen(false);
          setSelectedUser(null);
        }
      }
    } catch (err) {
      console.error(err);
      setFeedbackMsg({ type: 'error', text: 'An error occurred while handling approval request.' });
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-[#05050f] text-white space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 pb-5">
        <div>
          <span className="text-xs font-bold text-purple-400 uppercase tracking-widest font-mono">System Approvals</span>
          <h2 className="text-2xl font-bold tracking-tight mt-1 font-mono-header">Verification Queue</h2>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Approve or reject registration requests from Administrators and Education Department Officers by verifying their credentials and official ID uploads.
          </p>
        </div>
      </div>

      {/* Toast Feedback */}
      {feedbackMsg && (
        <div className={`p-4 rounded-xl border flex items-center space-x-3 text-xs font-semibold ${
          feedbackMsg.type === 'success' ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-400' : 'bg-red-950/20 border-red-500/20 text-red-400'
        }`}>
          {feedbackMsg.type === 'success' ? <ShieldCheck className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
          <span>{feedbackMsg.text}</span>
          <button onClick={() => setFeedbackMsg(null)} className="ml-auto hover:text-white cursor-pointer">✕</button>
        </div>
      )}

      {/* Approvals Table */}
      <div className="glass-morphism rounded-2xl border border-white/5 overflow-hidden">
        <div className="p-4 border-b border-white/5 bg-[#0d0d1f]/40 flex justify-between items-center">
          <span className="text-xs font-bold text-slate-400 font-mono uppercase">
            Pending Requests ({pendingUsers.length})
          </span>
        </div>

        {pendingUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead>
                <tr className="border-b border-white/5 text-slate-400 uppercase font-mono text-[10px]">
                  <th className="p-4">Name / Contact</th>
                  <th className="p-4">Requested Role</th>
                  <th className="p-4">Assigned Location</th>
                  <th className="p-4">Verification Code / ID</th>
                  <th className="p-4 text-center">Uploaded File</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {pendingUsers.map(u => (
                  <tr key={u.id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-white text-sm">{u.name}</div>
                      <div className="text-slate-400 font-mono text-[10px] mt-0.5">{u.email}</div>
                      <div className="text-slate-500 text-[10px] mt-0.5">📞 {u.mobile || 'N/A'}</div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold tracking-wider ${
                        u.role === 'ADMIN' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                      }`}>
                        {u.role}
                      </span>
                      {u.designation && <span className="block text-[10px] text-slate-400 mt-1">{u.designation}</span>}
                    </td>
                    <td className="p-4">
                      {u.role === 'ADMIN' ? (
                        <div className="truncate max-w-[180px] font-semibold text-slate-300">
                          {u.schoolName}
                        </div>
                      ) : (
                        <div>
                          <div className="font-semibold text-slate-300">{u.district}</div>
                          <div className="text-[10px] text-slate-500">{u.taluk} Taluk</div>
                        </div>
                      )}
                    </td>
                    <td className="p-4 font-mono font-bold text-slate-300">
                      {u.role === 'ADMIN' ? (
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase block">DISE Code:</span>
                          {u.diseCode || 'N/A'}
                        </div>
                      ) : (
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase block">Employee ID:</span>
                          {u.employeeId || 'N/A'}
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => {
                          setSelectedUser(u);
                          setIsModalOpen(true);
                        }}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-white/10 hover:border-cyan-500/40 hover:bg-cyan-950/20 text-slate-300 hover:text-cyan-400 transition-all cursor-pointer font-semibold"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Inspect File</span>
                      </button>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => handleAction(u.id, 'approve')}
                        className="p-1.5 bg-emerald-600/15 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-black rounded-lg transition-all cursor-pointer inline-flex items-center space-x-1"
                        title="Approve Account"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleAction(u.id, 'reject')}
                        className="p-1.5 bg-red-600/15 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-black rounded-lg transition-all cursor-pointer inline-flex items-center space-x-1"
                        title="Reject / Delete Account"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center text-slate-500">
            <ShieldCheck className="h-12 w-12 text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-semibold">All registrations verified!</p>
            <p className="text-xs text-slate-600 mt-1">There are no pending approval tickets in the validation queue.</p>
          </div>
        )}
      </div>

      {/* Document Inspector Modal */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-[#0c0c1e] border border-white/10 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-white/5 bg-[#0f0f29]/80 flex justify-between items-center">
              <div>
                <h3 className="font-bold font-mono-header text-white text-md">Document Inspector</h3>
                <span className="text-[10px] text-slate-400 font-mono">File: {selectedUser.fileName || 'document_upload.pdf'}</span>
              </div>
              <button 
                onClick={() => { setIsModalOpen(false); setSelectedUser(null); }}
                className="text-slate-400 hover:text-white cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>

            {/* Modal Body: Mock Document Certificate */}
            <div className="p-6 overflow-y-auto max-h-[480px] bg-[#05050f]/80 flex flex-col items-center justify-center">
              
              {/* Premium Looking Government Verification Document Mock */}
              <div className="w-full max-w-lg bg-white text-black p-6 rounded-lg shadow-xl border-4 border-double border-slate-700 relative select-none">
                {/* Background Seal watermark */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                  <div className="w-80 h-80 rounded-full border-[16px] border-slate-800 flex items-center justify-center text-4xl font-extrabold font-serif">
                    GOVT OF KARNATAKA
                  </div>
                </div>

                {/* Gov Header */}
                <div className="text-center border-b border-slate-300 pb-3 mb-4 font-serif">
                  <div className="font-extrabold text-[13px] tracking-wide">GOVERNMENT OF KARNATAKA</div>
                  <div className="text-[10px] text-slate-600 font-bold uppercase mt-0.5">Department of School Education & Literacy</div>
                  <div className="text-[8px] text-slate-500 font-mono mt-1">Ref ID: CERT/VERIFY-{selectedUser.id.toUpperCase()}</div>
                </div>

                <div className="space-y-4 text-[11px] font-sans text-slate-800">
                  <p className="text-center font-bold text-[12px] underline tracking-tight uppercase">
                    Authorization & Declaration Certificate
                  </p>

                  <p className="leading-relaxed">
                    This document declares that the registered officer/administrator named below has filed an application for the Kannada Seva web portal credentials.
                  </p>

                  <div className="bg-slate-100 p-3 rounded border border-slate-200 grid grid-cols-2 gap-2 text-[10px] font-mono">
                    <div>
                      <span className="text-slate-500 block uppercase text-[8px]">Applicant Name:</span>
                      <strong className="text-slate-900">{selectedUser.name}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block uppercase text-[8px]">Email Address:</span>
                      <strong className="text-slate-900">{selectedUser.email}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block uppercase text-[8px]">Assigned Role:</span>
                      <strong className="text-slate-900">{selectedUser.role}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block uppercase text-[8px]">Verification ID:</span>
                      <strong className="text-slate-900">
                        {selectedUser.role === 'ADMIN' ? `DISE: ${selectedUser.diseCode}` : `EMP ID: ${selectedUser.employeeId}`}
                      </strong>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-500 block uppercase text-[8px]">Jurisdiction:</span>
                      <strong className="text-slate-900">
                        {selectedUser.role === 'ADMIN' ? selectedUser.schoolName : `${selectedUser.district} District, ${selectedUser.taluk} Taluk`}
                      </strong>
                    </div>
                  </div>

                  <p className="leading-relaxed text-[9px] text-slate-500 italic">
                    Note: The applicant has certified that the DISE codes and Government employee identifiers match state registry records. This electronic record represents proof uploaded via file attachment targets.
                  </p>

                  {/* Stamp & Seal layout */}
                  <div className="flex justify-between items-end pt-6">
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full border-2 border-dashed border-cyan-800 text-cyan-800 text-[8px] font-bold flex flex-col items-center justify-center rotate-[-12deg] opacity-75">
                        <span>VERIFIED</span>
                        <span>OFFICE COPY</span>
                      </div>
                    </div>
                    <div className="text-right font-serif text-[10px] text-slate-700">
                      <div className="h-6 w-24 border-b border-slate-400 mx-auto"></div>
                      <span className="font-bold block mt-1">Digital Signature Authority</span>
                      <span className="text-[8px] text-slate-400 block mt-0.5">District Commissionerate</span>
                    </div>
                  </div>

                </div>

              </div>

              {/* Warning/Alert */}
              <div className="w-full max-w-lg mt-4 bg-purple-950/20 border border-purple-500/25 p-3 rounded-xl flex items-start space-x-2 text-[10px] text-purple-300">
                <AlertCircle className="h-4.5 w-4.5 flex-shrink-0 mt-0.5" />
                <span>
                  Please double-check the verified school name or department jurisdiction. Approving this profile will instantly activate portal credentials, and an activation receipt will be simulated via logs.
                </span>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-white/5 bg-[#0f0f29]/80 flex justify-end space-x-3">
              <button
                onClick={() => { setIsModalOpen(false); setSelectedUser(null); }}
                className="px-4 py-2 border border-white/10 hover:bg-white/5 text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
              >
                Close Inspector
              </button>
              <button
                onClick={() => handleAction(selectedUser.id, 'reject')}
                className="px-4 py-2 bg-red-600/20 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-black rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Reject & Delete
              </button>
              <button
                onClick={() => handleAction(selectedUser.id, 'approve')}
                className="px-4 py-2 btn-gradient text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-500/10 cursor-pointer flex items-center space-x-1.5"
              >
                <Check className="h-4 w-4" />
                <span>Verify & Approve</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
