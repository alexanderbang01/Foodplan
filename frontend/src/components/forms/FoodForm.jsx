import { useState, useEffect } from 'react';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';

const categoryOptions = [
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'snack', label: 'Snack' },
];

export default function FoodForm({ initialData, onSubmit, onCancel, loading }) {
  const [formData, setFormData] = useState({
    name: '',
    category: 'breakfast',
    calories: '',
    protein_g: '',
    carbs_g: '',
    fat_g: '',
    notes: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.calories || formData.calories < 0) {
      newErrors.calories = 'Valid calories required';
    }

    if (formData.protein_g < 0) {
      newErrors.protein_g = 'Protein cannot be negative';
    }

    if (formData.carbs_g < 0) {
      newErrors.carbs_g = 'Carbs cannot be negative';
    }

    if (formData.fat_g < 0) {
      newErrors.fat_g = 'Fat cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      const submitData = {
        ...formData,
        calories: parseInt(formData.calories),
        protein_g: parseFloat(formData.protein_g) || 0,
        carbs_g: parseFloat(formData.carbs_g) || 0,
        fat_g: parseFloat(formData.fat_g) || 0,
      };
      onSubmit(submitData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Food Name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        error={errors.name}
        placeholder="e.g., Grilled Chicken Salad"
      />

      <Select
        label="Category"
        name="category"
        value={formData.category}
        onChange={handleChange}
        options={categoryOptions}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Calories"
          name="calories"
          type="number"
          value={formData.calories}
          onChange={handleChange}
          error={errors.calories}
          placeholder="0"
        />

        <Input
          label="Protein (g)"
          name="protein_g"
          type="number"
          step="0.1"
          value={formData.protein_g}
          onChange={handleChange}
          error={errors.protein_g}
          placeholder="0"
        />

        <Input
          label="Carbs (g)"
          name="carbs_g"
          type="number"
          step="0.1"
          value={formData.carbs_g}
          onChange={handleChange}
          error={errors.carbs_g}
          placeholder="0"
        />

        <Input
          label="Fat (g)"
          name="fat_g"
          type="number"
          step="0.1"
          value={formData.fat_g}
          onChange={handleChange}
          error={errors.fat_g}
          placeholder="0"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notes (optional)
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows="3"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
          placeholder="Any additional notes about this food..."
        />
      </div>

      <div className="flex gap-3">
        <Button type="submit" className="flex-1" loading={loading}>
          {initialData ? 'Update Food' : 'Add Food'}
        </Button>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}