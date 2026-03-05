import api from './api';

const expenseService = {
  async getExpenses(params = {}) {
    try {
      return await api.get('/expenses', {params});
    } catch (error) {
      console.error('Error fetching expenses:', error);
      throw error;
    }
  },

  async getExpenseById(id) {
    try {
      return await api.get(`/expenses/${id}`);
    } catch (error) {
      console.error(`Error fetching expense ${id}:`, error);
      throw error;
    }
  },

  async addExpense(expenseData) {
    try {
      return await api.post('/expenses', expenseData);
    } catch (error) {
      console.error('Error adding expense:', error);
      throw error;
    }
  },

  async updateExpense(id, expenseData) {
    try {
      return await api.put(`/expenses/${id}`, expenseData);
    } catch (error) {
      console.error(`Error updating expense ${id}:`, error);
      throw error;
    }
  },

  async deleteExpense(id) {
    try {
      await api.delete(`/expenses/${id}`);
      return true;
    } catch (error) {
      console.error(`Error deleting expense ${id}:`, error);
      throw error;
    }
  },

  async getCategories() {
    try {
      return await api.get('/expenses/categories');
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  async exportExpenses(params = {}) {
    try {
      return await api.get('/expenses/export', {
        params,
        responseType: 'blob',
      });
    } catch (error) {
      console.error('Error exporting expenses:', error);
      throw error;
    }
  },
};

export default expenseService;