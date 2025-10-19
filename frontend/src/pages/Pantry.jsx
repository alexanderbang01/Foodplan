import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Search, Filter } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { PageLoader } from '../components/ui/Loader';
import { foodsAPI } from '../lib/api';

const categoryOptions = [
  { value: '', label: 'All Categories' },
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'snack', label: 'Snack' },
];

const sortOptions = [
  { value: 'name', label: 'Name (A-Z)' },
  { value: 'calories_asc', label: 'Calories (Low to High)' },
  { value: 'calories_desc', label: 'Calories (High to Low)' },
  { value: 'protein_desc', label: 'Protein (High to Low)' },
];

export default function Pantry() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState('name');

  const { data: foods, isLoading } = useQuery({
    queryKey: ['foods', search, category],
    queryFn: async () => {
      const response = await foodsAPI.getFoods({ search, category });
      return response.data.foods;
    },
  });

  const sortFoods = (foodsList) => {
    if (!foodsList) return [];
    
    const sorted = [...foodsList];
    
    switch (sortBy) {
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'calories_asc':
        return sorted.sort((a, b) => a.calories - b.calories);
      case 'calories_desc':
        return sorted.sort((a, b) => b.calories - a.calories);
      case 'protein_desc':
        return sorted.sort((a, b) => b.protein_g - a.protein_g);
      default:
        return sorted;
    }
  };

  if (isLoading) return <PageLoader />;

  const sortedFoods = sortFoods(foods);

  const getCategoryBadgeColor = (cat) => {
    const colors = {
      breakfast: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      lunch: 'bg-blue-100 text-blue-800 border-blue-200',
      dinner: 'bg-purple-100 text-purple-800 border-purple-200',
      snack: 'bg-green-100 text-green-800 border-green-200',
    };
    return colors[cat] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const categoryStats = {
    breakfast: foods?.filter(f => f.category === 'breakfast').length || 0,
    lunch: foods?.filter(f => f.category === 'lunch').length || 0,
    dinner: foods?.filter(f => f.category === 'dinner').length || 0,
    snack: foods?.filter(f => f.category === 'snack').length || 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Pantry</h1>
        <p className="text-gray-600">Browse and search your food collection</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(categoryStats).map(([cat, count]) => (
          <Card key={cat}>
            <CardContent className="text-center">
              <p className="text-3xl font-bold text-gray-900">{count}</p>
              <p className="text-sm text-gray-600 capitalize">{cat}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters & Search */}
      <Card>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search foods..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={categoryOptions}
            />
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              options={sortOptions}
            />
          </div>
        </CardContent>
      </Card>

      {/* Foods Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Foods ({sortedFoods?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Category</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Calories</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Protein</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Carbs</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Fat</th>
                </tr>
              </thead>
              <tbody>
                {sortedFoods?.map((food, index) => (
                  <motion.tr
                    key={food.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.02 }}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-gray-900">{food.name}</p>
                        {food.notes && (
                          <p className="text-xs text-gray-500 line-clamp-1">{food.notes}</p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-1 rounded-full border ${getCategoryBadgeColor(food.category)}`}>
                        {food.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-gray-900">
                      {food.calories}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-700">
                      {food.protein_g}g
                    </td>
                    <td className="py-3 px-4 text-right text-gray-700">
                      {food.carbs_g}g
                    </td>
                    <td className="py-3 px-4 text-right text-gray-700">
                      {food.fat_g}g
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {sortedFoods?.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No foods found.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}