import PropTypes from 'prop-types';
import DateRangePicker from '../../ui/DateRangePicker/DateRangePicker';
import Dropdown from '../../ui/Dropdown/Dropdown';
import Input from '../../ui/Form/Input';

const CATEGORIES = [
  { id: 'all', name: 'All Categories' },
  { id: 'food', name: 'Food & Dining' },
  { id: 'transportation', name: 'Transportation' },
  // Add other categories
];

export default function ExpenseFilters({ filters, onChange, className }) {
  const handleChange = (name, value) => {
    onChange({ ...filters, [name]: value });
  };

  return (
    <div className={`bg-gray-50 dark:bg-gray-700 rounded-lg p-4 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Date Range
          </label>
          <DateRangePicker
            value={filters.dateRange}
            onChange={(range) => handleChange('dateRange', range)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Category
          </label>
          <Dropdown
            options={CATEGORIES}
            selected={filters.category}
            onSelect={(category) => handleChange('category', category)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Min Amount
          </label>
          <Input
            type="number"
            value={filters.minAmount}
            onChange={(e) => handleChange('minAmount', e.target.value)}
            placeholder="0.00"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Max Amount
          </label>
          <Input
            type="number"
            value={filters.maxAmount}
            onChange={(e) => handleChange('maxAmount', e.target.value)}
            placeholder="Any"
          />
        </div>
      </div>
    </div>
  );
}

ExpenseFilters.propTypes = {
  filters: PropTypes.shape({
    category: PropTypes.string,
    dateRange: PropTypes.shape({
      startDate: PropTypes.instanceOf(Date),
      endDate: PropTypes.instanceOf(Date),
    }),
    minAmount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    maxAmount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  className: PropTypes.string,
};