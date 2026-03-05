import PropTypes from 'prop-types';

const variants = {
  primary: 'bg-blue-600',
  danger: 'bg-red-600',
  success: 'bg-green-600',
};

export default function ProgressBar({ value, variant = 'primary', className = '' }) {
  const percentage = Math.min(100, Math.max(0, value));

  return (
    <div className={`h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden ${className}`}>
      <div
        className={`h-full ${variants[variant]}`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

ProgressBar.propTypes = {
  value: PropTypes.number.isRequired,
  variant: PropTypes.oneOf(['primary', 'danger', 'success']),
  className: PropTypes.string,
};