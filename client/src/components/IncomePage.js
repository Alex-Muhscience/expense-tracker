import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import IncomeForm from './IncomeForm';
import { saveAs } from 'file-saver';
import '../index.css';

const IncomePage = () => {
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { user } = useAuth();

  const fetchIncomes = useCallback(async () => {
    if (!user?.token) {
      setError('No authentication token found. Please log in again.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/incomes', {
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error('Failed to fetch incomes');
      }

      setIncomes(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, [user?.token]);

  const deleteIncome = async (incomeId) => {
    if (!user?.token) {
      setError('No authentication token found. Please log in again.');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this income?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/incomes/${incomeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete income');
      }

      setSuccess('Income deleted successfully!');
      fetchIncomes();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const exportToCSV = async () => {
    if (!user?.token) {
      setError('No authentication token found. Please log in again.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/export-incomes', {
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to export incomes');
      }

      const blob = await response.blob();
      saveAs(blob, 'incomes.csv');
      setSuccess('Incomes exported successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (user) {
      fetchIncomes();
    }
  }, [user, fetchIncomes]);

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
          <h1>Income Management</h1>
          <div className="flex gap-2">
            <button onClick={exportToCSV} className="btn btn-secondary">
              Export to CSV
            </button>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger">{error}</div>
        )}
        {success && (
          <div className="alert alert-success">{success}</div>
        )}

        <div className="dashboard-grid">
          <div>
            <IncomeForm onIncomeAdded={fetchIncomes} />
          </div>

          <div className="card">
            <h2 className="mb-3">Income List</h2>
            {incomes.length > 0 ? (
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Source</th>
                      <th>Amount</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {incomes.map(income => (
                      <tr key={income.id}>
                        <td className="text-capitalize">{income.source}</td>
                        <td>${parseFloat(income.amount).toFixed(2)}</td>
                        <td>{new Date(income.date).toLocaleDateString()}</td>
                        <td>
                          <button
                            onClick={() => deleteIncome(income.id)}
                            className="btn btn-danger btn-sm"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No incomes found. Add your first income above!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncomePage;
