import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Toast from '../components/shared/Toast/Toast';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const removeNotification = useCallback((id) => {
    setNotifications((currentNotifications) =>
      currentNotifications.filter((notification) => notification.id !== id)
    );
  }, []);

  const showNotification = useCallback(
    ({ type = 'info', message, duration = 5000 }) => {
      const id = uuidv4();

      setNotifications((currentNotifications) => [
        ...currentNotifications,
        { id, type, message }
      ]);

      setTimeout(() => {
        removeNotification(id);
      }, duration);
    },
    [removeNotification] // Added dependency here
  );

  const value = useMemo(() => ({
    showNotification,
    removeNotification
  }), [showNotification, removeNotification]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <Toast
            key={notification.id}
            type={notification.type}
            message={notification.message}
            onDismiss={() => removeNotification(notification.id)}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};