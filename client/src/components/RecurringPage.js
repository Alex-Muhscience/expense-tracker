import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import '../index.css';

const RecurringPage = () => {
  const [recurrings, setRecurrings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [categories, setCategories] = useState([]);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const { user } = useAuth();

  const fetchRecurrings = useCallback(async () => {
    if (!user?.token) {
      setError('No authentication token found. Please log in again.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/recurring', {
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error('Failed to fetch recurring transactions');
      }

      setRecurrings(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, [user?.token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    if (!user?.token) {
      setError('No authentication token found. Please log in again.');
      return;
    }

    try {
      const url = editingId
        ? `http://localhost:5000/api/recurring/${editingId}`
        : 'http://localhost:5000/api/recurring';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`Failed to ${editingId ? 'update' : 'add'} recurring transaction`);
      }

      setSuccess(`Recurring transaction ${editingId ? 'updated' : 'added'} successfully!`);
      setIsAdding(false);
      setEditingId(null);
      fetchRecurrings();
      e.target.reset();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (recurring) => {
    setEditingId(recurring.id);
    setIsAdding(true);
    // The form will be populated via refs or state
  };

  const handleDelete = async (recurringId) => {
    if (!user?.token) {
      setError('No authentication token found. Please log in again.');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this recurring transaction?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/recurring/${recurringId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete recurring transaction');
      }

      setSuccess('Recurring transaction deleted successfully!');
      fetchRecurrings();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
  };

  useEffect(() => {
    if (user) {
      fetchRecurrings();
      fetchCategories();
    }
  }, [user, fetchRecurrings]);

  const fetchCategories = async () => {
    if (!user?.token) return;

    try {
      const response = await fetch('http://localhost:5000/api/categories', {
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const addCategory = async () => {
    if (!newCategory.trim()) return;

    try {
      const response = await fetch('http://localhost:5000/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({ name: newCategory.trim() })
      });

      if (response.ok) {
        await fetchCategories();
        setNewCategory('');
        setIsAddingCategory(false);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to add category');
      }
    } catch (err) {
      setError('Failed to add category');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="container">
        <div className="dashboard-header">
          <h1>Recurring Transactions</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setIsAdding(!isAdding)}
              className="btn btn-primary"
            >
              {isAdding ? 'Cancel' : 'Add Recurring'}
            </button>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger">{error}</div>
        )}
        {success && (
          <div className="alert alert-success">{success}</div>
        )}

        {isAdding && (
          <div className="card mb-4">
            <h2 className="mb-3">{editingId ? 'Edit' : 'Add'} Recurring Transaction</h2>
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6">
                  <div className="form-group">
                    <label htmlFor="name" className="form-label">Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className="form-control"
                      required
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <label htmlFor="amount" className="form-label">Amount</label>
                    <input
                      type="number"
                      id="amount"
                      name="amount"
                      step="0.01"
                      min="0"
                      className="form-control"
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-md-6">
                  <div className="form-group">
                    <label htmlFor="category" className="form-label">Category</label>
                    <div className="d-flex gap-2">
                      <select id="category" name="category" className="form-control" required>
                        <option value="">Select Category</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.name}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setIsAddingCategory(!isAddingCategory)}
                      >
                        +
                      </button>
                    </div>
                    {isAddingCategory && (
                      <div className="mt-2 d-flex gap-2">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="New category name"
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addCategory();
                            }
                          }}
                        />
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={addCategory}
                        >
                          Add
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => setIsAddingCategory(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <label htmlFor="frequency" className="form-label">Frequency</label>
                    <select id="frequency" name="frequency" className="form-control" required>
                      <option value="">Select Frequency</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="start_date" className="form-label">Start Date</label>
                <input
                  type="date"
                  id="start_date"
                  name="start_date"
                  className="form-control"
                  required
                />
              </div>
              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-primary">
                  {editingId ? 'Update' : 'Add'} Recurring
                </button>
                <button type="button" onClick={handleCancel} className="btn btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="card">
          <h2 className="mb-3">Your Recurring Transactions</h2>
          {recurrings.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Amount</th>
                    <th>Category</th>
                    <th>Frequency</th>
                    <th>Start Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recurrings.map(recurring => (
                    <tr key={recurring.id}>
                      <td>{recurring.name}</td>
                      <td>${parseFloat(recurring.amount).toFixed(2)}</td>
                      <td className="text-capitalize">{recurring.category}</td>
                      <td className="text-capitalize">{recurring.frequency}</td>
                      <td>{new Date(recurring.start_date).toLocaleDateString()}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <button
                            onClick={() => handleEdit(recurring)}
                            className="btn btn-outline-primary btn-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(recurring.id)}
                            className="btn btn-danger btn-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No recurring transactions found. Add your first recurring bill or subscription above!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecurringPage;
