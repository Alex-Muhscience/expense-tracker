import PropTypes from 'prop-types';
import ChartPlaceholder from '../../ui/Chart/ChartPlaceholder';
import { ChartBarIcon } from '@heroicons/react/24/outline';

export default function BudgetComparisonChart({ emptyState }) {
  // In a real implementation, you would fetch data and render a chart here
  return (
    <div className="h-64">
      {emptyState || (
        <ChartPlaceholder 
          title="Budget vs Actual"
          icon={<ChartBarIcon className="w-12 h-12 mx-auto text-gray-400" />}
        />
      )}
    </div>
  );
}

BudgetComparisonChart.propTypes = {
  emptyState: PropTypes.node,
};