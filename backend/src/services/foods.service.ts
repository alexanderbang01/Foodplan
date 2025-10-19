import pool from '../db/pool';
import { z } from 'zod';

const createFoodSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
  calories: z.number().int().min(0),
  protein_g: z.number().min(0),
  carbs_g: z.number().min(0),
  fat_g: z.number().min(0),
  notes: z.string().optional(),
});

const updateFoodSchema = createFoodSchema.partial();

export const foodsService = {
  async getFoods(userId: number, search?: string, category?: string) {
    let query = 'SELECT * FROM foods WHERE user_id = $1';
    const params: any[] = [userId];
    
    if (search) {
      query += ' AND LOWER(name) LIKE $' + (params.length + 1);
      params.push(`%${search.toLowerCase()}%`);
    }
    
    if (category) {
      query += ' AND category = $' + (params.length + 1);
      params.push(category);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const result = await pool.query(query, params);
    return result.rows;
  },

  async getFoodById(userId: number, foodId: number) {
    const result = await pool.query(
      'SELECT * FROM foods WHERE id = $1 AND user_id = $2',
      [foodId, userId]
    );
    
    if (result.rows.length === 0) {
      throw { statusCode: 404, message: 'Food not found' };
    }
    
    return result.rows[0];
  },

  async createFood(userId: number, data: unknown) {
    const validated = createFoodSchema.parse(data);
    
    const result = await pool.query(
      `INSERT INTO foods (user_id, name, category, calories, protein_g, carbs_g, fat_g, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        userId,
        validated.name,
        validated.category,
        validated.calories,
        validated.protein_g,
        validated.carbs_g,
        validated.fat_g,
        validated.notes || null,
      ]
    );
    
    return result.rows[0];
  },

  async updateFood(userId: number, foodId: number, data: unknown) {
    const validated = updateFoodSchema.parse(data);
    
    // Check if food exists and belongs to user
    await this.getFoodById(userId, foodId);
    
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
    
    values.push(foodId, userId);
    
    const result = await pool.query(
      `UPDATE foods SET ${fields.join(', ')} WHERE id = $${paramCount} AND user_id = $${paramCount + 1} RETURNING *`,
      values
    );
    
    return result.rows[0];
  },

  async deleteFood(userId: number, foodId: number) {
    // Check if food exists and belongs to user
    await this.getFoodById(userId, foodId);
    
    await pool.query(
      'DELETE FROM foods WHERE id = $1 AND user_id = $2',
      [foodId, userId]
    );
    
    return { message: 'Food deleted successfully' };
  },
};