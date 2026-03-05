import { useState } from 'react';
import PropTypes from 'prop-types';
import Input from '../../ui/Form/Input';
import Select from '../../ui/Form/Select';
import Button from '../../ui/Button/Button';
import { XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useNotification } from '../../../context/NotificationContext';
import api from '../../../services/api';
import { formatCurrencyInput, validateAmount } from '../../../utils/helpers';

const CATEGORIES = [
  { value: 'food', label: 'Food & Dining' },
  { value: 'transportation', label: 'Transportation' },
  { value: 'housing', label: 'Housing' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'health', label: 'Health & Fitness' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'other', label: 'Other' },
];

const PERIODS = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

export default function BudgetForm({ onCancel, onSuccess }) {
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    period: 'monthly',
    notes: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showNotification } = useNotification();

  const validate = () => {
    const newErrors = {};

    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }

    const amountError = validateAmount(formData.amount);
    if (amountError) {
      newErrors.amount = amountError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount),
      };

      const response = await api.post('/budgets', payload);

      showNotification({
        type: 'success',
        message: 'Budget created successfully',
      });

      onSuccess?.(response.data);
      onCancel();
    } catch (error) {
      console.error('Budget creation error:', error);

      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        showNotification({
          type: 'error',
          message: error.response?.data?.message || 'Failed to create budget',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? formatCurrencyInput(value) : value,
    }));

    // Clear error when a user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Select
            name="category"
            value={formData.category}
            onChange={handleChange}
            options={CATEGORIES}
            placeholder="Select category"
            label="Category"
            error={errors.category}
            required
            disabled={isSubmitting}
          />
        </div>
        <div>
          <Input
            type="text" // Changed to text to handle currency formatting
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            placeholder="0.00"
            label="Amount"
            error={errors.amount}
            required
            disabled={isSubmitting}
            inputMode="decimal"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Select
            name="period"
            value={formData.period}
            onChange={handleChange}
            options={PERIODS}
            label="Budget Period"
            disabled={isSubmitting}
          />
        </div>
        <div className="flex items-end">
          <Input
            type="text"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Optional notes"
            label="Notes"
            disabled={isSubmitting}
          />
        </div>
      </div>

      {errors.api && (
        <div className="text-red-500 text-sm mt-2">
          {errors.api}
        </div>
      )}

      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          icon={<XMarkIcon className="h-5 w-5 mr-2" />}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          icon={<CheckIcon className="h-5 w-5 mr-2" />}
          disabled={isSubmitting}
          isLoading={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Save Budget'}
        </Button>
      </div>
    </form>
  );
}

BudgetForm.propTypes = {
  onCancel: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
};