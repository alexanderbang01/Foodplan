import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { verifyJWT } from '../middleware/auth';

const router = Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/me', verifyJWT, authController.getMe);

export default router;