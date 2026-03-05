import { useState } from 'react';
import { formatCurrency, formatDate } from '../../../utils/formatters';
import Button from '../../../components/ui/Button/Button';
import ExpenseForm from './ExpenseForm';
import Modal from '../../../components/ui/Modal/Modal';
import EmptyState from '../../../components/shared/EmptyState/EmptyState';
import LoadingSpinner from '../../../components/shared/Loading/LoadingSpinner';
import { ArrowDownIcon, ArrowUpIcon, FunnelIcon, XCircleIcon } from "@heroicons/react/24/outline";

function ExpenseList({ expenses, loading, error, onAdd, onDelete, onExport }) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [filter, setFilter] = useState('');

  const sortedExpenses = [...expenses].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const filteredExpenses = filter
    ? sortedExpenses.filter(exp => exp.category.toLowerCase().includes(filter.toLowerCase()))
    : sortedExpenses;

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleAddExpense = async (expense) => {
    await onAdd(expense);
    setIsFormOpen(false);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500">{error}</div>;
  if (expenses.length === 0) {
    return (
      <EmptyState
        title="No expenses yet"
        description="Add your first expense to get started"
        actionText="Add Expense"
        onAction={() => setIsFormOpen(true)}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <FunnelIcon className="w-5 h-5 text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by category..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
            />
            {filter && (
              <button
                onClick={() => setFilter('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <XCircleIcon className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="secondary" onClick={() => onExport()}>
            Export CSV
          </Button>
          <Button onClick={() => setIsFormOpen(true)}>
            Add Expense
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort('description')}
              >
                <div className="flex items-center">
                  Description
                  {sortConfig.key === 'description' && (
                    sortConfig.direction === 'asc' ?
                      <ArrowUpIcon className="ml-1 w-3 h-3" /> :
                      <ArrowDownIcon className="ml-1 w-3 h-3" />
                  )}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort('category')}
              >
                <div className="flex items-center">
                  Category
                  {sortConfig.key === 'category' && (
                    sortConfig.direction === 'asc' ?
                      <ArrowUpIcon className="ml-1 w-3 h-3" /> :
                      <ArrowDownIcon className="ml-1 w-3 h-3" />
                  )}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort('amount')}
              >
                <div className="flex items-center">
                  Amount
                  {sortConfig.key === 'amount' && (
                    sortConfig.direction === 'asc' ?
                      <ArrowUpIcon className="ml-1 w-3 h-3" /> :
                      <ArrowDownIcon className="ml-1 w-3 h-3" />
                  )}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort('date')}
              >
                <div className="flex items-center">
                  Date
                  {sortConfig.key === 'date' && (
                    sortConfig.direction === 'asc' ?
                      <ArrowUpIcon className="ml-1 w-3 h-3" /> :
                      <ArrowDownIcon className="ml-1 w-3 h-3" />
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredExpenses.map((expense) => (
              <tr key={expense.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {expense.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {expense.category}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {formatCurrency(expense.amount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {formatDate(expense.date)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => onDelete(expense.id)}
                    className="text-red-600 hover:text-red-900 dark:hover:text-red-400"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title="Add New Expense">
        <ExpenseForm onSubmit={handleAddExpense} onCancel={() => setIsFormOpen(false)} />
      </Modal>
    </div>
  );
}

export default ExpenseList;