import { Router } from 'express';
import { getVideos, submitVideo, likeVideo, approveVideo } from '../controllers/videoController';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';

const router = Router();

router.get('/', authenticateToken, getVideos);
router.post('/', authenticateToken, submitVideo);
router.put('/:id/like', authenticateToken, likeVideo);

// Only admins can approve or reject videos
router.put('/:id/status', authenticateToken, requireRole(['ADMIN']), approveVideo);

export default router;
