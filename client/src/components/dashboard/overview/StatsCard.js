import PropTypes from 'prop-types';
import { formatCurrency } from '../../../utils/formatters';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';
import { useTheme } from '../../../context/ThemeContext';

function StatsCard({
  title,
  value,
  change,
  icon: Icon,
  trend,
  loading = false,
  error = null,
  currency = 'KES',
  className = '',
}) {
  const { isDarkMode } = useTheme();
  const isPositive = change >= 0;
  const trendColor = isPositive ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400';
  const TrendIcon = isPositive ? ArrowUpIcon : ArrowDownIcon;

  // Container classes
  const containerClasses = `
    rounded-lg shadow p-6 transition-all
    ${isDarkMode ? 'bg-gray-700' : 'bg-white'}
    ${error ? 'border border-red-500 dark:border-red-400' : ''}
    ${className}
  `;

  // Icon container classes
  const iconContainerClasses = `
    p-3 rounded-full 
    ${isDarkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-600'}
    ${loading ? 'opacity-50' : ''}
  `;

  return (
    <div className={containerClasses}>
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
            {title}
          </p>
          {loading ? (
            <div className="h-8 w-3/4 bg-gray-200 dark:bg-gray-600 rounded mt-2 animate-pulse"></div>
          ) : error ? (
            <p className="text-red-500 dark:text-red-400 text-sm mt-2">Error loading data</p>
          ) : (
            <p className="text-2xl font-semibold text-gray-900 dark:text-white truncate">
              {typeof value === 'number' ? formatCurrency(value, currency) : value}
            </p>
          )}
        </div>
        <div className={iconContainerClasses}>
          <Icon className="w-6 h-6" />
        </div>
      </div>

      {!loading && !error && change !== undefined && (
        <div className="mt-4 flex items-center text-sm">
          <div className={`flex items-center ${trendColor}`}>
            <TrendIcon className="h-4 w-4 mr-1" />
            <span>
              {Math.abs(change)}% {trend && <span className="ml-1">{trend}</span>}
            </span>
          </div>
          <span className="ml-2 text-gray-500 dark:text-gray-400">
            vs last period
          </span>
        </div>
      )}
    </div>
  );
}

StatsCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  change: PropTypes.number,
  icon: PropTypes.elementType.isRequired,
  trend: PropTypes.string,
  loading: PropTypes.bool,
  error: PropTypes.string,
  currency: PropTypes.string,
  className: PropTypes.string,
};

StatsCard.defaultProps = {
  change: undefined,
  trend: '',
  loading: false,
  error: null,
  currency: 'USD',
  className: '',
};

export default StatsCard;