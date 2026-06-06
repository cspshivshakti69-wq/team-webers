import { Router } from 'express';
import { getStudents, getStats, addStudent, getStudentById, getStudentAssignments, getTeacherAssignments } from '../controllers/studentController';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';

const router = Router();

// Stats does not strictly require admin, all roles can fetch metrics
router.get('/stats', getStats);

// Teacher-specific assignments overview
router.get('/teacher/assignments', authenticateToken, getTeacherAssignments);

router.get('/', authenticateToken, getStudents);
router.get('/:id', authenticateToken, getStudentById);
router.get('/:id/assignments', authenticateToken, getStudentAssignments);

// Only Admins can add students manually
router.post('/', authenticateToken, requireRole(['ADMIN']), addStudent);

export default router;
