const API_BASE_URL = 'http://localhost:5000/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const api = {
  auth: {
    login: async (credentials: any) => {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(credentials),
      });
      return handleResponse(response);
    },
    register: async (data: any) => {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },
    forgotPassword: async (data: any) => {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },
  },
  
  students: {
    getStats: async () => {
      const response = await fetch(`${API_BASE_URL}/students/stats`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(response);
    },
    getStudents: async (search: string, school: string, grades: string[], page: number, limit: number) => {
      const query = new URLSearchParams({
        search,
        school,
        grades: grades.join(','),
        page: page.toString(),
        limit: limit.toString(),
      });
      const response = await fetch(`${API_BASE_URL}/students?${query}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(response);
    },
    addStudent: async (studentData: any) => {
      const response = await fetch(`${API_BASE_URL}/students`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(studentData),
      });
      return handleResponse(response);
    },
    getAssignments: async (studentId: string) => {
      const response = await fetch(`${API_BASE_URL}/students/${studentId}/assignments`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(response);
    },
    getTeacherAssignments: async () => {
      const response = await fetch(`${API_BASE_URL}/students/teacher/assignments`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(response);
    },
  },

  logs: {
    getInterventions: async (type: string, school: string, grade: string) => {
      const query = new URLSearchParams({ type, school, grade });
      const response = await fetch(`${API_BASE_URL}/logs?${query}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(response);
    },
    createIntervention: async (logData: any) => {
      const response = await fetch(`${API_BASE_URL}/logs`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(logData),
      });
      return handleResponse(response);
    },
  },

  videos: {
    getVideos: async (role: string) => {
      const query = new URLSearchParams({ role });
      const response = await fetch(`${API_BASE_URL}/videos?${query}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(response);
    },
    submitVideo: async (videoData: any) => {
      const response = await fetch(`${API_BASE_URL}/videos`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(videoData),
      });
      return handleResponse(response);
    },
    likeVideo: async (id: string) => {
      const response = await fetch(`${API_BASE_URL}/videos/${id}/like`, {
        method: 'PUT',
        headers: getHeaders(),
      });
      return handleResponse(response);
    },
    approveVideo: async (id: string, status: 'APPROVED' | 'REJECTED') => {
      const response = await fetch(`${API_BASE_URL}/videos/${id}/status`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ status }),
      });
      return handleResponse(response);
    },
  },

  chat: {
    sendMessage: async (message: string, history: any[]) => {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ message, history }),
      });
      return handleResponse(response);
    },
  },
};
