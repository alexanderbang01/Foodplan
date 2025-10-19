import { Router } from 'express';
import { foodsController } from '../controllers/foods.controller';
import { verifyJWT } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(verifyJWT);

router.get('/', foodsController.getFoods);
router.get('/:id', foodsController.getFoodById);
router.post('/', foodsController.createFood);
router.put('/:id', foodsController.updateFood);
router.delete('/:id', foodsController.deleteFood);

export default router;