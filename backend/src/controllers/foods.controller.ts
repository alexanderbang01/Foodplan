import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { foodsService } from '../services/foods.service';

export const foodsController = {
  async getFoods(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { search, category } = req.query;
      const foods = await foodsService.getFoods(
        req.user!.id,
        search as string,
        category as string
      );
      res.json({ foods });
    } catch (error) {
      next(error);
    }
  },

  async getFoodById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const food = await foodsService.getFoodById(
        req.user!.id,
        parseInt(req.params.id)
      );
      res.json({ food });
    } catch (error) {
      next(error);
    }
  },

  async createFood(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const food = await foodsService.createFood(req.user!.id, req.body);
      res.status(201).json({
        message: 'Food created successfully',
        food,
      });
    } catch (error) {
      next(error);
    }
  },

  async updateFood(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const food = await foodsService.updateFood(
        req.user!.id,
        parseInt(req.params.id),
        req.body
      );
      res.json({
        message: 'Food updated successfully',
        food,
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteFood(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await foodsService.deleteFood(
        req.user!.id,
        parseInt(req.params.id)
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
};