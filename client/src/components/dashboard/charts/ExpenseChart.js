import { Bar } from 'react-chartjs-2';
import PropTypes from 'prop-types';
import EmptyState from '../../shared/EmptyState/EmptyState';
import { ChartBarIcon } from '@heroicons/react/24/outline';

export default function ExpenseChart({ data, emptyState }) {
  if (!data || data.length === 0) {
    return emptyState || (
      <EmptyState
        title="No data available"
        description="Add expenses to see chart"
        icon={<ChartBarIcon className="h-10 w-10 mx-auto text-gray-400" />}
      />
    );
  }

  const chartData = {
    labels: data.map(item => item.label),
    datasets: [
      {
        label: 'Spending',
        data: data.map(item => item.value),
        backgroundColor: '#3B82F6',
        borderRadius: 4,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="h-80">
      <Bar data={chartData} options={options} />
    </div>
  );
}

ExpenseChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      value: PropTypes.number,
    })
  ),
  emptyState: PropTypes.node,
};