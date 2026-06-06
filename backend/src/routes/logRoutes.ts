import { Router } from 'express';
import { getInterventions, createIntervention } from '../controllers/logController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.get('/', authenticateToken, getInterventions);
router.post('/', authenticateToken, createIntervention);

export default router;
