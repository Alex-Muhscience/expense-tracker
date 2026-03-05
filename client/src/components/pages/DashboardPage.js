import { useQuery, useQueryClient } from '@tanstack/react-query';
import DashboardLayout from '../dashboard/layout/DashboardLayout';
import StatsCard from '../dashboard/overview/StatsCard';
import RecentActivity from '../dashboard/overview/RecentActivity';
import ExpenseChart from '../dashboard/charts/ExpenseChart';
import BudgetSummary from '../dashboard/budget/BudgetSummary';
import {ArrowDownIcon, CurrencyDollarIcon, ChartBarIcon, ReceiptPercentIcon, ArrowPathIcon, ClockIcon} from '@heroicons/react/24/outline';
import { useTheme } from '../../context/ThemeContext';
import LoadingSpinner from '../../components/shared/Loading/LoadingSpinner';
import ErrorMessage from '../../components/shared/ErrorMessage/ErrorMessage';
import EmptyState from '../../components/shared/EmptyState/EmptyState';
import { motion, AnimatePresence } from 'framer-motion';
import DateRangePicker from '../../components/ui/DateRangePicker/DateRangePicker';
import { format, subDays } from 'date-fns';
import axios from '../../services/api';
import {useState} from "react";
import {Button} from "react-bootstrap";
import '../../index.css';

const fetchDashboardStats = async (dateRange) => {
  const params = {
    start_date: format(dateRange.startDate, 'yyyy-MM-dd'),
    end_date: format(dateRange.endDate, 'yyyy-MM-dd'),
    compare_start: format(subDays(dateRange.startDate, 30), 'yyyy-MM-dd'),
    compare_end: format(subDays(dateRange.endDate, 30), 'yyyy-MM-dd'),
  };
  const { data } = await axios.get('/api/dashboard', { params });
  return data;
};

const fetchRecentExpenses = async () => {
  const { data } = await axios.get('/api/expenses', {
    params: { limit: 5, sort_by: 'date', sort_order: 'desc' }
  });
  return data.items;
};

function DashboardPage() {
  const { isDarkMode } = useTheme();
  const queryClient = useQueryClient();
  const [dateRange, setDateRange] = useState({
    startDate: subDays(new Date(), 30),
    endDate: new Date(),
  });

  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery(
    ['dashboardStats', dateRange],
    () => fetchDashboardStats(dateRange),
    {
      keepPreviousData: true,
      staleTime: 300000, // 5 minutes
    }
  );

  const { data: expenses, isLoading: expensesLoading, error: expensesError } = useQuery(
    'recentExpenses',
    fetchRecentExpenses,
    {
      staleTime: 300000,
    }
  );

  const loading = statsLoading || expensesLoading;
  const error = statsError || expensesError;

  const handleRefresh = () => {
    queryClient.invalidateQueries(['dashboardStats']);
    queryClient.invalidateQueries(['recentExpenses']);
  };

  const handleDateRangeChange = (newRange) => {
    setDateRange(newRange);
  };

  if (error) {
    return (
      <DashboardLayout>
        <ErrorMessage
          message={error.message || "Failed to load dashboard data"}
          onRetry={handleRefresh}
          className="mt-8"
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Dashboard Overview
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {format(dateRange.startDate, 'MMM d, yyyy')} - {format(dateRange.endDate, 'MMM d, yyyy')}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <DateRangePicker
              value={dateRange}
              onChange={handleDateRangeChange}
              className="w-full sm:w-64"
            />
            <button
              onClick={handleRefresh}
              disabled={loading}
              className={`flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium ${
                isDarkMode
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } border ${
                isDarkMode ? 'border-gray-600' : 'border-gray-300'
              } shadow-sm`}
              aria-label="Refresh dashboard"
            >
              <ArrowPathIcon className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {loading && !stats ? (
          <LoadingSpinner className="h-64" />
        ) : (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                  title="Total Spent"
                  value={stats?.totalSpent || 0}
                  change={stats?.monthOverMonthChange || 0}
                  icon={CurrencyDollarIcon}
                  trend={(stats?.monthOverMonthChange || 0) >= 0 ? 'increase' : 'decrease'}
                  loading={loading}
                  currency="USD"
                />
                <StatsCard
                  title="Expenses Count"
                  value={stats?.expenseCount || 0}
                  change={stats?.countChange || 0}
                  icon={ReceiptPercentIcon}
                  trend={(stats?.countChange || 0) >= 0 ? 'increase' : 'decrease'}
                  loading={loading}
                />
                <StatsCard
                  title="Avg Daily"
                  value={stats?.avgDailySpend || 0}
                  change={stats?.dailyChange || 0}
                  icon={ArrowDownIcon}
                  trend={(stats?.dailyChange || 0) >= 0 ? 'increase' : 'decrease'}
                  loading={loading}
                  currency="USD"
                />
                <StatsCard
                  title="Top Category"
                  value={stats?.topCategory?.name || 'N/A'}
                  change={stats?.categoryChange || 0}
                  icon={ChartBarIcon}
                  trend={(stats?.categoryChange || 0) >= 0 ? 'increase' : 'decrease'}
                  loading={loading}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <div className={`rounded-lg shadow p-6 ${
                    isDarkMode ? 'bg-gray-800' : 'bg-white'
                  }`}>
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                        Spending Trends
                      </h2>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        {format(dateRange.startDate, 'MMM d')} - {format(dateRange.endDate, 'MMM d')}
                      </div>
                    </div>
                    <ExpenseChart
                      data={stats?.chartData || []}
                      emptyState={
                        <EmptyState
                          title="No spending data"
                          description="Add expenses to see trends"
                          icon={<ChartBarIcon className="h-10 w-10 mx-auto text-gray-400" />}
                        />
                      }
                    />
                  </div>

                  <BudgetSummary
                    totalBudget={stats?.totalBudget || 0}
                    totalExpenses={stats?.totalSpent || 0}
                    period={dateRange}
                    className={isDarkMode ? 'bg-gray-800' : 'bg-white'}
                  />
                </div>

                <div className="space-y-6">
                  <RecentActivity
                    expenses={expenses || []}
                    loading={expensesLoading}
                  />

                  <div className={`rounded-lg shadow p-6 ${
                    isDarkMode ? 'bg-gray-800' : 'bg-white'
                  }`}>
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Quick Actions
                    </h2>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => window.location.href = '/expenses/new'}
                      >
                        Add Expense
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => window.location.href = '/budgets'}
                      >
                        Set Budget
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => window.location.href = '/reports'}
                      >
                        View Reports
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => window.location.href = '/categories'}
                      >
                        Manage Categories
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </DashboardLayout>
  );
}

export default DashboardPage;