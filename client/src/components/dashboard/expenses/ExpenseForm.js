import { useState } from 'react';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Button from '../../../components/ui/Button/Button';
import Input from '../../../components/ui/Form/Input';
import Select from '../../../components/ui/Form/Select';
import { validateAmount, formatCurrencyInput } from '../../../utils/helpers';

const CATEGORIES = [
  { value: 'food', label: 'Food & Dining' },
  { value: 'transportation', label: 'Transportation' },
  { value: 'housing', label: 'Housing' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'education', label: 'Education' },
  { value: 'other', label: 'Other' },
];

function ExpenseForm({ onSubmit, onCancel, isLoading = false }) {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: CATEGORIES[0].value,
    date: new Date(),
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
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

    try {
      await onSubmit({
        description: formData.description.trim(),
        amount: parseFloat(formData.amount),
        category: formData.category,
        date: format(formData.date, 'yyyy-MM-dd'),
      });
    } catch (error) {
      console.error('Expense submission failed:', error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
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
      <Input
        name="description"
        label="Description"
        value={formData.description}
        onChange={handleChange}
        error={errors.description}
        required
        disabled={isLoading}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          name="amount"
          label="Amount"
          type="text" // Changed to text to handle currency formatting
          value={formData.amount}
          onChange={handleChange}
          placeholder="0.00"
          error={errors.amount}
          required
          disabled={isLoading}
          inputMode="decimal"
        />

        <Select
          name="category"
          label="Category"
          options={CATEGORIES}
          value={formData.category}
          onChange={handleChange}
          disabled={isLoading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Date
        </label>
        <DatePicker
          selected={formData.date}
          onChange={(date) => setFormData(prev => ({ ...prev, date }))}
          className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
          disabled={isLoading}
         showMonthYearDropdown/>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          isLoading={isLoading}
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Save Expense'}
        </Button>
      </div>
    </form>
  );
}

ExpenseForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

export default ExpenseForm;