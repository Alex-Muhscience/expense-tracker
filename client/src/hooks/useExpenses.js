import { useState, useEffect } from 'react';
import expenseService from '../services/expenseService';
import { useQuery } from 'react-query';
import api from '../services/api';
import { useAuth } from '../context/AuthContext'; // Updated an import path

export function useDashboardStats() {
  const { data, isLoading, error, refetch } = useQuery(
    'dashboardStats',
    async () => {
      const { data } = await api.get('/dashboard/stats');
      return data;
    }
  );

  return {
    stats: data || {},
    loading: isLoading,
    error,
    refresh: refetch,
  };
}

export const useExpenses = () => {
  const { token } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchExpenses = async (params = {}) => {
    setLoading(true);
    try {
      const data = await expenseService.getExpenses(params);
      setExpenses(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch expenses');
    } finally {
      setLoading(false);
    }
  };

  const addExpense = async (expense) => {
    try {
      const newExpense = await expenseService.addExpense(expense);
      setExpenses(prev => [...prev, newExpense]);
      return newExpense;
    } catch (err) {
      throw err;
    }
  };

  const updateExpense = async (id, expenseData) => {
    try {
      const updatedExpense = await expenseService.updateExpense(id, expenseData);
      setExpenses(prev =>
        prev.map(exp => exp.id === id ? updatedExpense : exp)
      );
      return updatedExpense;
    } catch (err) {
      throw err;
    }
  };

  const deleteExpense = async (id) => {
    try {
      await expenseService.deleteExpense(id);
      setExpenses(prev => prev.filter(exp => exp.id !== id));
    } catch (err) {
      throw err;
    }
  };

  const exportExpenses = async (params = {}) => {
    try {
      return await expenseService.exportToCSV(params);
    } catch (err) {
      throw err;
    }
  };




  useEffect(() => {
    if (token) {
      fetchExpenses();
    }
  }, [token]);

  return {
    expenses,
    loading,
    error,
    addExpense,
    updateExpense,
    deleteExpense,
    exportExpenses,
    refresh: fetchExpenses,
  };
};

