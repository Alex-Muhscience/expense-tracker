import PropTypes from 'prop-types';

export default function PasswordStrengthMeter({ password }) {
  const getStrength = (pwd) => {
    if (!pwd) return 0;
    
    let score = 0;
    // Length
    if (pwd.length > 10) score += 2;
    else if (pwd.length > 6) score += 1;
    
    // Complexity
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;
    
    return Math.min(5, score);
  };

  const strength = getStrength(password);
  const strengthText = [
    'Very Weak',
    'Weak',
    'Fair',
    'Good',
    'Strong',
    'Very Strong'
  ][strength];

  const colors = [
    'bg-red-500',
    'bg-orange-500',
    'bg-yellow-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-green-600'
  ];

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Password Strength: <span className="font-medium">{strengthText}</span>
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
        <div 
          className={`h-1.5 rounded-full ${colors[strength]}`}
          style={{ width: `${(strength / 5) * 100}%` }}
        ></div>
      </div>
      {password && strength < 3 && (
        <p className="mt-1 text-xs text-red-500 dark:text-red-400">
          Tip: Use uppercase, numbers, and special characters
        </p>
      )}
    </div>
  );
}

PasswordStrengthMeter.propTypes = {
  password: PropTypes.string
};