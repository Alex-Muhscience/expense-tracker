import { useContext } from 'react';
import { NotificationContext } from '../context/NotificationContext';

/**
 * Custom hook for displaying notifications
 * @returns {{
 *   addNotification: (notification: {
 *     type?: 'success'|'error'|'warning'|'info',
 *     title: string,
 *     message?: string,
 *     duration?: number,
 *     action?: string,
 *     actionLabel?: string,
 *     onAction?: () => void,
 *     persistent?: boolean
 *   }) => void,
 *   removeNotification: (id: string) => void,
 *   notifications: Array<Notification>
 * }}
 */
export const useNotification = () => {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }

  /**
   * Enhanced addNotification with default values and validation
   * @param {Object} notification - Notification configuration
   */
  const addNotification = ({
    type = 'info',
    title,
    message = '',
    duration = 5000,
    action,
    actionLabel,
    onAction,
    persistent = false
  }) => {
    if (!title) {
      console.warn('Notification title is required');
      return;
    }

    context.addNotification({
      type: ['success', 'error', 'warning', 'info'].includes(type) ? type : 'info',
      title,
      message,
      duration: Math.max(1000, Math.min(duration, 15000)), // Clamp between 1-15 seconds
      action,
      actionLabel: actionLabel || action,
      onAction,
      persistent
    });
  };

  return {
    addNotification,
    removeNotification: context.removeNotification,
    notifications: context.notifications
  };
};