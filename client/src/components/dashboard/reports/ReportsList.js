import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  ArrowDownTrayIcon,
  FunnelIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../../../context/ThemeContext';
import DateRangePicker from '../../ui/DateRangePicker/DateRangePicker';
import Dropdown from '../../ui/Dropdown/Dropdown';
import LoadingSpinner from '../../shared/Loading/LoadingSpinner';
import ErrorMessage from '../../shared/ErrorMessage/ErrorMessage';
import ChartPlaceholder from '../../ui/Chart/ChartPlaceholder';

const REPORT_TABS = [
  { id: 'daily', name: 'Daily' },
  { id: 'weekly', name: 'Weekly' },
  { id: 'monthly', name: 'Monthly' },
  { id: 'yearly', name: 'Yearly' },
  { id: 'custom', name: 'Custom' },
];

const REPORT_CATEGORIES = [
  { id: 'all', name: 'All Categories' },
  { id: 'food', name: 'Food & Dining' },
  { id: 'transportation', name: 'Transportation' },
  { id: 'housing', name: 'Housing' },
  { id: 'entertainment', name: 'Entertainment' },
];

export default function ReportsList({
  loading = false,
  error = null,
  onExport,
  onFilterChange,
  initialDateRange,
}) {
  const { isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('monthly');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: 'all',
    dateRange: initialDateRange || {
      startDate: new Date(),
      endDate: new Date(),
    },
  });

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    // Trigger data fetch when tab changes
    onFilterChange?.({ ...filters, period: tabId });
  };

  const handleExport = () => {
    onExport?.({
      format: 'csv',
      period: activeTab,
      ...filters
    });
  };

  const handleFilterChange = (newFilters) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFilterChange?.(updatedFilters);
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  return (
    <div className={`rounded-lg shadow overflow-hidden transition-colors ${
      isDarkMode ? 'bg-gray-800' : 'bg-white'
    }`}>
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Expense Reports</h3>
        <div className="flex space-x-3">
          <button
            onClick={toggleFilters}
            className={`inline-flex items-center px-3 py-2 border rounded-md shadow-sm text-sm font-medium transition-colors ${
              isDarkMode 
                ? 'border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600' 
                : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
            }`}
            aria-expanded={showFilters}
            aria-label="Filter reports"
          >
            <FunnelIcon className="h-4 w-4 mr-2" />
            Filter
          </button>
          <button
            onClick={handleExport}
            className={`inline-flex items-center px-3 py-2 border rounded-md shadow-sm text-sm font-medium transition-colors ${
              isDarkMode 
                ? 'border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600' 
                : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
            }`}
            disabled={loading}
            aria-label="Export report"
          >
            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {showFilters && (
        <div className={`px-6 py-4 border-b ${
          isDarkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'
        }`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date Range
              </label>
              <DateRangePicker
                value={filters.dateRange}
                onChange={(range) => handleFilterChange({ dateRange: range })}
                disabled={activeTab !== 'custom'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <Dropdown
                options={REPORT_CATEGORIES}
                selected={filters.category}
                onSelect={(category) => handleFilterChange({ category })}
                buttonClassName="w-full"
              />
            </div>
          </div>
        </div>
      )}

      <div className="px-6 py-4">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8 overflow-x-auto pb-1">
            {REPORT_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
                disabled={loading}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-6">
          {loading ? (
            <div className="h-96 flex items-center justify-center">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <div className="h-96 flex items-center justify-center">
              <ErrorMessage message={error} onRetry={() => onFilterChange(filters)} />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="h-96">
                <ChartPlaceholder
                  title={`${REPORT_TABS.find(t => t.id === activeTab)?.name} Expense Report`}
                  icon={<ChartBarIcon className="w-12 h-12 mx-auto text-gray-400" />}
                />
              </div>

              {/* Data summary could go here */}
              <div className={`p-4 rounded-lg ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  Detailed report data will appear here
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

ReportsList.propTypes = {
  loading: PropTypes.bool,
  error: PropTypes.string,
  onExport: PropTypes.func,
  onFilterChange: PropTypes.func,
  initialDateRange: PropTypes.shape({
    startDate: PropTypes.instanceOf(Date),
    endDate: PropTypes.instanceOf(Date),
  }),
};

ReportsList.defaultProps = {
  loading: false,
  error: null,
};