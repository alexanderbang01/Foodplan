import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../db/pool';
import { z } from 'zod';

const signupSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const authService = {
  async signup(data: unknown) {
    const validated = signupSchema.parse(data);
    
    const hashedPassword = await bcrypt.hash(validated.password, 10);
    
    const result = await pool.query(
      'INSERT INTO users (full_name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, full_name, email, created_at',
      [validated.full_name, validated.email, hashedPassword]
    );
    
    const user = result.rows[0];
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );
    
    return { user, token };
  },

  async login(data: unknown) {
    const validated = loginSchema.parse(data);
    
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [validated.email]
    );
    
    if (result.rows.length === 0) {
      throw { statusCode: 401, message: 'Invalid email or password' };
    }
    
    const user = result.rows[0];
    const isValidPassword = await bcrypt.compare(validated.password, user.password_hash);
    
    if (!isValidPassword) {
      throw { statusCode: 401, message: 'Invalid email or password' };
    }
    
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );
    
    return {
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        created_at: user.created_at,
      },
      token,
    };
  },

  async getUserById(userId: number) {
    const result = await pool.query(
      'SELECT id, full_name, email, created_at FROM users WHERE id = $1',
      [userId]
    );
    
    if (result.rows.length === 0) {
      throw { statusCode: 404, message: 'User not found' };
    }
    
    return result.rows[0];
  },
};