import { useTheme } from '../../../context/ThemeContext';

export default function Toggle({ enabled, onChange, label, description }) {
  const { isDarkMode } = useTheme();

  return (
    <div className="flex items-start">
      <div className="flex items-center h-5">
        <button
          type="button"
          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${enabled ? 'bg-blue-600' : 'bg-gray-200'}`}
          onClick={() => onChange(!enabled)}
          aria-pressed={enabled}
        >
          <span
            aria-hidden="true"
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${enabled ? 'translate-x-5' : 'translate-x-0'}`}
          />
        </button>
      </div>
      <div className="ml-3">
        {label && (
          <label
            className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} cursor-pointer`}
            onClick={() => onChange(!enabled)}
          >
            {label}
          </label>
        )}
        {description && (
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {description}
          </p>
        )}
      </div>
    </div>
  );
}