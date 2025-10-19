import { Request } from 'express';

export interface User {
  id: number;
  full_name: string;
  email: string;
  password_hash: string;
  created_at: Date;
}

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
  };
}

export interface Food {
  id: number;
  user_id: number;
  name: string;
  category: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  notes?: string;
  created_at: Date;
}

export interface MealPlan {
  id: number;
  user_id: number;
  week_start_date: Date;
  created_at: Date;
}

export interface MealPlanEntry {
  id: number;
  meal_plan_id: number;
  day: 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
  slot: 'breakfast' | 'lunch' | 'dinner' | 'snack1' | 'snack2';
  food_id?: number;
  notes?: string;
}

// Extend Express Request type globally
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
      };
    }
  }
}