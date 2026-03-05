import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import ExpenseList from '../dashboard/expenses/ExpenseList';
import ExpenseForm from '../dashboard/expenses/ExpenseForm';
import Button from '../ui/Button/Button';
import {PlusIcon, ArrowPathIcon, ArrowDownTrayIcon} from '@heroicons/react/24/outline';
import { useTheme } from '../../context/ThemeContext';
import LoadingSpinner from '../../components/shared/Loading/LoadingSpinner';
import ErrorMessage from '../../components/shared/ErrorMessage/ErrorMessage';
import EmptyState from '../../components/shared/EmptyState/EmptyState';
import ExpenseFilters from '../dashboard/expenses/ExpenseFilters';
import Pagination from '../../components/ui/Pagination/Pagination';
import BulkActions from '../dashboard/expenses/BulkActions';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import {Dropdown} from "react-bootstrap";
import '../../index.css';

const EXPENSE_SORT_OPTIONS = [
  { value: 'date_desc', label: 'Date (Newest)', field: 'date', order: 'desc' },
  { value: 'date_asc', label: 'Date (Oldest)', field: 'date', order: 'asc' },
  { value: 'amount_desc', label: 'Amount (High)', field: 'amount', order: 'desc' },
  { value: 'amount_asc', label: 'Amount (Low)', field: 'amount', order: 'asc' },
];

export default function ExpensesPage() {
  const { isDarkMode } = useTheme();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [selectedExpenses, setSelectedExpenses] = useState([]);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState(EXPENSE_SORT_OPTIONS[0]);
  const [filters, setFilters] = useState({
    category: 'all',
    dateRange: {
      startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
      endDate: new Date(),
    },
    minAmount: '',
    maxAmount: '',
    search: '',
  });

  // Fetch expenses with pagination and filters
  const fetchExpenses = async ({ queryKey }) => {
    const [_, { page, filters, sort }] = queryKey;
    const params = {
      page,
      per_page: 10,
      sort_by: sort.field,
      sort_order: sort.order,
      ...(filters.category !== 'all' && { category: filters.category }),
      ...(filters.minAmount && { min_amount: filters.minAmount }),
      ...(filters.maxAmount && { max_amount: filters.maxAmount }),
      ...(filters.search && { search: filters.search }),
      start_date: format(filters.dateRange.startDate, 'yyyy-MM-dd'),
      end_date: format(filters.dateRange.endDate, 'yyyy-MM-dd'),
    };

    const response = await axios.get('/api/expenses', { params });
    return response.data;
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['expenses', { page, filters, sort }],
    queryFn: fetchExpenses,
    keepPreviousData: true,
  });

  // Bulk delete mutation
  const deleteExpenses = useMutation(
    (ids) => axios.delete('/api/expenses/bulk', { data: { ids } }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['expenses']);
        setSelectedExpenses([]);
      },
    }
  );

  // Export to CSV
  const handleExport = async () => {
    try {
      const response = await axios.get('/api/expenses/export', {
        params: {
          ...filters,
          start_date: format(filters.dateRange.startDate, 'yyyy-MM-dd'),
          end_date: format(filters.dateRange.endDate, 'yyyy-MM-dd'),
        },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `expenses_${format(new Date(), 'yyyyMMdd')}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page when filters change
  };

  const handleSortChange = (option) => {
    setSort(option);
    setPage(1); // Reset to first page when sort changes
  };

  const toggleSelectAll = () => {
    if (selectedExpenses.length === data?.items?.length) {
      setSelectedExpenses([]);
    } else {
      setSelectedExpenses(data?.items?.map(expense => expense.id) || []);
    }
  };

  const toggleSelectExpense = (id) => {
    setSelectedExpenses(prev =>
      prev.includes(id) ? prev.filter(expId => expId !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Expense Management</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {data?.total ? `${data.total} expenses found` : 'Loading expenses...'}
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={() => refetch()}
            disabled={isLoading}
            aria-label="Refresh expenses"
          >
            <ArrowPathIcon className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Button onClick={handleExport} variant="secondary">
            <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
            Export CSV
          </Button>
          <Button onClick={() => setShowForm(true)}>
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Expense
          </Button>
        </div>
      </div>

      <ExpenseFilters
        filters={filters}
        onChange={handleFilterChange}
        className="mb-6"
      />

      {selectedExpenses.length > 0 && (
        <BulkActions
          count={selectedExpenses.length}
          onDelete={() => deleteExpenses.mutate(selectedExpenses)}
          onCancel={() => setSelectedExpenses([])}
          loading={deleteExpenses.isLoading}
        />
      )}

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className={`rounded-lg shadow p-6 ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            <ExpenseForm
              onCancel={() => setShowForm(false)}
              onSuccess={() => {
                setShowForm(false);
                refetch();
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {error ? (
        <ErrorMessage
          message={error.message || "Failed to load expenses"}
          onRetry={refetch}
        />
      ) : isLoading && !data ? (
        <LoadingSpinner className="h-64" />
      ) : data?.items?.length === 0 ? (
        <EmptyState
          title="No expenses found"
          description={Object.values(filters).some(f => f !== 'all' && f !== '')
            ? "Try adjusting your filters"
            : "Add your first expense to get started"}
          icon={<PlusIcon className="h-10 w-10 mx-auto text-gray-400" />}
          action={
            <Button onClick={() => setShowForm(true)}>
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Expense
            </Button>
          }
        />
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <Dropdown
              options={EXPENSE_SORT_OPTIONS}
              selected={sort.value}
              onSelect={(value) =>
                handleSortChange(EXPENSE_SORT_OPTIONS.find(o => o.value === value))
              }
              buttonClassName="w-48"
            />
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Page {page} of {data?.total_pages}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className={`rounded-lg shadow overflow-hidden ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            <ExpenseList
              expenses={data?.items || []}
              selectedIds={selectedExpenses}
              onSelect={toggleSelectExpense}
              onSelectAll={toggleSelectAll}
              allSelected={selectedExpenses.length === data?.items?.length}
              onRefresh={refetch}
            />
          </motion.div>

          {data?.total_pages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={data.total_pages}
              onPageChange={setPage}
              className="mt-6"
            />
          )}
        </>
      )}
    </div>
  );
}