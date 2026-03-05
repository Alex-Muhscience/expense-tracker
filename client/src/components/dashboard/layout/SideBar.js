import { NavLink } from 'react-router-dom';
import { HomeIcon, ChartBarIcon, CreditCardIcon, DocumentTextIcon, CogIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../../../context/ThemeContext';

export default function SideBar() {
  const { isDarkMode, toggleTheme } = useTheme();

  const navItems = [
    { name: 'Dashboard', icon: HomeIcon, path: '/dashboard' },
    { name: 'Expenses', icon: CreditCardIcon, path: '/expenses' },
    { name: 'Budget', icon: ChartBarIcon, path: '/budget' },
    { name: 'Reports', icon: DocumentTextIcon, path: '/reports' },
  ];

  return (
    <div className={`w-64 flex-shrink-0 border-r ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
      <div className="flex flex-col h-full p-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>ExpenseTracker</h1>
        </div>
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => `
                flex items-center px-4 py-3 rounded-lg transition-colors
                ${isActive 
                  ? isDarkMode 
                    ? 'bg-blue-900 text-white' 
                    : 'bg-blue-100 text-blue-800'
                  : isDarkMode
                    ? 'text-gray-300 hover:bg-gray-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }
              `}
            >
              <item.icon className="w-5 h-5 mr-3" />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={toggleTheme}
            className="flex items-center w-full px-4 py-3 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <CogIcon className="w-5 h-5 mr-3 text-gray-500 dark:text-gray-400" />
            <span className="text-gray-600 dark:text-gray-300">Toggle Theme</span>
          </button>
        </div>
      </div>
    </div>
  );
}