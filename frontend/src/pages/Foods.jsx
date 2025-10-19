import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Search, Plus, Edit2, Trash2 } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Modal from '../components/ui/Modal';
import FoodForm from '../components/forms/FoodForm';
import { PageLoader } from '../components/ui/Loader';
import { useToast } from '../components/ui/Toast';
import { foodsAPI } from '../lib/api';

const categoryOptions = [
  { value: '', label: 'All Categories' },
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'snack', label: 'Snack' },
];

export default function Foods() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFood, setEditingFood] = useState(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: foods, isLoading } = useQuery({
    queryKey: ['foods', search, category],
    queryFn: async () => {
      const response = await foodsAPI.getFoods({ search, category });
      return response.data.foods;
    },
  });

  const createMutation = useMutation({
    mutationFn: foodsAPI.createFood,
    onSuccess: () => {
      queryClient.invalidateQueries(['foods']);
      toast.success('Food added successfully!');
      setIsModalOpen(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to add food');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => foodsAPI.updateFood(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['foods']);
      toast.success('Food updated successfully!');
      setIsModalOpen(false);
      setEditingFood(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to update food');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: foodsAPI.deleteFood,
    onSuccess: () => {
      queryClient.invalidateQueries(['foods']);
      toast.success('Food deleted successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to delete food');
    },
  });

  const handleSubmit = (data) => {
    if (editingFood) {
      updateMutation.mutate({ id: editingFood.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (food) => {
    setEditingFood(food);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this food?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingFood(null);
  };

  if (isLoading) return <PageLoader />;

  const getCategoryBadgeColor = (cat) => {
    const colors = {
      breakfast: 'bg-yellow-100 text-yellow-800',
      lunch: 'bg-blue-100 text-blue-800',
      dinner: 'bg-purple-100 text-purple-800',
      snack: 'bg-green-100 text-green-800',
    };
    return colors[cat] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Foods</h1>
          <p className="text-gray-600">Manage your food collection</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Food
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>
        </CardContent>
      </Card>

      {/* Foods List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {foods?.map((food, index) => (
          <motion.div
            key={food.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card hover>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="mb-2">{food.name}</CardTitle>
                    <span className={`text-xs px-2 py-1 rounded-full ${getCategoryBadgeColor(food.category)}`}>
                      {food.category}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(food)}
                      className="text-gray-400 hover:text-primary-600 transition-colors"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(food.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-600">Calories</p>
                    <p className="font-semibold">{food.calories}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Protein</p>
                    <p className="font-semibold">{food.protein_g}g</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Carbs</p>
                    <p className="font-semibold">{food.carbs_g}g</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Fat</p>
                    <p className="font-semibold">{food.fat_g}g</p>
                  </div>
                </div>
                {food.notes && (
                  <p className="mt-3 text-sm text-gray-600 line-clamp-2">
                    {food.notes}
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {foods?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No foods found. Add your first food to get started!</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title={editingFood ? 'Edit Food' : 'Add New Food'}
      >
        <FoodForm
          initialData={editingFood}
          onSubmit={handleSubmit}
          onCancel={handleModalClose}
          loading={createMutation.isPending || updateMutation.isPending}
        />
      </Modal>
    </div>
  );
}