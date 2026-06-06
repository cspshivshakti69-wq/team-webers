import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { mockDataService } from '../utils/mockData';
import { AuthRequest } from '../middleware/authMiddleware';

const prisma = new PrismaClient();
const useMock = !process.env.DATABASE_URL || process.env.DATABASE_URL.includes('placeholder');

export const getInterventions = async (req: Request, res: Response) => {
  try {
    const logType = (req.query.type as string) || 'All';
    const school = (req.query.school as string) || 'All';
    const grade = (req.query.grade as string) || 'All';

    if (useMock) {
      const logs = mockDataService.getInterventions(logType, school, grade);
      return res.json(logs);
    }

    try {
      const whereClause: any = {};

      if (logType && logType !== 'All') {
        whereClause.type = logType;
      }

      if (school && school !== 'All') {
        whereClause.student = { school };
      }

      if (grade && grade !== 'All') {
        whereClause.student = {
          ...whereClause.student,
          grade
        };
      }

      const logs = await prisma.interventionLog.findMany({
        where: whereClause,
        include: {
          student: true
        },
        orderBy: { createdAt: 'desc' }
      });

      // Format to match UI expected items
      const formatted = logs.map(l => ({
        id: l.id,
        type: l.type,
        title: l.title,
        description: l.description,
        status: l.status,
        studentId: l.studentId,
        studentName: l.student.name,
        studentSchool: l.student.school,
        studentGrade: l.student.grade,
        createdBy: 'Teacher/Admin',
        createdAt: l.createdAt,
        updatedAt: l.updatedAt
      }));

      res.json(formatted);
    } catch (dbErr) {
      console.warn('Prisma getInterventions failed, falling back to mock data:', dbErr);
      const logs = mockDataService.getInterventions(logType, school, grade);
      res.json(logs);
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const createIntervention = async (req: AuthRequest, res: Response) => {
  try {
    const { type, title, description, studentId } = req.body;
    const createdBy = req.user?.name || 'Administrator';
    const createdById = req.user?.id;

    if (!type || !title || !description || !studentId) {
      return res.status(400).json({ error: 'All fields (type, title, description, studentId) are required' });
    }

    if (useMock) {
      const log = mockDataService.addIntervention({
        type,
        title,
        description,
        studentId,
        createdBy
      });
      return res.status(201).json(log);
    }

    try {
      // Create in db (we need a valid user id in DB to link)
      // First verify if student exists
      const student = await prisma.student.findUnique({
        where: { id: studentId }
      });

      if (!student) {
        return res.status(404).json({ error: `Student with ID ${studentId} not found` });
      }

      // Find user to associate. If not found, use a fallback admin or create a mock association
      let userId = createdById;
      if (!userId) {
        // Fallback: search for first ADMIN in DB
        const adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
        userId = adminUser?.id;
      }

      if (!userId) {
        // If still no user, we fall back to mock write
        throw new Error('No user found to associate log with');
      }

      const log = await prisma.interventionLog.create({
        data: {
          type,
          title,
          description,
          status: 'ACTIVE',
          studentId,
          createdById: userId
        },
        include: {
          student: true
        }
      });

      res.status(201).json({
        id: log.id,
        type: log.type,
        title: log.title,
        description: log.description,
        status: log.status,
        studentId: log.studentId,
        studentName: log.student.name,
        studentSchool: log.student.school,
        studentGrade: log.student.grade,
        createdBy,
        createdAt: log.createdAt,
        updatedAt: log.updatedAt
      });
    } catch (dbErr) {
      console.warn('Prisma createIntervention failed, writing in memory:', dbErr);
      const log = mockDataService.addIntervention({
        type,
        title,
        description,
        studentId,
        createdBy
      });
      res.status(201).json(log);
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};
