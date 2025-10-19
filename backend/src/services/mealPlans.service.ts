import pool from '../db/pool';
import { z } from 'zod';

const createMealPlanSchema = z.object({
  week_start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
});

const createEntrySchema = z.object({
  day: z.enum(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']),
  slot: z.enum(['breakfast', 'lunch', 'dinner', 'snack1', 'snack2']),
  food_id: z.number().int().positive().nullable(),
  notes: z.string().optional(),
});

export const mealPlansService = {
  async getMealPlan(userId: number, weekStartDate: string) {
    // Get or create meal plan
    let result = await pool.query(
      'SELECT * FROM meal_plans WHERE user_id = $1 AND week_start_date = $2',
      [userId, weekStartDate]
    );
    
    let mealPlan = result.rows[0];
    
    if (!mealPlan) {
      result = await pool.query(
        'INSERT INTO meal_plans (user_id, week_start_date) VALUES ($1, $2) RETURNING *',
        [userId, weekStartDate]
      );
      mealPlan = result.rows[0];
    }
    
    // Get entries with food details
    const entriesResult = await pool.query(
      `SELECT 
        mpe.*,
        f.name as food_name,
        f.category as food_category,
        f.calories,
        f.protein_g,
        f.carbs_g,
        f.fat_g
       FROM meal_plan_entries mpe
       LEFT JOIN foods f ON mpe.food_id = f.id
       WHERE mpe.meal_plan_id = $1
       ORDER BY 
         CASE mpe.day
           WHEN 'mon' THEN 1
           WHEN 'tue' THEN 2
           WHEN 'wed' THEN 3
           WHEN 'thu' THEN 4
           WHEN 'fri' THEN 5
           WHEN 'sat' THEN 6
           WHEN 'sun' THEN 7
         END,
         CASE mpe.slot
           WHEN 'breakfast' THEN 1
           WHEN 'lunch' THEN 2
           WHEN 'dinner' THEN 3
           WHEN 'snack1' THEN 4
           WHEN 'snack2' THEN 5
         END`,
      [mealPlan.id]
    );
    
    return {
      ...mealPlan,
      entries: entriesResult.rows,
    };
  },

  async createMealPlan(userId: number, data: unknown) {
    const validated = createMealPlanSchema.parse(data);
    
    const result = await pool.query(
      'INSERT INTO meal_plans (user_id, week_start_date) VALUES ($1, $2) RETURNING *',
      [userId, validated.week_start_date]
    );
    
    return result.rows[0];
  },

  async createOrUpdateEntry(userId: number, mealPlanId: number, data: unknown) {
    const validated = createEntrySchema.parse(data);
    
    // Verify meal plan belongs to user
    const planResult = await pool.query(
      'SELECT * FROM meal_plans WHERE id = $1 AND user_id = $2',
      [mealPlanId, userId]
    );
    
    if (planResult.rows.length === 0) {
      throw { statusCode: 404, message: 'Meal plan not found' };
    }
    
    // Verify food belongs to user if food_id is provided
    if (validated.food_id) {
      const foodResult = await pool.query(
        'SELECT * FROM foods WHERE id = $1 AND user_id = $2',
        [validated.food_id, userId]
      );
      
      if (foodResult.rows.length === 0) {
        throw { statusCode: 404, message: 'Food not found' };
      }
    }
    
    // Upsert entry
    const result = await pool.query(
      `INSERT INTO meal_plan_entries (meal_plan_id, day, slot, food_id, notes)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (meal_plan_id, day, slot)
       DO UPDATE SET food_id = $4, notes = $5
       RETURNING *`,
      [mealPlanId, validated.day, validated.slot, validated.food_id, validated.notes || null]
    );
    
    return result.rows[0];
  },

  async deleteEntry(userId: number, mealPlanId: number, entryId: number) {
    // Verify meal plan belongs to user
    const planResult = await pool.query(
      'SELECT * FROM meal_plans WHERE id = $1 AND user_id = $2',
      [mealPlanId, userId]
    );
    
    if (planResult.rows.length === 0) {
      throw { statusCode: 404, message: 'Meal plan not found' };
    }
    
    const result = await pool.query(
      'DELETE FROM meal_plan_entries WHERE id = $1 AND meal_plan_id = $2 RETURNING *',
      [entryId, mealPlanId]
    );
    
    if (result.rows.length === 0) {
      throw { statusCode: 404, message: 'Entry not found' };
    }
    
    return { message: 'Entry deleted successfully' };
  },
};