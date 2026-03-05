import { useEffect, useState } from 'react';
import { formatCurrency } from '../../../utils/formatters';
import Button from '../../../components/ui/Button/Button';
import BudgetForm from './BudgetForm';
import Modal from '../../../components/ui/Modal/Modal';
import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip);

function BudgetOverview({ expenses, loading }) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [budget, setBudget] = useState(() => {
    const savedBudget = localStorage.getItem('budget');
    return savedBudget ? JSON.parse(savedBudget) : 2000;
  });

  useEffect(() => {
    localStorage.setItem('budget', JSON.stringify(budget));
  }, [budget]);

  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const remainingBudget = budget - totalSpent;
  const percentageUsed = (totalSpent / budget) * 100;

  const categoryTotals = expenses.reduce((acc, expense) => {
    if (!acc[expense.category]) {
      acc[expense.category] = 0;
    }
    acc[expense.category] += expense.amount;
    return acc;
  }, {});

  const chartData = {
    labels: Object.keys(categoryTotals),
    datasets: [
      {
        data: Object.values(categoryTotals),
        backgroundColor: [
          '#3B82F6',
          '#10B981',
          '#F59E0B',
          '#EF4444',
          '#8B5CF6',
          '#EC4899',
          '#14B8A6',
          '#F97316',
        ],
        borderWidth: 0,
      },
    ],
  };

  const handleSaveBudget = (newBudget) => {
    setBudget(newBudget);
    setIsFormOpen(false);
  };

  if (loading) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Budget Overview</h2>
        <Button onClick={() => setIsFormOpen(true)}>Edit Budget</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 bg-white dark:bg-gray-700 rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Budget Progress</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {formatCurrency(totalSpent)} of {formatCurrency(budget)}
                </span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {percentageUsed.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-600">
                <div
                  className={`h-2.5 rounded-full ${
                    percentageUsed > 90 ? 'bg-red-500' : percentageUsed > 75 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(percentageUsed, 100)}%` }}
                ></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-300">Budget</p>
                <p className="text-xl font-semibold text-blue-600 dark:text-blue-200">
                  {formatCurrency(budget)}
                </p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-lg">
                <p className="text-sm text-green-800 dark:text-green-300">Remaining</p>
                <p className="text-xl font-semibold text-green-600 dark:text-green-200">
                  {formatCurrency(remainingBudget)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-2 bg-white dark:bg-gray-700 rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Spending by Category</h3>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/3">
              <Doughnut data={chartData} />
            </div>
            <div className="w-full md:w-2/3">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Percentage
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                    {Object.entries(categoryTotals).map(([category, amount]) => (
                      <tr key={category}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {category}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                          {formatCurrency(amount)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                          {((amount / totalSpent) * 100).toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title="Set Monthly Budget">
        <BudgetForm initialBudget={budget} onSubmit={handleSaveBudget} onCancel={() => setIsFormOpen(false)} />
      </Modal>
    </div>
  );
}

export default BudgetOverview;