import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'ADMIN' | 'TEACHER' | 'GUARDIAN' | 'STUDENT' | 'DEPARTMENT';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  schoolName?: string;
  studentProfile?: {
    id: string;
    name: string;
    school: string;
    grade: string;
  };
}

interface AuthContextType {
  user: User | null;
  activeRole: UserRole | null;
  token: string | null;
  login: (userData: User, token: string) => void;
  logout: () => void;
  setPreviewRole: (role: UserRole) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Some realistic mock user data for demo preview roles
export const MOCK_PROFILES: Record<UserRole, User> = {
  ADMIN: {
    id: 'user-admin-1',
    name: 'Manjunath Gowda',
    email: 'admin@kannadaseva.edu',
    role: 'ADMIN',
    schoolName: 'Government High School Bengaluru'
  },
  TEACHER: {
    id: 'user-teacher-1',
    name: 'Venkatesh Kulkarni',
    email: 'venkatesh.k@kannadaseva.edu',
    role: 'TEACHER',
    schoolName: 'Government High School Bengaluru'
  },
  GUARDIAN: {
    id: 'user-guardian-1',
    name: 'Ramesh Bhat',
    email: 'ramesh.bhat@mail.com',
    role: 'GUARDIAN',
    schoolName: 'Government High School Bengaluru',
    studentProfile: {
      id: 'std-10001',
      name: 'Aditya Bhat',
      school: 'Government High School Bengaluru',
      grade: '09'
    }
  },
  STUDENT: {
    id: 'user-student-1',
    name: 'Aditya Bhat',
    email: 'aditya.bhat@kannadaseva.edu',
    role: 'STUDENT',
    schoolName: 'Government High School Bengaluru',
    studentProfile: {
      id: 'std-10001',
      name: 'Aditya Bhat',
      school: 'Government High School Bengaluru',
      grade: '09'
    }
  },
  DEPARTMENT: {
    id: 'user-dept-1',
    name: 'Dr. Ramesh Rao',
    email: 'user@karnataka.gov.in',
    role: 'DEPARTMENT',
    schoolName: 'Karnataka Education Department'
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('ks-user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('ks-token') || null;
  });

  const [activeRole, setActiveRole] = useState<UserRole | null>(() => {
    const savedRole = localStorage.getItem('ks-role') as UserRole;
    return savedRole || null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('ks-user', JSON.stringify(user));
    } else {
      localStorage.removeItem('ks-user');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('ks-token', token);
    } else {
      localStorage.removeItem('ks-token');
    }
  }, [token]);

  useEffect(() => {
    if (activeRole) {
      localStorage.setItem('ks-role', activeRole);
    } else {
      localStorage.removeItem('ks-role');
    }
  }, [activeRole]);

  const login = (userData: User, tokenData: string) => {
    setUser(userData);
    setToken(tokenData);
    setActiveRole(userData.role);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setActiveRole(null);
    localStorage.removeItem('ks-user');
    localStorage.removeItem('ks-token');
    localStorage.removeItem('ks-role');
  };

  const setPreviewRole = (role: UserRole) => {
    setActiveRole(role);
    setUser(MOCK_PROFILES[role]);
  };

  const isAuthenticated = !!user && !!token;

  return (
    <AuthContext.Provider
      value={{
        user,
        activeRole,
        token,
        login,
        logout,
        setPreviewRole,
        isAuthenticated
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
