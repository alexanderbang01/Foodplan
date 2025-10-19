import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, X, Sparkles } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Select from '../components/ui/Select';
import { PageLoader } from '../components/ui/Loader';
import { useToast } from '../components/ui/Toast';
import { mealPlansAPI, foodsAPI } from '../lib/api';
import { getWeekStartDate, formatWeekRange, getDayName, getSlotLabel, calculateTotalMacros } from '../lib/utils';

const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const slots = ['breakfast', 'lunch', 'dinner', 'snack1', 'snack2'];

export default function MealPlanner() {
  const [currentWeek, setCurrentWeek] = useState(getWeekStartDate());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedFoodId, setSelectedFoodId] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: mealPlan, isLoading: planLoading } = useQuery({
    queryKey: ['meal-plan', currentWeek],
    queryFn: async () => {
      const response = await mealPlansAPI.getMealPlan(currentWeek);
      return response.data.mealPlan;
    },
  });

  const { data: foods } = useQuery({
    queryKey: ['foods-all'],
    queryFn: async () => {
      const response = await foodsAPI.getFoods({});
      return response.data.foods;
    },
  });

  const updateEntryMutation = useMutation({
    mutationFn: ({ mealPlanId, data }) => mealPlansAPI.createOrUpdateEntry(mealPlanId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['meal-plan']);
      toast.success('Meal updated successfully!');
      setIsModalOpen(false);
      setSelectedSlot(null);
      setSelectedFoodId('');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to update meal');
    },
  });

  const deleteEntryMutation = useMutation({
    mutationFn: ({ mealPlanId, entryId }) => mealPlansAPI.deleteEntry(mealPlanId, entryId),
    onSuccess: () => {
      queryClient.invalidateQueries(['meal-plan']);
      toast.success('Meal removed successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to remove meal');
    },
  });

  const handlePreviousWeek = () => {
    const date = new Date(currentWeek);
    date.setDate(date.getDate() - 7);
    setCurrentWeek(date.toISOString().split('T')[0]);
  };

  const handleNextWeek = () => {
    const date = new Date(currentWeek);
    date.setDate(date.getDate() + 7);
    setCurrentWeek(date.toISOString().split('T')[0]);
  };

  const handleSlotClick = (day, slot) => {
    setSelectedSlot({ day, slot });
    const entry = getEntry(day, slot);
    setSelectedFoodId(entry?.food_id?.toString() || '');
    setIsModalOpen(true);
  };

  const handleSaveEntry = () => {
    if (!selectedFoodId) {
      toast.error('Please select a food');
      return;
    }

    updateEntryMutation.mutate({
      mealPlanId: mealPlan.id,
      data: {
        day: selectedSlot.day,
        slot: selectedSlot.slot,
        food_id: parseInt(selectedFoodId),
        notes: '',
      },
    });
  };

  const handleRemoveEntry = (day, slot, e) => {
    e.stopPropagation();
    const entry = getEntry(day, slot);
    if (entry) {
      deleteEntryMutation.mutate({
        mealPlanId: mealPlan.id,
        entryId: entry.id,
      });
    }
  };

  const handleGenerateFromPantry = () => {
    if (!foods || foods.length === 0) {
      toast.error('No foods available. Add some foods first!');
      return;
    }

    const foodsByCategory = {
      breakfast: foods.filter(f => f.category === 'breakfast'),
      lunch: foods.filter(f => f.category === 'lunch'),
      dinner: foods.filter(f => f.category === 'dinner'),
      snack: foods.filter(f => f.category === 'snack'),
    };

    days.forEach(day => {
      if (foodsByCategory.breakfast.length > 0) {
        const food = foodsByCategory.breakfast[Math.floor(Math.random() * foodsByCategory.breakfast.length)];
        updateEntryMutation.mutate({
          mealPlanId: mealPlan.id,
          data: { day, slot: 'breakfast', food_id: food.id, notes: '' },
        });
      }

      if (foodsByCategory.lunch.length > 0) {
        const food = foodsByCategory.lunch[Math.floor(Math.random() * foodsByCategory.lunch.length)];
        updateEntryMutation.mutate({
          mealPlanId: mealPlan.id,
          data: { day, slot: 'lunch', food_id: food.id, notes: '' },
        });
      }

      if (foodsByCategory.dinner.length > 0) {
        const food = foodsByCategory.dinner[Math.floor(Math.random() * foodsByCategory.dinner.length)];
        updateEntryMutation.mutate({
          mealPlanId: mealPlan.id,
          data: { day, slot: 'dinner', food_id: food.id, notes: '' },
        });
      }
    });

    toast.success('Week generated from pantry!');
  };

  const getEntry = (day, slot) => {
    return mealPlan?.entries?.find(e => e.day === day && e.slot === slot);
  };

  const getDayTotals = (day) => {
    const dayEntries = mealPlan?.entries?.filter(e => e.day === day) || [];
    return calculateTotalMacros(dayEntries);
  };

  if (planLoading) return <PageLoader />;

  const foodOptions = foods?.map(f => ({
    value: f.id.toString(),
    label: `${f.name} (${f.calories} cal)`,
  })) || [];

  // Mobile List View
  const MobileView = () => (
    <div className="space-y-4">
      {days.map((day) => {
        const totals = getDayTotals(day);
        return (
          <Card key={day}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{getDayName(day)}</CardTitle>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">{totals.calories} cal</p>
                  <p className="text-xs text-gray-600">
                    P: {totals.protein.toFixed(0)}g C: {totals.carbs.toFixed(0)}g F: {totals.fat.toFixed(0)}g
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {slots.map((slot) => {
                const entry = getEntry(day, slot);
                return (
                  <div
                    key={`${day}-${slot}`}
                    onClick={() => handleSlotClick(day, slot)}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      entry?.food_id
                        ? 'bg-primary-50 border-primary-200'
                        : 'bg-gray-50 border-gray-200 border-dashed'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-600 mb-1">
                          {getSlotLabel(slot)}
                        </p>
                        {entry?.food_id ? (
                          <>
                            <p className="text-sm font-medium text-gray-900">{entry.food_name}</p>
                            <p className="text-xs text-gray-600">{entry.calories} cal</p>
                          </>
                        ) : (
                          <p className="text-sm text-gray-400">Tap to add</p>
                        )}
                      </div>
                      {entry?.food_id && (
                        <button
                          onClick={(e) => handleRemoveEntry(day, slot, e)}
                          className="text-gray-400 hover:text-red-600 transition-colors ml-2"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  // Desktop Grid View
  const DesktopView = () => (
    <div className="overflow-x-auto">
      <div className="min-w-full inline-block">
        <div className="grid grid-cols-8 gap-3">
          <div className="font-medium text-gray-700 p-3">Meal</div>
          {days.map(day => (
            <div key={day} className="font-medium text-gray-700 p-3 text-center">
              {getDayName(day).slice(0, 3)}
            </div>
          ))}

          {slots.map(slot => (
            <>
              <div key={`${slot}-label`} className="font-medium text-gray-700 p-3 flex items-center">
                {getSlotLabel(slot)}
              </div>
              {days.map(day => {
                const entry = getEntry(day, slot);
                return (
                  <motion.div
                    key={`${day}-${slot}`}
                    whileHover={{ scale: 1.02 }}
                    className="relative"
                  >
                    <Card
                      hover
                      className={`cursor-pointer h-full min-h-[100px] ${
                        entry?.food_id ? 'bg-primary-50 border-primary-200' : 'bg-gray-50'
                      }`}
                      onClick={() => handleSlotClick(day, slot)}
                    >
                      <CardContent className="p-3 h-full flex flex-col justify-between">
                        {entry?.food_id ? (
                          <>
                            <div>
                              <p className="text-sm font-medium text-gray-900 line-clamp-2">
                                {entry.food_name}
                              </p>
                              <p className="text-xs text-gray-600 mt-1">
                                {entry.calories} cal
                              </p>
                            </div>
                            <button
                              onClick={(e) => handleRemoveEntry(day, slot, e)}
                              className="absolute top-2 right-2 text-gray-400 hover:text-red-600 transition-colors"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </>
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <Plus className="h-5 w-5 text-gray-400" />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </>
          ))}

          <div className="font-semibold text-gray-900 p-3 flex items-center">Daily Total</div>
          {days.map(day => {
            const totals = getDayTotals(day);
            return (
              <Card key={`${day}-total`} className="bg-gray-100">
                <CardContent className="p-3">
                  <p className="text-sm font-bold text-gray-900">{totals.calories} cal</p>
                  <p className="text-xs text-gray-600">
                    P: {totals.protein.toFixed(0)}g | C: {totals.carbs.toFixed(0)}g | F: {totals.fat.toFixed(0)}g
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Meal Planner</h1>
          <p className="text-sm sm:text-base text-gray-600">Plan your weekly meals</p>
        </div>
        <Button onClick={handleGenerateFromPantry} variant="outline" size="sm" className="w-full sm:w-auto">
          <Sparkles className="h-4 w-4 mr-2" />
          Generate
        </Button>
      </div>

      {/* Week Navigation */}
      <Card>
        <CardContent className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={handlePreviousWeek}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            {formatWeekRange(currentWeek)}
          </h2>
          <Button variant="ghost" size="sm" onClick={handleNextWeek}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </CardContent>
      </Card>

      {/* Conditional Rendering based on screen size */}
      <div className="block lg:hidden">
        <MobileView />
      </div>
      <div className="hidden lg:block">
        <DesktopView />
      </div>

      {/* Add/Edit Meal Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedSlot(null);
          setSelectedFoodId('');
        }}
        title={`Select Food${selectedSlot ? ` - ${getDayName(selectedSlot.day)} ${getSlotLabel(selectedSlot.slot)}` : ''}`}
      >
        <div className="space-y-4">
          <Select
            label="Choose a food"
            value={selectedFoodId}
            onChange={(e) => setSelectedFoodId(e.target.value)}
            options={[
              { value: '', label: 'Select a food...' },
              ...foodOptions,
            ]}
          />

          <div className="flex gap-3">
            <Button
              onClick={handleSaveEntry}
              className="flex-1"
              loading={updateEntryMutation.isPending}
            >
              Save
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setIsModalOpen(false);
                setSelectedSlot(null);
                setSelectedFoodId('');
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}