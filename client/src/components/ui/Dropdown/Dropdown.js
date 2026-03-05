import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { ChevronDownIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../../../context/ThemeContext';

export default function Dropdown({
  options,
  selected,
  onSelect,
  placeholder = 'Select an option',
  buttonClassName = '',
  menuClassName = '',
  disabled = false,
}) {
  const { isDarkMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedOption = options.find(option => option.id === selected) || { name: placeholder };

  const handleSelect = (option) => {
    onSelect(option.id);
    setIsOpen(false);
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        className={`flex items-center justify-between w-full px-4 py-2 text-left border rounded-md shadow-sm transition-colors ${
          isDarkMode
            ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
        } ${buttonClassName} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="truncate">{selectedOption.name}</span>
        <ChevronDownIcon
          className={`h-5 w-5 ml-2 transition-transform ${
            isOpen ? 'transform rotate-180' : ''
          }`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <ul
          className={`absolute z-10 mt-1 w-full max-h-60 overflow-auto rounded-md shadow-lg ring-1 ring-opacity-5 focus:outline-none ${
            isDarkMode
              ? 'bg-gray-700 ring-gray-600'
              : 'bg-white ring-gray-300'
          } ${menuClassName}`}
          role="listbox"
          tabIndex={-1}
        >
          {options.map((option) => (
            <li
              key={option.id}
              className={`px-4 py-2 text-sm cursor-pointer flex items-center justify-between transition-colors ${
                isDarkMode
                  ? 'hover:bg-gray-600 text-gray-300'
                  : 'hover:bg-gray-100 text-gray-700'
              } ${selected === option.id ? (isDarkMode ? 'bg-gray-600' : 'bg-gray-100') : ''}`}
              onClick={() => handleSelect(option)}
              role="option"
              aria-selected={selected === option.id}
            >
              <span className="truncate">{option.name}</span>
              {selected === option.id && (
                <CheckIcon className="h-4 w-4 ml-2 text-blue-500" />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

Dropdown.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
    })
  ).isRequired,
  selected: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onSelect: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  buttonClassName: PropTypes.string,
  menuClassName: PropTypes.string,
  disabled: PropTypes.bool,
};

Dropdown.defaultProps = {
  placeholder: 'Select an option',
  buttonClassName: '',
  menuClassName: '',
  disabled: false,
};