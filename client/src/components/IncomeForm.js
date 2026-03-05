import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import '../index.css';

const IncomeForm = ({ onIncomeAdded }) => {
  const [formData, setFormData] = useState({
    source: '',
    amount: '',
    date: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.source || !formData.amount || !formData.date) {
      setError('All fields are required');
      return false;
    }

    if (parseFloat(formData.amount) <= 0) {
      setError('Amount must be greater than 0');
      return false;
    }

    if (!formData.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      setError('Please enter a valid date in YYYY-MM-DD format');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:5000/api/incomes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({
          source: formData.source,
          amount: parseFloat(formData.amount),
          date: formData.date
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.msg || 'Failed to add income');
      }

      // Reset form on success
      setFormData({
        source: '',
        amount: '',
        date: ''
      });

      setSuccess('Income added successfully!');
      if (onIncomeAdded) onIncomeAdded();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);

    } catch (err) {
      setError(err.message);
      console.error('Income submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card">
      <h2 className="mb-3 text-center">Add New Income</h2>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success" role="alert">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group mb-3">
          <label htmlFor="source" className="form-label">
            Source
          </label>
          <input
            type="text"
            id="source"
            name="source"
            className="form-control"
            value={formData.source}
            onChange={handleChange}
            placeholder="e.g., Salary, Freelance"
            required
          />
        </div>

        <div className="form-group mb-3">
          <label htmlFor="amount" className="form-label">
            Amount ($)
          </label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            id="amount"
            name="amount"
            className="form-control"
            value={formData.amount}
            onChange={handleChange}
            placeholder="0.00"
            required
          />
        </div>

        <div className="form-group mb-4">
          <label htmlFor="date" className="form-label">
            Date
          </label>
          <input
            type="date"
            id="date"
            name="date"
            className="form-control"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary w-100"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Adding...
            </>
          ) : 'Add Income'}
        </button>
      </form>
    </div>
  );
};

export default IncomeForm;
