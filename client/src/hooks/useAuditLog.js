import { useContext } from 'react';
import axios from '../services/api';
import { AuthContext } from '../context/AuthContext';

export default function useAuditLog() {
  const { user } = useContext(AuthContext);

  const logAction = async (action, details) => {
    try {
      await axios.post('/api/audit/log', {
        action,
        details,
        userId: user?.id
      });
    } catch (error) {
      console.error('Failed to log action:', error);
    }
  };

  return { logAction };
}