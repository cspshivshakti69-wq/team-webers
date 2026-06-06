import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Supabase/PostgreSQL database...');

  // 1. Clear existing data
  await prisma.video.deleteMany({});
  await prisma.assignment.deleteMany({});
  await prisma.interventionLog.deleteMany({});
  await prisma.student.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Cleaned existing collections.');

  // 2. Hash default password
  const hashedPassword = await bcrypt.hash('password123', 10);

  // 3. Create Users
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@kannadaseva.edu',
      password: hashedPassword,
      name: 'Manjunath Gowda',
      role: 'ADMIN',
      schoolName: 'Government High School Bengaluru'
    }
  });

  const teacherUser = await prisma.user.create({
    data: {
      email: 'teacher@kannadaseva.edu',
      password: hashedPassword,
      name: 'Venkatesh Kulkarni',
      role: 'TEACHER',
      schoolName: 'Government High School Bengaluru'
    }
  });

  const guardianUser = await prisma.user.create({
    data: {
      email: 'guardian@mail.com',
      password: hashedPassword,
      name: 'Ramesh Bhat',
      role: 'GUARDIAN',
      schoolName: 'Government High School Bengaluru'
    }
  });

  const studentUser = await prisma.user.create({
    data: {
      email: 'student@kannadaseva.edu',
      password: hashedPassword,
      name: 'Aditya Bhat',
      role: 'STUDENT',
      schoolName: 'Government High School Bengaluru'
    }
  });

  console.log('Created auth users.');

  // 4. Create Student Profiles
  // Create the primary preview student linked to the student and guardian auth accounts
  const primaryStudent = await prisma.student.create({
    data: {
      id: 'std-10001',
      name: 'Aditya Bhat',
      school: 'Government High School Bengaluru',
      grade: '09',
      tags: 'EL',
      attendanceRate: 94.2,
      inSchoolSuspensions: 0,
      outSchoolSuspensions: 0,
      mapQuintile: 4,
      courseFailures: 0,
      courseFailuresYoY: '0,0,0',
      gpa: 3.82,
      userId: studentUser.id,
      guardianId: guardianUser.id,
      teacherId: teacherUser.id
    }
  });

  // Create additional mock students
  const studentNames = [
    'Chethan Nayak', 'Vikram Gowda', 'Divya Patil', 'Sneha Hegde',
    'Rohan Kulkarni', 'Preeti Reddy', 'Harish Shettar', 'Karthik Rao'
  ];

  const studentsList = [];
  for (let i = 0; i < studentNames.length; i++) {
    const isChronicallyAbsent = i === 2; // Make one chronically absent for charts
    const std = await prisma.student.create({
      data: {
        id: `std-1000${i + 2}`,
        name: studentNames[i],
        school: 'Government High School Bengaluru',
        grade: '09',
        tags: i % 3 === 0 ? 'SWD' : (i % 4 === 0 ? '504' : ''),
        attendanceRate: isChronicallyAbsent ? 84.5 : (92.0 + Math.random() * 7),
        inSchoolSuspensions: i === 4 ? 1 : 0,
        outSchoolSuspensions: 0,
        mapQuintile: (i % 5) + 1,
        courseFailures: i === 1 ? 1 : 0,
        courseFailuresYoY: '0,0,0',
        gpa: Math.round((2.5 + Math.random() * 1.5) * 100) / 100,
        teacherId: teacherUser.id
      }
    });
    studentsList.push(std);
  }

  console.log('Created student demographic profiles.');

  // 5. Create Intervention Logs
  await prisma.interventionLog.create({
    data: {
      type: 'Math',
      title: 'Algebraic equations help group',
      description: 'Student attends weekly Tier 2 check-ins for Math. Making steady progress in simplifying expressions.',
      status: 'ACTIVE',
      studentId: primaryStudent.id,
      createdById: adminUser.id
    }
  });

  await prisma.interventionLog.create({
    data: {
      type: 'Attendance',
      title: 'Attendance monitoring alert',
      description: 'Contacted guardian to discuss recent morning tardiness. Guardian promised to coordinate transport.',
      status: 'ACTIVE',
      studentId: primaryStudent.id,
      createdById: adminUser.id
    }
  });

  console.log('Seeded MTSS intervention logs.');

  // 6. Create Assignments
  const classesList = ['World History', 'Arithmetic 2', 'Biology 1', 'Kannada Literature'];
  
  for (const cls of classesList) {
    // Seed 3 assignments per class for Aditya Bhat
    for (let j = 1; j <= 3; j++) {
      const isCompleted = j !== 3; // 2 completed, 1 missing/upcoming
      await prisma.assignment.create({
        data: {
          title: `${cls} HW ${j}.a`,
          className: cls,
          dueDate: new Date(Date.now() + (j - 2) * 5 * 24 * 60 * 60 * 1000),
          turnedInAt: isCompleted ? new Date() : null,
          points: isCompleted ? Math.floor(75 + Math.random() * 25) : null,
          maxPoints: 100,
          status: isCompleted ? 'COMPLETED' : 'MISSING',
          studentId: primaryStudent.id
        }
      });
    }
  }

  console.log('Seeded homework assignments.');

  // 7. Seed Videos
  await prisma.video.create({
    data: {
      title: 'ಕನ್ನಡ ಅಕ್ಷರಮಾಲೆ ಕಲಿಕೆ | Learn Kannada Alphabets',
      url: 'https://www.youtube.com/embed/kSGr527B7vU',
      description: 'A simple video guide to learning Kannada alphabet consonants and vowels for kids.',
      category: 'Kannada Culture',
      status: 'APPROVED',
      likes: 124,
      submittedById: teacherUser.id
    }
  });

  await prisma.video.create({
    data: {
      title: 'Simple Science Experiments for Kids to try at School',
      url: 'https://www.youtube.com/embed/Q40mQ6R47h0',
      description: 'Educational science experiments demonstrating simple physics concepts using basic kitchen supplies.',
      category: 'Science Projects',
      status: 'APPROVED',
      likes: 89,
      submittedById: teacherUser.id
    }
  });

  console.log('Seeded community video materials.');
  console.log('Database seeding successfully finished!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
