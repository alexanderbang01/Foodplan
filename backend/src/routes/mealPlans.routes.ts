import { Router } from 'express';
import { mealPlansController } from '../controllers/mealPlans.controller';
import { verifyJWT } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(verifyJWT);

router.get('/', mealPlansController.getMealPlan);
router.post('/', mealPlansController.createMealPlan);
router.post('/:id/entries', mealPlansController.createOrUpdateEntry);
router.delete('/:id/entries/:entryId', mealPlansController.deleteEntry);

export default router;