import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  GraduationCap, 
  User, 
  Mail, 
  Lock, 
  School, 
  Check, 
  ArrowLeft, 
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { type UserRole } from '../context/AuthContext';
import DateOfBirthPicker, { calculateAge } from '../components/DateOfBirthPicker';

export const Register: React.FC = () => {
  const navigate = useNavigate();

  const getRoleLabel = (r: UserRole) => {
    switch (r) {
      case 'ADMIN': return 'Super Administrator';
      case 'TEACHER': return 'Teacher / Faculty';
      case 'DEPARTMENT': return 'Department Officer';
      case 'STUDENT': return 'Student';
      case 'GUARDIAN': return 'Guardian';
      default: return r;
    }
  };

  const validateDOB = (dobString: string) => {
    if (!dobString) {
      return "Date of birth is required.";
    }

    const parts = dobString.split("-");
    if (parts.length !== 3 || parts.some(p => !p)) {
      return "Date of birth is required.";
    }

    const day = parseInt(parts[0]);
    const month = parseInt(parts[1]);
    const year = parseInt(parts[2]);
    const dobDate = new Date(year, month - 1, day);
    const today = new Date();

    // Must be a real date
    if (
      dobDate.getFullYear() !== year ||
      dobDate.getMonth() + 1 !== month ||
      dobDate.getDate() !== day
    ) {
      return "Please enter a valid date.";
    }

    // Must not be in the future
    if (dobDate >= today) {
      return "Date of birth cannot be in the future.";
    }

    // Student must be between 5 and 25 years old
    const age = calculateAge(
      String(day).padStart(2, "0"),
      String(month).padStart(2, "0"),
      String(year)
    );

    if (age < 5) {
      return "Student must be at least 5 years old.";
    }
    if (age > 25) {
      return "Please verify the year entered.";
    }

    // February edge case
    if (month === 2 && day > 28) {
      const isLeap =
        (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
      if (!isLeap && day === 29) {
        return `${year} is not a leap year. February has only 28 days.`;
      }
      if (day > 29) {
        return "February cannot have more than 29 days.";
      }
    }

    // Months with 30 days
    const thirtyDayMonths = [4, 6, 9, 11];
    if (thirtyDayMonths.includes(month) && day > 30) {
      return "This month has only 30 days.";
    }

    return null; // valid
  };

  // Wizard Steps: 1, 2, 3
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<UserRole>('STUDENT');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [dobError, setDobError] = useState('');
  const [gender, setGender] = useState('Male');
  const [schoolName, setSchoolName] = useState('');
  const [grade, setGrade] = useState('9');
  const [stream, setStream] = useState('Science');
  const [studentId, setStudentId] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [subjects, setSubjects] = useState<string[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [diseCode, setDiseCode] = useState('');
  const [district, setDistrict] = useState('Dakshina Kannada');
  const [taluk, setTaluk] = useState('Mangaluru');
  const [designation, setDesignation] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [guardianMobile, setGuardianMobile] = useState('');
  
  // File Upload states
  const [fileName, setFileName] = useState('');

  // Validation States
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [passwordStrength, setPasswordStrength] = useState<'Weak' | 'Medium' | 'Strong'>('Weak');

  // Cascade list
  const TALUKS: Record<string, string[]> = {
    'Dakshina Kannada': ['Mangaluru', 'Bantwal', 'Puttur'],
    'Mysore': ['Hunsur'],
    'Chamarajanagar': ['Chamarajanagar']
  };

  useEffect(() => {
    // Reset taluk when district changes
    if (TALUKS[district]) {
      setTaluk(TALUKS[district][0]);
    }
  }, [district]);

  // Real-time password strength check
  useEffect(() => {
    if (!password) {
      setPasswordStrength('Weak');
      return;
    }
    const hasLength = password.length >= 8;
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);

    if (hasLength && hasNumber && hasSpecial) {
      setPasswordStrength('Strong');
    } else if (hasLength && (hasNumber || hasSpecial)) {
      setPasswordStrength('Medium');
    } else {
      setPasswordStrength('Weak');
    }
  }, [password]);

  // Form field validators
  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};

    if (!fullName) newErrors.fullName = 'Full Name is required';
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Invalid email format';
    }

    // Strict Karnataka Gov email check
    if (role === 'DEPARTMENT') {
      if (email && !email.toLowerCase().endsWith('@karnataka.gov.in')) {
        newErrors.email = 'Department Officers must register with an @karnataka.gov.in email address';
      }
    }

    if (!mobile) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(mobile)) {
      newErrors.mobile = 'Mobile number must be exactly 10 digits';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Role specific fields
    if (role === 'STUDENT') {
      const dobErr = validateDOB(dob);
      if (dobErr) {
        newErrors.dob = dobErr;
        setDobError(dobErr);
      } else {
        setDobError('');
      }
      if (!schoolName) newErrors.schoolName = 'School Name is required';
    }

    if (role === 'TEACHER') {
      if (!employeeId) newErrors.employeeId = 'Employee ID is required';
      if (!schoolName) newErrors.schoolName = 'School Name is required';
      if (subjects.length === 0) newErrors.subjects = 'Select at least one subject';
    }

    if (role === 'ADMIN') {
      if (!schoolName) newErrors.schoolName = 'School Name is required';
      if (!diseCode) newErrors.diseCode = 'DISE Code is required';
    }

    if (role === 'DEPARTMENT') {
      if (!designation) newErrors.designation = 'Designation is required';
      if (!employeeId) newErrors.employeeId = 'Employee ID is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      if (validateStep2()) {
        setStep(3);
      }
    }
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      // Create user entry
      const newUser = {
        id: `reg-${role.toLowerCase()}-${Date.now()}`,
        name: fullName,
        email,
        password,
        role,
        schoolName: role === 'DEPARTMENT' ? 'Karnataka Education Department' : schoolName,
        studentProfile: role === 'STUDENT' ? {
          id: `std-${Date.now()}`,
          name: fullName,
          school: schoolName,
          grade: grade + (parseInt(grade) >= 11 ? `th ${stream}` : 'th')
        } : undefined,
        status: (role === 'ADMIN' || role === 'DEPARTMENT') ? 'pending' : 'active'
      };

      // Save to ks-registered-users array in localStorage
      try {
        const existingUsersRaw = localStorage.getItem('ks-registered-users') || '[]';
        const existingUsers = JSON.parse(existingUsersRaw);
        existingUsers.push(newUser);
        localStorage.setItem('ks-registered-users', JSON.stringify(existingUsers));
      } catch (err) {
        console.error("Failed to save registered user", err);
      }

      setLoading(false);
      setSuccess(true);
    }, 1200);
  };

  const toggleSubject = (sub: string) => {
    setSubjects(prev => 
      prev.includes(sub) ? prev.filter(s => s !== sub) : [...prev, sub]
    );
  };

  const toggleClass = (cls: string) => {
    setClasses(prev => 
      prev.includes(cls) ? prev.filter(c => c !== cls) : [...prev, cls]
    );
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#05050f] px-4 text-white font-sans">
        <div className="max-w-md w-full glass-morphism p-8 rounded-2xl shadow-2xl text-center border border-white/10 relative">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-6">
            <ShieldCheck className="h-10 w-10 animate-bounce" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white font-mono-header">
            Account Created!
          </h2>
          <p className="text-xs text-slate-300 mt-4 leading-relaxed">
            We have registered your details for <strong className="text-white">{email}</strong>.
          </p>
          {(role === 'ADMIN' || role === 'DEPARTMENT') ? (
            <div className="mt-4 p-4 rounded-xl bg-purple-950/20 border border-purple-500/20 text-xs text-purple-300 text-left space-y-1.5 font-medium leading-relaxed">
              <p>⚠️ <strong>Approval Pending:</strong></p>
              <p>Your account is pending review by a senior administrator. Access credentials will become active within 24–48 hours once files/DISE codes are verified.</p>
            </div>
          ) : (
            <p className="text-xs text-slate-400 mt-2">
              You can now log in using your newly configured credentials.
            </p>
          )}
          <button
            onClick={() => navigate('/login')}
            className="w-full btn-gradient py-3 rounded-xl text-xs font-bold shadow-lg shadow-cyan-500/20 active:scale-[0.98] transition-all cursor-pointer mt-6"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#05050f] px-4 py-12 text-white font-sans">
      
      {/* Wizard Box */}
      <div className="max-w-lg w-full glass-morphism p-8 rounded-2xl shadow-2xl relative border border-white/10">
        
        {/* Step Indicator Header */}
        <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#a855f7] to-[#00e5ff] shadow-md shadow-cyan-500/10">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="font-mono-header font-bold text-sm tracking-tight">ಕನ್ನಡ ಸೇವಾ</span>
          </div>
          <span className="text-[10px] font-bold text-slate-400 font-mono tracking-widest uppercase bg-white/5 px-2.5 py-1 rounded-full">
            Step {step} of 3
          </span>
        </div>

        {/* ==========================================
            STEP 1 — SELECT ACCOUNT ROLE
            ========================================== */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-white font-mono-header">
                Create Your Kannada Seva Account
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Select your functional access role to load registration forms.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 font-sans">
              {/* STUDENT */}
              <button
                type="button"
                onClick={() => setRole('STUDENT')}
                className={`flex items-start p-4 rounded-xl text-left border transition-all cursor-pointer ${
                  role === 'STUDENT'
                    ? 'bg-cyan-950/20 border-cyan-500/50 shadow-md shadow-cyan-500/5'
                    : 'bg-[#0d0d1f]/60 border-white/5 hover:border-white/10'
                }`}
              >
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center mr-4 flex-shrink-0 ${
                  role === 'STUDENT' ? 'bg-cyan-500 text-black' : 'bg-white/5 text-slate-400'
                }`}>
                  <GraduationCap className="h-4.5 w-4.5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white font-mono-header">Student</div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Access evaluation quizzes, upload PDF notes, and calendar countdowns.
                  </p>
                </div>
              </button>

              {/* TEACHER */}
              <button
                type="button"
                onClick={() => setRole('TEACHER')}
                className={`flex items-start p-4 rounded-xl text-left border transition-all cursor-pointer ${
                  role === 'TEACHER'
                    ? 'bg-cyan-950/20 border-cyan-500/50 shadow-md shadow-cyan-500/5'
                    : 'bg-[#0d0d1f]/60 border-white/5 hover:border-white/10'
                }`}
              >
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center mr-4 flex-shrink-0 ${
                  role === 'TEACHER' ? 'bg-cyan-500 text-black' : 'bg-white/5 text-slate-400'
                }`}>
                  <User className="h-4.5 w-4.5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white font-mono-header">Teacher</div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Manage classes, trigger shared content logs, and inspect student average drawers.
                  </p>
                </div>
              </button>

              {/* SCHOOL ADMIN */}
              <button
                type="button"
                onClick={() => setRole('ADMIN')}
                className={`flex items-start p-4 rounded-xl text-left border transition-all cursor-pointer ${
                  role === 'ADMIN'
                    ? 'bg-cyan-950/20 border-cyan-500/50 shadow-md shadow-cyan-500/5'
                    : 'bg-[#0d0d1f]/60 border-white/5 hover:border-white/10'
                }`}
              >
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center mr-4 flex-shrink-0 ${
                  role === 'ADMIN' ? 'bg-cyan-500 text-black' : 'bg-white/5 text-slate-400'
                }`}>
                  <School className="h-4.5 w-4.5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white font-mono-header">School Administrator</div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Manage school metrics, create interventions, and approve teacher listings.
                  </p>
                </div>
              </button>

              {/* DEPARTMENT */}
              <button
                type="button"
                onClick={() => setRole('DEPARTMENT')}
                className={`flex items-start p-4 rounded-xl text-left border transition-all cursor-pointer ${
                  role === 'DEPARTMENT'
                    ? 'bg-cyan-950/20 border-cyan-500/50 shadow-md shadow-cyan-500/5'
                    : 'bg-[#0d0d1f]/60 border-white/5 hover:border-white/10'
                }`}
              >
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center mr-4 flex-shrink-0 ${
                  role === 'DEPARTMENT' ? 'bg-cyan-500 text-black' : 'bg-white/5 text-slate-400'
                }`}>
                  <ShieldCheck className="h-4.5 w-4.5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white font-mono-header">Department Officer</div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Access district analysis maps, learning gaps data hub, and warnings calculations.
                  </p>
                </div>
              </button>
            </div>

            <button
              onClick={handleNext}
              className="w-full btn-gradient py-3 rounded-xl text-xs font-bold shadow-lg shadow-cyan-500/20 flex justify-center items-center space-x-2 cursor-pointer mt-6"
            >
              <span>Next</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* ==========================================
            STEP 2 — PERSONAL DETAILS Form
            ========================================== */}
        {step === 2 && (
          <form onSubmit={(e) => { e.preventDefault(); handleNext(); }} className="space-y-4 font-sans text-xs">
            <div>
              <h2 className="text-md font-bold tracking-tight text-white font-mono-header uppercase">
                {getRoleLabel(role)} Registration
              </h2>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Please complete the form fields to initialize credentials.
              </p>
            </div>

            {/* ERROR SUMMARY */}
            {Object.keys(errors).length > 0 && (
              <div className="bg-red-950/30 border border-red-500/20 rounded-xl p-3 text-[10px] text-red-400 flex items-start space-x-2 font-medium">
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Errors found in form fields:</p>
                  <ul className="list-disc pl-4 mt-1 space-y-0.5">
                    {Object.values(errors).map((err, idx) => <li key={idx}>{err}</li>)}
                  </ul>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1">
              
              {/* Common field: Full Name */}
              <div className="md:col-span-2">
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={`w-full bg-[#0d0d1f] border rounded-lg px-3 py-2 text-xs text-white focus:outline-none ${errors.fullName ? 'border-red-500' : 'border-white/10 focus:border-cyan-400'}`}
                  placeholder="Ramesh Rao" 
                  required
                />
              </div>

              {/* STUDENT FIELDS */}
              {role === 'STUDENT' && (
                <>
                  <div>
                    <DateOfBirthPicker
                      value={dob}
                      onChange={(val) => {
                        setDob(val);
                        const err = validateDOB(val);
                        setDobError(err || '');
                      }}
                      error={dobError}
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Gender</label>
                    <select 
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full bg-[#0d0d1f] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
                    >
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">School Name</label>
                    <input 
                      type="text" 
                      value={schoolName}
                      onChange={(e) => setSchoolName(e.target.value)}
                      className="w-full bg-[#0d0d1f] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                      placeholder="GHPS Mangaluru Port"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Grade / Class</label>
                    <select 
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      className="w-full bg-[#0d0d1f] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
                    >
                      {['1','2','3','4','5','6','7','8','9','10','11','12'].map(g => (
                        <option key={g} value={g}>Grade {g}</option>
                      ))}
                    </select>
                  </div>
                  {parseInt(grade) >= 11 && (
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Stream</label>
                      <select 
                        value={stream}
                        onChange={(e) => setStream(e.target.value)}
                        className="w-full bg-[#0d0d1f] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
                      >
                        <option>Science</option>
                        <option>Commerce</option>
                        <option>Arts</option>
                      </select>
                    </div>
                  )}
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Official Student ID (Optional)</label>
                    <input 
                      type="text" 
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      className="w-full bg-[#0d0d1f] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                      placeholder="ST-1004"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Guardian Name</label>
                    <input 
                      type="text" 
                      value={guardianName}
                      onChange={(e) => setGuardianName(e.target.value)}
                      className="w-full bg-[#0d0d1f] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                      placeholder="Somnath Rao"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Guardian Mobile</label>
                    <input 
                      type="text" 
                      value={guardianMobile}
                      onChange={(e) => setGuardianMobile(e.target.value)}
                      className="w-full bg-[#0d0d1f] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                      placeholder="9876543210"
                      required
                    />
                  </div>
                </>
              )}

              {/* TEACHER FIELDS */}
              {role === 'TEACHER' && (
                <>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Employee ID</label>
                    <input 
                      type="text" 
                      value={employeeId}
                      onChange={(e) => setEmployeeId(e.target.value)}
                      className="w-full bg-[#0d0d1f] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                      placeholder="EMP-TEA-45"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">School Name</label>
                    <input 
                      type="text" 
                      value={schoolName}
                      onChange={(e) => setSchoolName(e.target.value)}
                      className="w-full bg-[#0d0d1f] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                      placeholder="GHPS Mangaluru Port"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Subjects Teaching</label>
                    <div className="flex flex-wrap gap-1.5">
                      {['Physics', 'Chemistry', 'Mathematics', 'Biology', 'Kannada', 'English'].map(sub => (
                        <button
                          type="button"
                          key={sub}
                          onClick={() => toggleSubject(sub)}
                          className={`px-2.5 py-1 rounded border transition-colors cursor-pointer text-[10px] ${
                            subjects.includes(sub)
                              ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40 font-bold'
                              : 'bg-white/5 text-slate-400 border-transparent'
                          }`}
                        >
                          {sub}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Classes Handling</label>
                    <div className="flex flex-wrap gap-1.5">
                      {['Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'].map(cls => (
                        <button
                          type="button"
                          key={cls}
                          onClick={() => toggleClass(cls)}
                          className={`px-2.5 py-1 rounded border transition-colors cursor-pointer text-[10px] ${
                            classes.includes(cls)
                              ? 'bg-purple-500/20 text-purple-400 border-purple-500/40 font-bold'
                              : 'bg-white/5 text-slate-400 border-transparent'
                          }`}
                        >
                          {cls}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="md:col-span-2 border border-white/5 rounded-xl p-3 bg-white/[0.01]">
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Upload School ID Proof</label>
                    <div className="flex items-center justify-between">
                      <input 
                        type="file" 
                        accept=".pdf,image/*"
                        onChange={handleFileUpload}
                        className="hidden" 
                        id="teacher-file"
                      />
                      <label htmlFor="teacher-file" className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-semibold cursor-pointer">
                        Select File (Max 2MB)
                      </label>
                      <span className="text-[10px] text-slate-400 max-w-[180px] truncate">
                        {fileName || 'No file selected'}
                      </span>
                    </div>
                  </div>
                </>
              )}

              {/* SCHOOL ADMINISTRATOR FIELDS */}
              {role === 'ADMIN' && (
                <>
                  <div className="md:col-span-2">
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">School Name</label>
                    <input 
                      type="text" 
                      value={schoolName}
                      onChange={(e) => setSchoolName(e.target.value)}
                      className="w-full bg-[#0d0d1f] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                      placeholder="GHPS Mangaluru Port"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">School DISE Code</label>
                    <input 
                      type="text" 
                      value={diseCode}
                      onChange={(e) => setDiseCode(e.target.value)}
                      className="w-full bg-[#0d0d1f] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                      placeholder="29240304501"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">District</label>
                    <select 
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full bg-[#0d0d1f] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
                    >
                      <option value="Dakshina Kannada">Dakshina Kannada</option>
                      <option value="Mysore">Mysore</option>
                      <option value="Chamarajanagar">Chamarajanagar</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Taluk</label>
                    <select 
                      value={taluk}
                      onChange={(e) => setTaluk(e.target.value)}
                      className="w-full bg-[#0d0d1f] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
                    >
                      {TALUKS[district]?.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2 border border-white/5 rounded-xl p-3 bg-white/[0.01]">
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Upload Government Authorization Letter</label>
                    <div className="flex items-center justify-between">
                      <input 
                        type="file" 
                        accept=".pdf"
                        onChange={handleFileUpload}
                        className="hidden" 
                        id="admin-file"
                      />
                      <label htmlFor="admin-file" className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-semibold cursor-pointer">
                        Select PDF (Max 5MB)
                      </label>
                      <span className="text-[10px] text-slate-400 max-w-[180px] truncate">
                        {fileName || 'No file selected'}
                      </span>
                    </div>
                  </div>
                </>
              )}

              {/* DEPARTMENT OFFICER FIELDS */}
              {role === 'DEPARTMENT' && (
                <>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Official Designation</label>
                    <input 
                      type="text" 
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      className="w-full bg-[#0d0d1f] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                      placeholder="Block Education Officer (BEO)"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Employee ID</label>
                    <input 
                      type="text" 
                      value={employeeId}
                      onChange={(e) => setEmployeeId(e.target.value)}
                      className="w-full bg-[#0d0d1f] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                      placeholder="EMP-DEP-1045"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">District Assigned</label>
                    <select 
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full bg-[#0d0d1f] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
                    >
                      <option value="Dakshina Kannada">Dakshina Kannada</option>
                      <option value="Mysore">Mysore</option>
                      <option value="Chamarajanagar">Chamarajanagar</option>
                    </select>
                  </div>
                  <div className="md:col-span-2 border border-white/5 rounded-xl p-3 bg-white/[0.01]">
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Upload Government Service ID Card</label>
                    <div className="flex items-center justify-between">
                      <input 
                        type="file" 
                        accept=".pdf,image/*"
                        onChange={handleFileUpload}
                        className="hidden" 
                        id="dept-file"
                      />
                      <label htmlFor="dept-file" className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-semibold cursor-pointer">
                        Select File
                      </label>
                      <span className="text-[10px] text-slate-400 max-w-[180px] truncate">
                        {fileName || 'No file selected'}
                      </span>
                    </div>
                  </div>
                </>
              )}

              {/* COMMON FIELDS: EMAIL, MOBILE, PASSWORD */}
              <div className="md:col-span-2 border-t border-white/5 pt-3 mt-1">
                <span className="text-[9px] font-extrabold tracking-wider text-cyan-400 uppercase">
                  Account Credentials
                </span>
              </div>

              {/* Email Input */}
              <div className={role === 'DEPARTMENT' ? 'md:col-span-2' : ''}>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Email Address {role === 'DEPARTMENT' && <span className="text-red-400 font-bold">(* @karnataka.gov.in required)</span>}
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                    <Mail className="h-3.5 w-3.5" />
                  </span>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full bg-[#0d0d1f] border rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none ${errors.email ? 'border-red-500' : 'border-white/10 focus:border-cyan-400'}`}
                    placeholder={role === 'DEPARTMENT' ? 'officer@karnataka.gov.in' : 'user@mail.com'}
                    required
                  />
                </div>
              </div>

              {role !== 'DEPARTMENT' && (
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Mobile Number</label>
                  <input 
                    type="text" 
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className={`w-full bg-[#0d0d1f] border rounded-lg px-3 py-2 text-xs text-white focus:outline-none ${errors.mobile ? 'border-red-500' : 'border-white/10 focus:border-cyan-400'}`}
                    placeholder="9876543210"
                    required
                  />
                </div>
              )}

              {role === 'DEPARTMENT' && (
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Mobile Number</label>
                  <input 
                    type="text" 
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className={`w-full bg-[#0d0d1f] border rounded-lg px-3 py-2 text-xs text-white focus:outline-none ${errors.mobile ? 'border-red-500' : 'border-white/10 focus:border-cyan-400'}`}
                    placeholder="9876543210"
                    required
                  />
                </div>
              )}

              {/* Password */}
              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                    <Lock className="h-3.5 w-3.5" />
                  </span>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full bg-[#0d0d1f] border rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none ${errors.password ? 'border-red-500' : 'border-white/10 focus:border-cyan-400'}`}
                    placeholder="••••••••"
                    required
                  />
                </div>
                {/* Password Strength Meter */}
                <div className="mt-1.5 flex items-center space-x-1">
                  <span className="text-[8px] text-slate-500 uppercase font-bold">Strength:</span>
                  <div className="flex-1 h-1 bg-white/5 rounded overflow-hidden flex">
                    <div className={`h-full transition-all duration-300 ${
                      passwordStrength === 'Strong' ? 'w-full bg-emerald-500' :
                      passwordStrength === 'Medium' ? 'w-2/3 bg-amber-500' :
                      'w-1/3 bg-red-500'
                    }`}></div>
                  </div>
                  <span className={`text-[8px] font-bold ${
                    passwordStrength === 'Strong' ? 'text-emerald-400' :
                    passwordStrength === 'Medium' ? 'text-amber-400' :
                    'text-red-400'
                  }`}>{passwordStrength}</span>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Confirm Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                    <Lock className="h-3.5 w-3.5" />
                  </span>
                  <input 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full bg-[#0d0d1f] border rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none ${errors.confirmPassword ? 'border-red-500' : 'border-white/10 focus:border-cyan-400'}`}
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

            </div>

            <div className="flex space-x-3 mt-6">
              <button
                type="button"
                onClick={handleBack}
                className="w-1/3 flex items-center justify-center space-x-1.5 border border-white/10 hover:bg-white/5 rounded-xl text-slate-300 py-2.5 font-bold cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </button>
              <button
                type="submit"
                className="w-2/3 btn-gradient rounded-xl font-bold flex justify-center items-center space-x-1.5 cursor-pointer py-2.5 text-white"
              >
                <span>Continue</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>
        )}

        {/* ==========================================
            STEP 3 — REVIEW & SUBMIT
            ========================================== */}
        {step === 3 && (
          <form onSubmit={handleSubmit} className="space-y-6 font-sans text-xs">
            <div>
              <h2 className="text-md font-bold tracking-tight text-white font-mono-header">
                Step 3 of 3 — Verify & Submit
              </h2>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Review your registered details below before launching configuration.
              </p>
            </div>

            <div className="space-y-3 p-4 rounded-xl bg-white/[0.01] border border-white/5">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-400">Selected Access Role:</span>
                <strong className="text-white uppercase font-mono">{role}</strong>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-400">Full Name:</span>
                <span className="text-white font-semibold">{fullName}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-400">Email Address:</span>
                <span className="text-cyan-400 font-mono">{email}</span>
              </div>
              {role !== 'DEPARTMENT' && (
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-slate-400">School Name:</span>
                  <span className="text-white truncate max-w-[200px] font-semibold">{schoolName}</span>
                </div>
              )}
              {role === 'DEPARTMENT' && (
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-slate-400">Assigned District:</span>
                  <span className="text-white font-semibold">{district}</span>
                </div>
              )}
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-400">Contact Mobile:</span>
                <span className="text-white font-semibold">{mobile}</span>
              </div>
            </div>

            {/* Checkbox confirmation */}
            <div className="space-y-3.5">
              <label className="flex items-start cursor-pointer select-none space-x-3 text-[11px] text-slate-300">
                <input 
                  type="checkbox" 
                  className="mt-0.5 rounded accent-cyan-400 cursor-pointer h-4 w-4 bg-[#0d0d1f] border-white/10"
                  required 
                />
                <span>I agree to the Kannada Seva Terms of Service & Privacy Policy rules.</span>
              </label>

              <label className="flex items-start cursor-pointer select-none space-x-3 text-[11px] text-slate-300">
                <input 
                  type="checkbox" 
                  className="mt-0.5 rounded accent-cyan-400 cursor-pointer h-4 w-4 bg-[#0d0d1f] border-white/10"
                  required 
                />
                <span>I confirm that all credentials, ID proofs, and DISE details provided are authentic.</span>
              </label>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                type="button"
                onClick={handleBack}
                className="w-1/3 flex items-center justify-center space-x-1.5 border border-white/10 hover:bg-white/5 rounded-xl text-slate-300 py-2.5 font-bold cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-2/3 btn-gradient rounded-xl font-bold flex justify-center items-center space-x-1.5 cursor-pointer py-2.5 text-white"
              >
                {loading ? (
                  <span>Creating Account...</span>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Create Account</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Already have account footer link */}
        {step !== 3 && (
          <div className="mt-6 text-center text-xs font-sans">
            <span className="text-slate-400">Already have an account? </span>
            <button
              onClick={() => navigate('/login')}
              className="font-bold text-cyan-400 hover:underline cursor-pointer"
            >
              Sign In
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
