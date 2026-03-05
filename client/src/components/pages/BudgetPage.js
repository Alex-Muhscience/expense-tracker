import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import BudgetOverview from '../dashboard/budget/BudgetOverview';
import BudgetForm from '../dashboard/budget/BudgetForm';
import BudgetComparisonChart from '../dashboard/budget/BudgetComparisonChart';
import Button from '../ui/Button/Button';
import {
  PlusIcon,
  ArrowPathIcon,
  ChartBarIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../../context/ThemeContext';
import LoadingSpinner from '../shared/Loading/LoadingSpinner';
import ErrorMessage from '../shared/ErrorMessage/ErrorMessage';
import EmptyState from '../shared/EmptyState/EmptyState';
import DateRangePicker from '../ui/DateRangePicker/DateRangePicker';
import { format, subMonths } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import axios from '../../services/api';
import '../../index.css';

const fetchBudgets = async (period) => {
  const { data } = await axios.get('/api/budgets', {
    params: {
      start_date: format(period.startDate, 'yyyy-MM-dd'),
      end_date: format(period.endDate, 'yyyy-MM-dd')
    }
  });
  return data;
};

const fetchBudgetStats = async (period) => {
  const { data } = await axios.get('/api/budgets/summary', {
    params: {
      start_date: format(period.startDate, 'yyyy-MM-dd'),
      end_date: format(period.endDate, 'yyyy-MM-dd')
    }
  });
  return data;
};

export default function BudgetPage() {
  const { isDarkMode } = useTheme();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [period, setPeriod] = useState({
    startDate: subMonths(new Date(), 1),
    endDate: new Date()
  });

  const {
    data: budgets,
    isLoading: budgetsLoading,
    error: budgetsError
  } = useQuery(['budgets', period], () => fetchBudgets(period));

  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError
  } = useQuery(['budgetStats', period], () => fetchBudgetStats(period));

  const createBudget = useMutation(
    (budgetData) => axios.post('/api/budgets', budgetData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['budgets']);
        queryClient.invalidateQueries(['budgetStats']);
      },
    }
  );

  const deleteBudget = useMutation(
    (id) => axios.delete(`/api/budgets/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['budgets']);
        queryClient.invalidateQueries(['budgetStats']);
      },
    }
  );

  const loading = budgetsLoading || statsLoading;
  const error = budgetsError || statsError;

  const handleRefresh = () => {
    queryClient.invalidateQueries(['budgets']);
    queryClient.invalidateQueries(['budgetStats']);
  };

  const handleFormSubmit = async (formData) => {
    try {
      await createBudget.mutateAsync(formData);
      setShowForm(false);
    } catch (err) {
      console.error('Budget creation failed:', err);
    }
  };

  const handleDeleteBudget = async (id) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      await deleteBudget.mutateAsync(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Budget Planning</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {format(period.startDate, 'MMM d, yyyy')} - {format(period.endDate, 'MMM d, yyyy')}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <DateRangePicker
            value={period}
            onChange={setPeriod}
            className="w-full sm:w-64"
          />
          <Button
            variant="secondary"
            onClick={handleRefresh}
            disabled={loading}
            aria-label="Refresh budgets"
          >
            <ArrowPathIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button onClick={() => setShowForm(true)}>
            <PlusIcon className="h-5 w-5 mr-2" />
            Set Budget
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`rounded-lg shadow p-6 ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            <BudgetForm
              onCancel={() => setShowForm(false)}
              onSubmit={handleFormSubmit}
              period={period}
              loading={createBudget.isLoading}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {error ? (
        <ErrorMessage
          message={error.message || "Failed to load budget data"}
          onRetry={handleRefresh}
          className="mt-6"
        />
      ) : loading ? (
        <LoadingSpinner className="h-64" />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <div className={`rounded-lg shadow p-6 ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <BudgetOverview
              budgets={budgets || []}
              onDelete={handleDeleteBudget}
              loading={deleteBudget.isLoading}
              emptyState={
                <EmptyState
                  title="No budgets set"
                  description="Create budgets to track your spending"
                  icon={<FunnelIcon className="h-10 w-10 mx-auto text-gray-400" />}
                  action={
                    <Button onClick={() => setShowForm(true)}>
                      <PlusIcon className="h-5 w-5 mr-2" />
                      Create Budget
                    </Button>
                  }
                />
              }
            />
          </div>

          <div className={`rounded-lg shadow p-6 ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Budget vs Actual
              </h3>
              <Button
                variant="text"
                size="sm"
                onClick={handleRefresh}
                disabled={loading}
              >
                Refresh
              </Button>
            </div>

            <BudgetComparisonChart
              data={stats?.comparison || []}
              emptyState={
                <EmptyState
                  title="No comparison data"
                  description="Set up budgets to see spending comparison"
                  icon={<ChartBarIcon className="h-10 w-10 mx-auto text-gray-400" />}
                />
              }
            />
          </div>
        </motion.div>
      )}
    </div>
  );
}