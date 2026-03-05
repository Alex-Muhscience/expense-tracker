import { useQuery } from '@tanstack/react-query';
import { ClockIcon, ShoppingBagIcon, HomeIcon, TruckIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../../../context/ThemeContext';
import PropTypes from 'prop-types';
import api from '../../../services/api';
import LoadingSpinner from '../../shared/Loading/LoadingSpinner';
import ErrorMessage from '../../shared/ErrorMessage/ErrorMessage';
import { formatDateWithTime } from '../../../utils/helpers';

const CATEGORY_ICONS = {
  food: <ShoppingBagIcon className="h-5 w-5 text-blue-500" />,
  transportation: <TruckIcon className="h-5 w-5 text-green-500" />,
  housing: <HomeIcon className="h-5 w-5 text-purple-500" />,
  shopping: <ShoppingBagIcon className="h-5 w-5 text-orange-500" />,
  salary: <CurrencyDollarIcon className="h-5 w-5 text-emerald-500" />,
  default: <ShoppingBagIcon className="h-5 w-5 text-gray-500" />,
};

const getCategoryIcon = (category) => {
  return CATEGORY_ICONS[category] || CATEGORY_ICONS.default;
};

const fetchRecentActivities = async () => {
  const { data } = await api.get('/activities/recent');
  return data;
};

export default function RecentActivity({ limit = 5 }) {
  const { isDarkMode } = useTheme();

  const { data: activities, isLoading, error } = useQuery({
    queryKey: ['recentActivities'],
    queryFn: fetchRecentActivities,
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message="Failed to load recent activities" />;

  const displayedActivities = activities?.slice(0, limit) || [];

  return (
    <div className={`rounded-lg shadow p-6 h-full ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Recent Activity</h3>

      {displayedActivities.length === 0 ? (
        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          No recent activities found
        </p>
      ) : (
        <div className="space-y-4">
          {displayedActivities.map((activity) => (
            <div
              key={activity.id}
              className={`flex items-start p-3 rounded-lg transition-colors ${
                isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex-shrink-0 mt-1">
                {getCategoryIcon(activity.category)}
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className={`text-sm font-medium truncate ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {activity.description}
                  </p>
                  <p className={`text-sm whitespace-nowrap ml-2 ${
                    activity.type === 'income' 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {activity.type === 'income' ? '+' : '-'}{activity.amount.toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center mt-1">
                  <ClockIcon className={`h-4 w-4 mr-1 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                  <p className={`text-xs ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {formatDateWithTime(activity.date)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4">
        <button
          type="button"
          className={`text-sm font-medium transition-colors ${
            isDarkMode 
              ? 'text-blue-400 hover:text-blue-300' 
              : 'text-blue-600 hover:text-blue-500'
          }`}
          onClick={() => {/* Navigate to the full activity page */}}
        >
          View all activity →
        </button>
      </div>
    </div>
  );
}

RecentActivity.propTypes = {
  limit: PropTypes.number,
};