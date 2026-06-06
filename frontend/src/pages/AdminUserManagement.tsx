import React, { useState, useEffect } from 'react';
import { MOCK_PROFILES } from '../context/AuthContext';
import { Search, Edit3, Trash2, ShieldAlert, Check, ShieldOff, AlertCircle } from 'lucide-react';

interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'TEACHER' | 'GUARDIAN' | 'STUDENT' | 'DEPARTMENT';
  schoolName?: string;
  status: 'active' | 'pending' | 'suspended';
}

export const AdminUserManagement: React.FC = () => {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('All');
  
  // Edit modal state
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
  const [editRole, setEditRole] = useState<SystemUser['role']>('STUDENT');
  const [editStatus, setEditStatus] = useState<SystemUser['status']>('active');

  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    try {
      // 1. Gather default static mock profiles
      const defaultUsers: SystemUser[] = Object.values(MOCK_PROFILES).map(profile => ({
        id: profile.id,
        name: profile.name,
        email: profile.email,
        role: profile.role,
        schoolName: profile.schoolName || 'Government High School Bengaluru',
        status: 'active' as const
      }));

      // 2. Gather registered users from localStorage
      const registeredRaw = localStorage.getItem('ks-registered-users') || '[]';
      const registeredUsers = JSON.parse(registeredRaw).map((u: any) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        schoolName: u.schoolName,
        status: u.status || 'active'
      }));

      // Combine both lists (avoid email duplicates to keep it clean)
      const combined: SystemUser[] = [...defaultUsers];
      registeredUsers.forEach((regUser: SystemUser) => {
        if (!combined.some(u => u.email.toLowerCase() === regUser.email.toLowerCase())) {
          combined.push(regUser);
        }
      });

      setUsers(combined);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditClick = (user: SystemUser) => {
    setEditingUser(user);
    setEditRole(user.role);
    setEditStatus(user.status);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      // Static profiles cannot have their roles edited in localStorage directly (they boot on mount)
      // So we save overrides to ks-registered-users, or if editing a registered user we find and change it.
      const registeredRaw = localStorage.getItem('ks-registered-users') || '[]';
      let registeredUsers = JSON.parse(registeredRaw);
      
      const userIdx = registeredUsers.findIndex((u: any) => u.id === editingUser.id || u.email.toLowerCase() === editingUser.email.toLowerCase());
      
      if (userIdx > -1) {
        registeredUsers[userIdx].role = editRole;
        registeredUsers[userIdx].status = editStatus;
        if (editRole === 'DEPARTMENT') {
          registeredUsers[userIdx].schoolName = 'Karnataka Education Department';
        }
      } else {
        // Create an override registry for the static user
        registeredUsers.push({
          id: editingUser.id,
          name: editingUser.name,
          email: editingUser.email,
          role: editRole,
          schoolName: editingUser.schoolName,
          status: editStatus,
          password: 'demo-password-123'
        });
      }

      localStorage.setItem('ks-registered-users', JSON.stringify(registeredUsers));
      
      // Update Audit log
      const auditTrail = JSON.parse(localStorage.getItem('ks-audit-log') || '[]');
      auditTrail.unshift({
        id: `aud-${Date.now()}`,
        timestamp: new Date().toLocaleString(),
        user: 'Super Admin',
        action: `Modified User Settings`,
        details: `Updated ${editingUser.name} to Role: ${editRole}, Status: ${editStatus}`
      });
      localStorage.setItem('ks-audit-log', JSON.stringify(auditTrail.slice(0, 50)));

      setToast({ type: 'success', msg: `Updated ${editingUser.name} details successfully.` });
      setEditingUser(null);
      loadUsers();
    } catch (err) {
      console.error(err);
      setToast({ type: 'error', msg: 'Failed to update user registry.' });
    }
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    if (!confirm(`Are you absolutely sure you want to delete the user account: ${userName}? This action is permanent.`)) {
      return;
    }

    try {
      const registeredRaw = localStorage.getItem('ks-registered-users') || '[]';
      let registeredUsers = JSON.parse(registeredRaw);
      
      registeredUsers = registeredUsers.filter((u: any) => u.id !== userId);
      localStorage.setItem('ks-registered-users', JSON.stringify(registeredUsers));

      // Update Audit log
      const auditTrail = JSON.parse(localStorage.getItem('ks-audit-log') || '[]');
      auditTrail.unshift({
        id: `aud-${Date.now()}`,
        timestamp: new Date().toLocaleString(),
        user: 'Super Admin',
        action: `Deleted User Account`,
        details: `Removed user: ${userName}`
      });
      localStorage.setItem('ks-audit-log', JSON.stringify(auditTrail.slice(0, 50)));

      setToast({ type: 'success', msg: `Successfully removed ${userName} from user registry.` });
      loadUsers();
    } catch (err) {
      console.error(err);
      setToast({ type: 'error', msg: 'Failed to remove user account.' });
    }
  };

  const handleToggleSuspension = (user: SystemUser) => {
    const nextStatus = user.status === 'suspended' ? 'active' : 'suspended';
    try {
      const registeredRaw = localStorage.getItem('ks-registered-users') || '[]';
      let registeredUsers = JSON.parse(registeredRaw);
      
      const userIdx = registeredUsers.findIndex((u: any) => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase());
      
      if (userIdx > -1) {
        registeredUsers[userIdx].status = nextStatus;
      } else {
        // Create override entry
        registeredUsers.push({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          schoolName: user.schoolName,
          status: nextStatus,
          password: 'demo-password-123'
        });
      }

      localStorage.setItem('ks-registered-users', JSON.stringify(registeredUsers));

      const auditTrail = JSON.parse(localStorage.getItem('ks-audit-log') || '[]');
      auditTrail.unshift({
        id: `aud-${Date.now()}`,
        timestamp: new Date().toLocaleString(),
        user: 'Super Admin',
        action: nextStatus === 'suspended' ? `Suspended User` : `Re-activated User`,
        details: `User: ${user.name} (${user.role})`
      });
      localStorage.setItem('ks-audit-log', JSON.stringify(auditTrail.slice(0, 50)));

      setToast({ type: 'success', msg: `${nextStatus === 'suspended' ? 'Suspended' : 'Activated'} ${user.name} account successfully.` });
      loadUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesQuery = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (u.schoolName && u.schoolName.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (selectedRole === 'All') return matchesQuery;
    return matchesQuery && u.role === selectedRole;
  });

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-[#05050f] text-white space-y-6">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 pb-5">
        <div>
          <span className="text-xs font-bold text-purple-400 uppercase tracking-widest font-mono">System Directory</span>
          <h2 className="text-2xl font-bold tracking-tight mt-1 font-mono-header">User Management</h2>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Audit register listings, toggle account suspension flags, modify system access roles, and remove credentials for registered users.
          </p>
        </div>
      </div>

      {/* Toast alert */}
      {toast && (
        <div className={`p-4 rounded-xl border flex items-center space-x-3 text-xs font-bold ${
          toast.type === 'success' ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-400' : 'bg-red-950/20 border-red-500/20 text-red-400'
        }`}>
          <span>{toast.type === 'success' ? '✅' : '❌'} {toast.msg}</span>
          <button onClick={() => setToast(null)} className="ml-auto hover:text-white cursor-pointer">✕</button>
        </div>
      )}

      {/* Filter Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#0d0d1f] p-4 rounded-2xl border border-white/5 font-sans">
        
        {/* Search */}
        <div className="relative sm:col-span-2">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
            <Search className="h-4 w-4" />
          </span>
          <input 
            type="text" 
            placeholder="Search users by name, email, or school registry..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-[#05050f] border border-white/5 focus:border-cyan-500/40 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none transition-all"
          />
        </div>

        {/* Role Filter */}
        <div>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="w-full py-2.5 px-3 bg-[#05050f] border border-white/5 focus:border-cyan-500/40 rounded-xl text-xs text-white focus:outline-none cursor-pointer"
          >
            <option value="All">All Access Roles</option>
            <option value="ADMIN">Super Administrators (ADMIN)</option>
            <option value="DEPARTMENT">Department Officers (DEPARTMENT)</option>
            <option value="TEACHER">Teachers (TEACHER)</option>
            <option value="STUDENT">Students (STUDENT)</option>
            <option value="GUARDIAN">Guardians (GUARDIAN)</option>
          </select>
        </div>

      </div>

      {/* Users Table */}
      <div className="glass-morphism rounded-2xl border border-white/5 overflow-hidden">
        <div className="p-4 border-b border-white/5 bg-[#0d0d1f]/40 flex justify-between items-center font-mono text-xs">
          <span className="text-slate-400 uppercase font-bold">Registry List ({filteredUsers.length} Users)</span>
        </div>

        {filteredUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead>
                <tr className="border-b border-white/5 text-slate-400 uppercase font-mono text-[10px]">
                  <th className="p-4">Name & Email</th>
                  <th className="p-4">Access Role</th>
                  <th className="p-4">School / Institute</th>
                  <th className="p-4">Account Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-white/[0.01] transition-colors">
                    
                    {/* Name/Email */}
                    <td className="p-4">
                      <div className="font-bold text-white text-sm">{u.name}</div>
                      <div className="text-slate-400 font-mono text-[10px] mt-0.5">{u.email}</div>
                    </td>

                    {/* Role */}
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold tracking-wider ${
                        u.role === 'ADMIN' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                        u.role === 'DEPARTMENT' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
                        u.role === 'TEACHER' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        'bg-slate-500/10 text-slate-400 border border-white/10'
                      }`}>
                        {u.role}
                      </span>
                    </td>

                    {/* School/Institute */}
                    <td className="p-4 font-semibold text-slate-300">
                      {u.schoolName || 'Government High School Bengaluru'}
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-extrabold tracking-wide uppercase ${
                        u.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25' :
                        u.status === 'suspended' ? 'bg-red-500/10 text-red-400 border border-red-500/25 animate-pulse' :
                        'bg-amber-500/10 text-amber-400 border border-amber-500/25'
                      }`}>
                        {u.status}
                      </span>
                    </td>

                    {/* Action Panel */}
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => handleEditClick(u)}
                        className="p-1.5 bg-cyan-600/15 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500 hover:text-black rounded-lg transition-all cursor-pointer inline-flex items-center"
                        title="Edit User Role/Status"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleToggleSuspension(u)}
                        className={`p-1.5 border rounded-lg transition-all cursor-pointer inline-flex items-center ${
                          u.status === 'suspended'
                            ? 'bg-emerald-600/15 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-black'
                            : 'bg-amber-600/15 border-amber-500/20 text-amber-400 hover:bg-amber-500 hover:text-black'
                        }`}
                        title={u.status === 'suspended' ? 'Activate Account' : 'Suspend Account'}
                      >
                        {u.status === 'suspended' ? <Check className="h-3.5 w-3.5" /> : <ShieldOff className="h-3.5 w-3.5" />}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u.id, u.name)}
                        className="p-1.5 bg-red-600/15 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-black rounded-lg transition-all cursor-pointer inline-flex items-center"
                        title="Delete User permanently"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center text-slate-500">
            <ShieldAlert className="h-12 w-12 text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-semibold">No users matched your search filters.</p>
            <p className="text-xs text-slate-600 mt-1">Try broadening search queries or selecting another role filter.</p>
          </div>
        )}
      </div>

      {/* Edit Role / Status Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <form 
            onSubmit={handleSaveEdit} 
            className="bg-[#0c0c1e] border border-white/10 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200 font-sans"
          >
            
            <div className="p-4 border-b border-white/5 bg-[#0f0f29]/80 flex justify-between items-center">
              <h3 className="font-bold font-mono-header text-white text-sm">Modify System User Registry</h3>
              <button 
                type="button"
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-white cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="flex items-center space-x-3 p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                <div className="h-9 w-9 rounded-full bg-cyan-950/80 border border-cyan-500/20 flex items-center justify-center font-bold text-cyan-400">
                  {editingUser.name.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-white">{editingUser.name}</div>
                  <div className="text-slate-400 font-mono text-[10px] mt-0.5">{editingUser.email}</div>
                </div>
              </div>

              {/* Role select */}
              <div className="space-y-1.5">
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                  System Access Role
                </label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as SystemUser['role'])}
                  className="w-full py-2.5 px-3 bg-[#05050f] border border-white/10 rounded-xl text-xs text-white focus:outline-none cursor-pointer"
                >
                  <option value="ADMIN">Super Administrator (ADMIN)</option>
                  <option value="DEPARTMENT">Department Officer (DEPARTMENT)</option>
                  <option value="TEACHER">Teacher (TEACHER)</option>
                  <option value="STUDENT">Student (STUDENT)</option>
                  <option value="GUARDIAN">Guardian (GUARDIAN)</option>
                </select>
              </div>

              {/* Status select */}
              <div className="space-y-1.5">
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                  Account Status
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as SystemUser['status'])}
                  className="w-full py-2.5 px-3 bg-[#05050f] border border-white/10 rounded-xl text-xs text-white focus:outline-none cursor-pointer"
                >
                  <option value="active">Active (Verified)</option>
                  <option value="pending">Pending Approval Queue</option>
                  <option value="suspended">Suspended (Blocked Access)</option>
                </select>
              </div>

              <div className="bg-purple-950/20 border border-purple-500/20 p-3 rounded-xl flex items-start space-x-2 text-[10px] text-purple-300">
                <AlertCircle className="h-4.5 w-4.5 flex-shrink-0 mt-0.5" />
                <span>
                  Modifying roles changes route permissions instantly. If changing status to suspended, the user will be blocked from logging in.
                </span>
              </div>
            </div>

            <div className="p-4 border-t border-white/5 bg-[#0f0f29]/80 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 border border-white/10 hover:bg-white/5 text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 btn-gradient text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-500/10 cursor-pointer"
              >
                Save Changes
              </button>
            </div>

          </form>
        </div>
      )}

    </div>
  );
};
