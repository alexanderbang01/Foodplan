import { Request, Response, NextFunction } from 'express';
import { mealPlansService } from '../services/mealPlans.service';

export const mealPlansController = {
  async getMealPlan(req: Request, res: Response, next: NextFunction) {
    try {
      const { week_start_date } = req.query;
      
      if (!week_start_date) {
        return res.status(400).json({ error: 'week_start_date query parameter is required' });
      }
      
      const mealPlan = await mealPlansService.getMealPlan(
        req.user!.id,
        week_start_date as string
      );
      
      res.json({ mealPlan });
    } catch (error) {
      next(error);
    }
  },

  async createMealPlan(req: Request, res: Response, next: NextFunction) {
    try {
      const mealPlan = await mealPlansService.createMealPlan(req.user!.id, req.body);
      res.status(201).json({
        message: 'Meal plan created successfully',
        mealPlan,
      });
    } catch (error) {
      next(error);
    }
  },

  async createOrUpdateEntry(req: Request, res: Response, next: NextFunction) {
    try {
      const entry = await mealPlansService.createOrUpdateEntry(
        req.user!.id,
        parseInt(req.params.id),
        req.body
      );
      
      res.json({
        message: 'Entry saved successfully',
        entry,
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteEntry(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await mealPlansService.deleteEntry(
        req.user!.id,
        parseInt(req.params.id),
        parseInt(req.params.entryId)
      );
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
};