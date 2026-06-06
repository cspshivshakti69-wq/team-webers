const uuid = () => Math.random().toString(36).substring(2, 10);

// Types
export interface MockUser {
  id: string;
  email: string;
  name: string;
  role: string;
  schoolName?: string;
}

export interface MockStudent {
  id: string;
  name: string;
  school: string;
  grade: string;
  tags: string; // Comma-separated
  attendanceRate: number;
  inSchoolSuspensions: number;
  outSchoolSuspensions: number;
  mapQuintile: number;
  courseFailures: number;
  courseFailuresYoY: string;
  gpa: number;
  createdAt: Date;
  userId?: string;
}

export interface MockIntervention {
  id: string;
  type: string; // Math, Attendance, Reading, Behavior, Writing, Academic
  title: string;
  description: string;
  status: string; // ACTIVE, COMPLETED
  studentId: string;
  studentName: string;
  studentSchool: string;
  studentGrade: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MockAssignment {
  id: string;
  title: string;
  className: string;
  dueDate: Date;
  turnedInAt: Date | null;
  points: number | null;
  maxPoints: number;
  status: string; // COMPLETED, MISSING, UPCOMING
  studentId: string;
  createdAt: Date;
}

export interface MockVideo {
  id: string;
  title: string;
  url: string;
  description: string;
  category: string;
  status: string; // PENDING, APPROVED, REJECTED
  likes: number;
  submittedBy: string;
  createdAt: Date;
}

// Memory Stores
let students: MockStudent[] = [];
let interventions: MockIntervention[] = [];
let assignments: MockAssignment[] = [];
let videos: MockVideo[] = [];

// Name generators for realistic Kannada/Indian names
const firstNames = [
  'Manjunath', 'Manjula', 'Ramesh', 'Suresh', 'Venkatesh', 'Ananya', 'Sneha',
  'Aditya', 'Rohan', 'Aarav', 'Gauthami', 'Kiran', 'Raju', 'Deepa', 'Shubha',
  'Priya', 'Chethan', 'Vikram', 'Divya', 'Harish', 'Nithin', 'Shruti', 'Sunitha',
  'Ganesh', 'Abhishek', 'Karthik', 'Sanjay', 'Preeti', 'Jyoti', 'Shiva', 'Vinay'
];

const lastNames = [
  'Gowda', 'Bhat', 'Patil', 'Nayak', 'Kulkarni', 'Hegde', 'Rao', 'Joshi',
  'Shetty', 'Prasad', 'Reddy', 'Acharya', 'Murthy', 'Desai', 'Naidu', 'Kumar'
];

const schools = [
  'Government High School Bengaluru',
  'Kannada Seva Academy Mysuru',
  'Adarsha Vidyalaya Hubballi',
  'Vishwa Kannada School Mangaluru',
  'Kuvempu Memorial School Shivamogga'
];

const classes = [
  'Advisory', 'Algebra II', 'Arithmetic 1', 'Arithmetic 2', 'Arithmetic 3',
  'Arithmetic 4', 'Biology 1', 'Biology 2', 'Calculus 1', 'Calculus 2',
  'Government', 'World History', 'Kannada Literature', 'General Science'
];

// Helper to seed data in memory
export const initializeMockDatabase = () => {
  if (students.length > 0) return; // Already initialized

  console.log('Initializing Mock Database in Memory...');

  // 1. Generate 5,000 students
  for (let i = 1; i <= 5000; i++) {
    const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
    const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
    const name = `${fn} ${ln}`;
    const school = schools[Math.floor(Math.random() * schools.length)];
    
    // Format grade as two characters e.g. "01", "09", "11"
    const gradeVal = Math.floor(Math.random() * 12) + 1;
    const grade = gradeVal < 10 ? `0${gradeVal}` : `${gradeVal}`;
    
    // Tag generation
    const tagList: string[] = [];
    if (Math.random() < 0.15) tagList.push('EL');
    if (Math.random() < 0.10) tagList.push('SWD');
    if (Math.random() < 0.08) tagList.push('504');
    const tags = tagList.join(',');

    // Attendance (mostly high, some chronic absenteeisms)
    let attendanceRate = 90 + Math.random() * 10;
    if (Math.random() < 0.12) {
      attendanceRate = 70 + Math.random() * 19; // Chronically absent range (<90)
    }

    const inSchoolSuspensions = Math.random() < 0.05 ? Math.floor(Math.random() * 2) + 1 : 0;
    const outSchoolSuspensions = Math.random() < 0.03 ? 1 : 0;
    const mapQuintile = Math.floor(Math.random() * 5) + 1; // 1-5
    
    const courseFailures = Math.random() < 0.08 ? Math.floor(Math.random() * 3) + 1 : 0;
    const courseFailuresYoY = `${Math.random() < 0.1 ? 1 : 0},${courseFailures},${Math.random() < 0.08 ? 1 : 0}`;
    const gpa = Math.round((2.0 + Math.random() * 2.0) * 100) / 100;

    const student: MockStudent = {
      id: `std-${10000 + i}`,
      name,
      school,
      grade,
      tags,
      attendanceRate: Math.round(attendanceRate * 10) / 10,
      inSchoolSuspensions,
      outSchoolSuspensions,
      mapQuintile,
      courseFailures,
      courseFailuresYoY,
      gpa,
      createdAt: new Date()
    };
    students.push(student);
  }

  // 2. Generate initial interventions logs
  // total interventions = 536
  const interventionTypes = ['Math', 'Attendance', 'Reading', 'Behavior', 'Writing', 'Academic'];
  const interventionTitles = [
    'Math placement group support',
    'Attendance alert notification follow up',
    'Phonics reading support tier 2',
    'Behavior redirect contract',
    'Writing intervention support',
    'Weekly progress check-in'
  ];

  for (let i = 0; i < 536; i++) {
    const student = students[Math.floor(Math.random() * students.length)];
    const typeIdx = Math.floor(Math.random() * interventionTypes.length);
    const type = interventionTypes[typeIdx];
    const title = interventionTitles[typeIdx];
    
    const log: MockIntervention = {
      id: `int-${20000 + i}`,
      type,
      title,
      description: `Targeted tier 2 intervention for ${student.name}. Showing improvement in sessions.`,
      status: Math.random() < 0.8 ? 'ACTIVE' : 'COMPLETED',
      studentId: student.id,
      studentName: student.name,
      studentSchool: student.school,
      studentGrade: student.grade,
      createdBy: 'Administrator',
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
      updatedAt: new Date()
    };
    interventions.push(log);
  }

  // 3. Generate Assignments for first 100 students (for dashboard details) and sample student/teacher classes
  students.slice(0, 100).forEach(student => {
    // Generate assignments
    classes.forEach(cls => {
      // 5 assignments per class
      for (let j = 1; j <= 5; j++) {
        const isCompleted = Math.random() < 0.75;
        const isUpcoming = !isCompleted && Math.random() < 0.5;
        
        let status = 'MISSING';
        let turnedInAt = null;
        let points = null;
        let dueDate = new Date(Date.now() - j * 7 * 24 * 60 * 60 * 1000); // Past due

        if (isCompleted) {
          status = 'COMPLETED';
          turnedInAt = new Date(dueDate.getTime() - Math.floor(Math.random() * 2) * 24 * 60 * 60 * 1000);
          points = Math.floor(60 + Math.random() * 40);
        } else if (isUpcoming) {
          status = 'UPCOMING';
          dueDate = new Date(Date.now() + j * 4 * 24 * 60 * 60 * 1000); // Future due
        }

        const assign: MockAssignment = {
          id: `asg-${uuid()}`,
          title: `${cls} HW ${j}.a`,
          className: cls,
          dueDate,
          turnedInAt,
          points,
          maxPoints: 100,
          status,
          studentId: student.id,
          createdAt: new Date()
        };
        assignments.push(assign);
      }
    });
  });

  // 4. Generate some initial video entries
  videos = [
    {
      id: 'vid-1',
      title: 'ಕನ್ನಡ ಅಕ್ಷರಮಾಲೆ ಕಲಿಕೆ | Learn Kannada Alphabets',
      url: 'https://www.youtube.com/watch?v=kSGr527B7vU',
      description: 'A simple video guide to learning Kannada alphabet consonants and vowels for kids.',
      category: 'Kannada Culture',
      status: 'APPROVED',
      likes: 124,
      submittedBy: 'Kiran Bhat',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'vid-2',
      title: 'Simple Science Experiments for Kids to try at School',
      url: 'https://www.youtube.com/watch?v=Q40mQ6R47h0',
      description: 'Educational science experiments demonstrating simple physics concepts using basic kitchen supplies.',
      category: 'Science Projects',
      status: 'APPROVED',
      likes: 89,
      submittedBy: 'Gauthami Nayak',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'vid-3',
      title: 'ಕುವೆಂಪು ರವರ ಪ್ರಮುಖ ಕವನಗಳು | Kuvempu Poems Recitation',
      url: 'https://www.youtube.com/watch?v=zJg5nL9X23s',
      description: 'Recitation of Rashtrakavi Kuvempu\'s famous nature poems by students on Kannada Rajyotsava.',
      category: 'Kannada Culture',
      status: 'APPROVED',
      likes: 156,
      submittedBy: 'Manjunath Gowda',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'vid-4',
      title: 'Mathematics Math Tricks: Fast Multiplication Methods',
      url: 'https://www.youtube.com/watch?v=nZ43s084Z1A',
      description: 'Fun shortcut techniques for fast multiplication to improve students\' mental math speed.',
      category: 'Education',
      status: 'PENDING',
      likes: 0,
      submittedBy: 'Ramesh Patil',
      createdAt: new Date()
    }
  ];

  console.log(`Mock Database seeded with ${students.length} students, ${interventions.length} interventions, ${assignments.length} assignments, and ${videos.length} videos.`);
};

// Data Actions
export const mockDataService = {
  getStudents: (search: string, school: string, grades: string[], page: number, limit: number) => {
    initializeMockDatabase();
    let filtered = [...students];

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(s => s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q));
    }

    if (school && school !== 'All') {
      filtered = filtered.filter(s => s.school === school);
    }

    if (grades && grades.length > 0 && !grades.includes('All')) {
      filtered = filtered.filter(s => grades.includes(s.grade));
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const paginated = filtered.slice(startIndex, startIndex + limit);

    return {
      students: paginated,
      total: filtered.length,
      page,
      limit
    };
  },

  addStudent: (data: { name: string; school: string; grade: string; tags: string; attendanceRate: number; inSchoolSuspensions?: number; outSchoolSuspensions?: number; mapQuintile?: number; gpa?: number }) => {
    initializeMockDatabase();
    
    // Create new student
    const newStudent: MockStudent = {
      id: `std-${10000 + students.length + 1}`,
      name: data.name,
      school: data.school,
      grade: data.grade,
      tags: data.tags || '',
      attendanceRate: Number(data.attendanceRate || 95.0),
      inSchoolSuspensions: Number(data.inSchoolSuspensions || 0),
      outSchoolSuspensions: Number(data.outSchoolSuspensions || 0),
      mapQuintile: Number(data.mapQuintile || 3),
      courseFailures: 0,
      courseFailuresYoY: '0,0,0',
      gpa: Number(data.gpa || 4.0),
      createdAt: new Date()
    };
    
    // Add to beginning of lists so it shows up instantly
    students.unshift(newStudent);

    // Create 5 mock assignments for the new student so they have data
    classes.slice(0, 3).forEach(cls => {
      for (let j = 1; j <= 3; j++) {
        const status = Math.random() < 0.6 ? 'COMPLETED' : (Math.random() < 0.5 ? 'MISSING' : 'UPCOMING');
        const assign: MockAssignment = {
          id: `asg-${uuid()}`,
          title: `${cls} HW ${j}.b`,
          className: cls,
          dueDate: new Date(Date.now() + (j - 2) * 3 * 24 * 60 * 60 * 1000),
          turnedInAt: status === 'COMPLETED' ? new Date() : null,
          points: status === 'COMPLETED' ? Math.floor(70 + Math.random() * 30) : null,
          maxPoints: 100,
          status,
          studentId: newStudent.id,
          createdAt: new Date()
        };
        assignments.unshift(assign);
      }
    });

    return newStudent;
  },

  getStats: () => {
    initializeMockDatabase();

    // Calculate chronic absenteeism
    // Low Risk: >= 95%
    // At Risk: 90-94.9%
    // Chronically Absent: < 90%
    let lowRisk = 0;
    let atRisk = 0;
    let chronic = 0;
    let iss = 0; // In School Suspensions
    let oss = 0; // Out of School Suspensions

    students.forEach(s => {
      if (s.attendanceRate >= 95.0) lowRisk++;
      else if (s.attendanceRate >= 90.0) atRisk++;
      else chronic++;

      iss += s.inSchoolSuspensions;
      oss += s.outSchoolSuspensions;
    });

    // MAP Quintiles by Term distribution
    // Let's count how many students fall into each quintile (1-5)
    const quintiles = [0, 0, 0, 0, 0]; // Index 0 is Q1, Index 4 is Q5
    students.forEach(s => {
      if (s.mapQuintile >= 1 && s.mapQuintile <= 5) {
        quintiles[s.mapQuintile - 1]++;
      }
    });

    // Course Failures YoY
    // Stacked bar values matching typical counts
    const courseFailuresData = [
      { year: '2023', '0 Failures': 4400, '1 Failure': 400, '2+ Failures': 200 },
      { year: '2024', '0 Failures': 4450, '1 Failure': 350, '2+ Failures': 200 },
      { year: '2025', '0 Failures': 4550, '1 Failure': 300, '2+ Failures': 150 },
      { year: '2026', '0 Failures': 4620, '1 Failure': 260, '2+ Failures': 120 }
    ];

    return {
      totalStudents: students.length,
      absenteeism: {
        lowRisk,
        atRisk,
        chronicallyAbsent: chronic
      },
      suspensions: {
        inSchool: iss,
        outOfSchool: oss
      },
      mapQuintiles: {
        Q1: quintiles[0],
        Q2: quintiles[1],
        Q3: quintiles[2],
        Q4: quintiles[3],
        Q5: quintiles[4]
      },
      courseFailuresYoY: courseFailuresData
    };
  },

  getInterventions: (typeFilter: string, schoolFilter: string, gradeFilter: string) => {
    initializeMockDatabase();
    let filtered = [...interventions];

    if (typeFilter && typeFilter !== 'All') {
      filtered = filtered.filter(log => log.type === typeFilter);
    }
    if (schoolFilter && schoolFilter !== 'All') {
      filtered = filtered.filter(log => log.studentSchool === schoolFilter);
    }
    if (gradeFilter && gradeFilter !== 'All') {
      filtered = filtered.filter(log => log.studentGrade === gradeFilter);
    }

    return filtered;
  },

  addIntervention: (data: { type: string; title: string; description: string; studentId: string; createdBy: string }) => {
    initializeMockDatabase();
    const student = students.find(s => s.id === data.studentId);
    if (!student) {
      throw new Error(`Student with ID ${data.studentId} not found`);
    }

    const newIntervention: MockIntervention = {
      id: `int-${20000 + interventions.length + 1}`,
      type: data.type,
      title: data.title,
      description: data.description,
      status: 'ACTIVE',
      studentId: student.id,
      studentName: student.name,
      studentSchool: student.school,
      studentGrade: student.grade,
      createdBy: data.createdBy || 'Administrator',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    interventions.unshift(newIntervention);
    return newIntervention;
  },

  getVideos: () => {
    return videos;
  },

  addVideo: (data: { title: string; url: string; description?: string; category: string; submittedBy: string }) => {
    initializeMockDatabase();
    
    // Simple YouTube ID extraction
    let cleanUrl = data.url;
    if (data.url.includes('youtube.com/watch?v=')) {
      const parts = data.url.split('v=');
      if (parts[1]) {
        cleanUrl = `https://www.youtube.com/embed/${parts[1].split('&')[0]}`;
      }
    } else if (data.url.includes('youtu.be/')) {
      const parts = data.url.split('youtu.be/');
      if (parts[1]) {
        cleanUrl = `https://www.youtube.com/embed/${parts[1].split('?')[0]}`;
      }
    } else if (!data.url.includes('embed')) {
      // Just check if it's already an embed link, else convert or format
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = data.url.match(regExp);
      if (match && match[2].length === 11) {
        cleanUrl = `https://www.youtube.com/embed/${match[2]}`;
      }
    }

    const newVideo: MockVideo = {
      id: `vid-${100 + videos.length + 1}`,
      title: data.title,
      url: cleanUrl,
      description: data.description || '',
      category: data.category,
      status: 'PENDING', // Admin needs to approve
      likes: 0,
      submittedBy: data.submittedBy,
      createdAt: new Date()
    };

    videos.unshift(newVideo);
    return newVideo;
  },

  likeVideo: (id: string) => {
    const video = videos.find(v => v.id === id);
    if (video) {
      video.likes += 1;
    }
    return video;
  },

  approveVideo: (id: string, status: 'APPROVED' | 'REJECTED') => {
    const video = videos.find(v => v.id === id);
    if (video) {
      video.status = status;
    }
    return video;
  },

  getStudentAssignments: (studentId: string) => {
    initializeMockDatabase();
    // Return assignments linked to student
    let filtered = assignments.filter(a => a.studentId === studentId);
    
    // If no assignments exist, generate mock ones for this specific student
    if (filtered.length === 0) {
      classes.forEach(cls => {
        for (let j = 1; j <= 5; j++) {
          const status = Math.random() < 0.75 ? 'COMPLETED' : (Math.random() < 0.5 ? 'MISSING' : 'UPCOMING');
          const assign: MockAssignment = {
            id: `asg-${uuid()}`,
            title: `${cls} HW ${j}.c`,
            className: cls,
            dueDate: new Date(Date.now() + (j - 3) * 5 * 24 * 60 * 60 * 1000),
            turnedInAt: status === 'COMPLETED' ? new Date() : null,
            points: status === 'COMPLETED' ? Math.floor(65 + Math.random() * 35) : null,
            maxPoints: 100,
            status,
            studentId,
            createdAt: new Date()
          };
          assignments.push(assign);
        }
      });
      filtered = assignments.filter(a => a.studentId === studentId);
    }
    return filtered;
  },

  getTeacherAssignments: () => {
    // Generate a mock statistics list matching the "Assignments by Class" table
    // Columns: Class Name, Assignments Turned In, Missing Assignments, Assignment Graded, Points Average
    return classes.map(cls => {
      const total = 100 + Math.floor(Math.random() * 150);
      const turnedIn = Math.floor(total * (0.8 + Math.random() * 0.18));
      const missing = total - turnedIn;
      const graded = Math.floor(turnedIn * (0.9 + Math.random() * 0.1));
      const pointsAverage = 75 + Math.floor(Math.random() * 20);

      return {
        className: cls,
        assignmentsGiven: total,
        turnedIn,
        missing,
        gradedPercentage: Math.round((graded / turnedIn) * 100),
        pointsAverage
      };
    });
  }
};
