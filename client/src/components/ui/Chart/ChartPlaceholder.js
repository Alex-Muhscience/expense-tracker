import PropTypes from 'prop-types';

export default function ChartPlaceholder({ title, icon }) {
  return (
    <div className="h-full flex flex-col items-center justify-center p-6 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
      {icon}
      <h4 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">{title}</h4>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Chart visualization will appear here
      </p>
    </div>
  );
}

ChartPlaceholder.propTypes = {
  title: PropTypes.string.isRequired,
  icon: PropTypes.node.isRequired,
};