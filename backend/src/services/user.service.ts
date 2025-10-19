import pool from '../db/pool';
import bcrypt from 'bcrypt';
import { z } from 'zod';

const updateProfileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().email('Invalid email address').optional(),
});

const changePasswordSchema = z.object({
  current_password: z.string().min(1, 'Current password is required'),
  new_password: z.string().min(6, 'New password must be at least 6 characters'),
});

export const userService = {
  async updateProfile(userId: number, data: unknown) {
    const validated = updateProfileSchema.parse(data);
    
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;
    
    Object.entries(validated).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });
    
    if (fields.length === 0) {
      throw { statusCode: 400, message: 'No fields to update' };
    }
    
    values.push(userId);
    
    const result = await pool.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING id, full_name, email, created_at`,
      values
    );
    
    return result.rows[0];
  },

  async changePassword(userId: number, data: unknown) {
    const validated = changePasswordSchema.parse(data);
    
    // Get current user
    const userResult = await pool.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [userId]
    );
    
    if (userResult.rows.length === 0) {
      throw { statusCode: 404, message: 'User not found' };
    }
    
    // Verify current password
    const isValid = await bcrypt.compare(
      validated.current_password,
      userResult.rows[0].password_hash
    );
    
    if (!isValid) {
      throw { statusCode: 401, message: 'Current password is incorrect' };
    }
    
    // Hash and update new password
    const hashedPassword = await bcrypt.hash(validated.new_password, 10);
    
    await pool.query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [hashedPassword, userId]
    );
    
    return { message: 'Password changed successfully' };
  },

  async getStats(userId: number) {
    const foodsResult = await pool.query(
      'SELECT COUNT(*) as total_foods FROM foods WHERE user_id = $1',
      [userId]
    );
    
    const plansResult = await pool.query(
      'SELECT COUNT(*) as total_plans FROM meal_plans WHERE user_id = $1',
      [userId]
    );
    
    // Get current week's meal plan entries count
    const currentWeekStart = new Date();
    currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay() + 1);
    const weekStartStr = currentWeekStart.toISOString().split('T')[0];
    
    const currentWeekResult = await pool.query(
      `SELECT COUNT(mpe.*) as current_week_entries
       FROM meal_plan_entries mpe
       JOIN meal_plans mp ON mpe.meal_plan_id = mp.id
       WHERE mp.user_id = $1 AND mp.week_start_date = $2 AND mpe.food_id IS NOT NULL`,
      [userId, weekStartStr]
    );
    
    return {
      total_foods: parseInt(foodsResult.rows[0].total_foods),
      total_plans: parseInt(plansResult.rows[0].total_plans),
      current_week_entries: parseInt(currentWeekResult.rows[0].current_week_entries),
    };
  },
};