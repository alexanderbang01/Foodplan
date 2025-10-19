import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { verifyJWT } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(verifyJWT);

router.put('/profile', userController.updateProfile);
router.post('/change-password', userController.changePassword);
router.get('/stats', userController.getStats);

export default router;