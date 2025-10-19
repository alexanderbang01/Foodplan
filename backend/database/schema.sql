-- Drop tables in dependency-safe order
DROP TABLE IF EXISTS meal_plan_entries CASCADE;
DROP TABLE IF EXISTS meal_plans CASCADE;
DROP TABLE IF EXISTS foods CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop custom types
DROP TYPE IF EXISTS food_category CASCADE;
DROP TYPE IF EXISTS day_of_week CASCADE;
DROP TYPE IF EXISTS meal_slot CASCADE;

-- Create custom types
CREATE TYPE food_category AS ENUM ('breakfast', 'lunch', 'dinner', 'snack');
CREATE TYPE day_of_week AS ENUM ('mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun');
CREATE TYPE meal_slot AS ENUM ('breakfast', 'lunch', 'dinner', 'snack1', 'snack2');

-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Foods table
CREATE TABLE foods (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  category food_category NOT NULL,
  calories INTEGER NOT NULL DEFAULT 0,
  protein_g DECIMAL(6,2) NOT NULL DEFAULT 0,
  carbs_g DECIMAL(6,2) NOT NULL DEFAULT 0,
  fat_g DECIMAL(6,2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Meal plans table
CREATE TABLE meal_plans (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  week_start_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, week_start_date)
);

-- Meal plan entries table
CREATE TABLE meal_plan_entries (
  id SERIAL PRIMARY KEY,
  meal_plan_id INTEGER NOT NULL REFERENCES meal_plans(id) ON DELETE CASCADE,
  day day_of_week NOT NULL,
  slot meal_slot NOT NULL,
  food_id INTEGER REFERENCES foods(id) ON DELETE SET NULL,
  notes TEXT,
  UNIQUE(meal_plan_id, day, slot)
);

-- Create indexes for better performance
CREATE INDEX idx_foods_user_id ON foods(user_id);
CREATE INDEX idx_foods_category ON foods(category);
CREATE INDEX idx_meal_plans_user_id ON meal_plans(user_id);
CREATE INDEX idx_meal_plans_week_start ON meal_plans(week_start_date);
CREATE INDEX idx_meal_plan_entries_meal_plan_id ON meal_plan_entries(meal_plan_id);

-- Seed demo user (password: "test123")
INSERT INTO users (full_name, email, password_hash) VALUES
('Alexander Bang', 'testbruger@gmail.com', '$2b$10$cUqjyNMAJBhfUEtNFNjDqO21D.O09bKpN3velNWDOGRjXXqf7gNBm');

-- Seed foods for demo user
INSERT INTO foods (user_id, name, category, calories, protein_g, carbs_g, fat_g, notes) VALUES
-- Breakfast items
(1, 'Oatmeal with Berries', 'breakfast', 320, 12, 58, 6, 'Whole grain oats with mixed berries'),
(1, 'Greek Yogurt Parfait', 'breakfast', 280, 18, 35, 8, 'Greek yogurt with granola and honey'),
(1, 'Scrambled Eggs & Toast', 'breakfast', 350, 22, 28, 16, 'Two eggs with whole wheat toast'),
(1, 'Protein Smoothie', 'breakfast', 290, 25, 38, 5, 'Banana, protein powder, almond milk'),
(1, 'Avocado Toast', 'breakfast', 340, 12, 36, 18, 'Whole grain toast with mashed avocado'),

-- Lunch items
(1, 'Grilled Chicken Salad', 'lunch', 380, 35, 22, 16, 'Mixed greens, grilled chicken, vinaigrette'),
(1, 'Turkey & Cheese Wrap', 'lunch', 420, 28, 42, 15, 'Whole wheat tortilla with veggies'),
(1, 'Quinoa Buddha Bowl', 'lunch', 450, 18, 62, 14, 'Quinoa, roasted vegetables, tahini'),
(1, 'Tuna Sandwich', 'lunch', 380, 26, 38, 12, 'Whole grain bread, tuna salad'),
(1, 'Chicken Caesar Salad', 'lunch', 420, 32, 18, 24, 'Romaine, chicken, parmesan, dressing'),

-- Dinner items
(1, 'Baked Salmon & Veggies', 'dinner', 480, 38, 28, 22, 'Salmon fillet with roasted vegetables'),
(1, 'Chicken Stir Fry', 'dinner', 520, 42, 54, 16, 'Chicken, mixed vegetables, brown rice'),
(1, 'Spaghetti Bolognese', 'dinner', 580, 32, 68, 18, 'Pasta with meat sauce'),
(1, 'Grilled Steak & Potatoes', 'dinner', 620, 48, 42, 26, 'Sirloin steak with roasted potatoes'),
(1, 'Vegetarian Curry', 'dinner', 440, 16, 64, 14, 'Mixed vegetables in curry sauce with rice'),

-- Snack items
(1, 'Apple with Almond Butter', 'snack', 180, 4, 22, 9, 'Fresh apple slices'),
(1, 'Protein Bar', 'snack', 220, 20, 24, 7, 'High protein energy bar'),
(1, 'Mixed Nuts', 'snack', 170, 6, 8, 14, 'Almonds, cashews, walnuts'),
(1, 'Hummus & Veggies', 'snack', 150, 6, 18, 6, 'Carrot and celery sticks'),
(1, 'Greek Yogurt', 'snack', 120, 17, 10, 2, 'Plain Greek yogurt');

-- Create a sample meal plan for current week
INSERT INTO meal_plans (user_id, week_start_date) VALUES
(1, DATE_TRUNC('week', CURRENT_DATE)::DATE);

-- Note: meal_plan_entries will be populated through the app
-- But we can add a few sample entries
INSERT INTO meal_plan_entries (meal_plan_id, day, slot, food_id) VALUES
(1, 'mon', 'breakfast', 1),
(1, 'mon', 'lunch', 6),
(1, 'mon', 'dinner', 11),
(1, 'tue', 'breakfast', 2),
(1, 'tue', 'lunch', 7);

-- Success message
SELECT 'Database schema created and seeded successfully!' AS message;