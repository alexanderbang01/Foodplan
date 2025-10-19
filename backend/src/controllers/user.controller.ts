import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { userService } from '../services/user.service';

export const userController = {
  async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await userService.updateProfile(req.user!.id, req.body);
      res.json({
        message: 'Profile updated successfully',
        user,
      });
    } catch (error) {
      next(error);
    }
  },

  async changePassword(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await userService.changePassword(req.user!.id, req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async getStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const stats = await userService.getStats(req.user!.id);
      res.json({ stats });
    } catch (error) {
      next(error);
    }
  },
};