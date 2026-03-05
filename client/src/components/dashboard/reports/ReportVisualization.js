import PropTypes from 'prop-types';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import { getVisualizationConfig } from './visualizationConfig';

Chart.register(...registerables);

export default function ReportVisualization({ data, reportType, dateRange }) {
  const config = getVisualizationConfig(reportType, data, dateRange);

  if (!config) {
    return null;
  }

  const ChartComponent = {
    bar: Bar,
    pie: Pie,
    line: Line
  }[config.chartType];

  return (
    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        {config.title}
      </h3>
      <div className="h-96">
        <ChartComponent 
          data={config.data} 
          options={config.options} 
        />
      </div>
      {config.footer && (
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 text-center">
          {config.footer}
        </p>
      )}
    </div>
  );
}

ReportVisualization.propTypes = {
  data: PropTypes.object.isRequired,
  reportType: PropTypes.string.isRequired,
  dateRange: PropTypes.shape({
    startDate: PropTypes.instanceOf(Date),
    endDate: PropTypes.instanceOf(Date)
  }).isRequired
};