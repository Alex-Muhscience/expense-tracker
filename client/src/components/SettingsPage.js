import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { saveAs } from 'file-saver';
import '../index.css';

const SettingsPage = () => {
  const [profile, setProfile] = useState({ email: '' });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setProfile({ email: user.email || 'user@example.com' });
    }
  }, [user]);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/user/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to change password');
      }

      setSuccess('Password changed successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const exportExpenses = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/export-expenses', {
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to export expenses');
      }

      const blob = await response.blob();
      saveAs(blob, 'expenses.csv');
      setSuccess('Expenses exported successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const exportIncomes = async () => {
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

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone and will delete all your data.')) {
      return;
    }

    if (!window.confirm('This is your final confirmation. All your expenses, incomes, and recurring transactions will be permanently deleted. Proceed?')) {
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/user/delete', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete account');
      }

      logout();
      navigate('/login');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="fade-in">
      <div className="container">
        <div className="dashboard-header">
          <h1>Settings</h1>
          <p>Manage your account and data</p>
        </div>

        {error && (
          <div className="alert alert-danger analytics-alert">
            <span className="alert-icon">⚠️</span>
            {error}
          </div>
        )}
        {success && (
          <div className="alert alert-success analytics-alert">
            <span className="alert-icon">✅</span>
            {success}
          </div>
        )}

        <div className="row">
          <div className="col-md-6">
            <div className="card">
              <h2 className="mb-3">Profile Information</h2>
              <div className="mb-3">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-control"
                  value={profile.email}
                  readOnly
                />
                <small className="form-text text-muted">Email cannot be changed</small>
              </div>
              <div className="mb-3">
                <label className="form-label">Account Status</label>
                <input
                  type="text"
                  className="form-control"
                  value="Active"
                  readOnly
                />
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card">
              <h2 className="mb-3">Change Password</h2>
              <form onSubmit={handlePasswordSubmit}>
                <div className="mb-3">
                  <label htmlFor="currentPassword" className="form-label">
                    Current Password
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    className="form-control"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="newPassword" className="form-label">
                    New Password
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    className="form-control"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                    minLength="6"
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="confirmPassword" className="form-label">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    className="form-control"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                    minLength="6"
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? 'Changing...' : 'Change Password'}
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="row mt-4">
          <div className="col-md-6">
            <div className="card">
              <h2 className="mb-3">Data Export</h2>
              <p className="mb-3">Download your financial data as CSV files</p>
              <div className="d-flex gap-2 flex-wrap">
                <button onClick={exportExpenses} className="btn btn-outline-primary">
                  📊 Export Expenses
                </button>
                <button onClick={exportIncomes} className="btn btn-outline-primary">
                  💰 Export Incomes
                </button>
              </div>
              <small className="form-text text-muted mt-2">
                Your data will be downloaded as CSV files for backup or analysis
              </small>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card">
              <h2 className="mb-3">Account Management</h2>
              <p className="mb-3">Manage your account settings</p>
              <div className="d-flex gap-2 flex-column">
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to logout?')) {
                      logout();
                      navigate('/login');
                    }
                  }}
                  className="btn btn-secondary"
                >
                  🚪 Logout
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="btn btn-danger"
                >
                  🗑️ Delete Account
                </button>
              </div>
              <small className="form-text text-muted mt-2">
                Deleting your account will permanently remove all your data
              </small>
            </div>
          </div>
        </div>

        <div className="card mt-4">
          <h2 className="mb-3">App Information</h2>
          <div className="row">
            <div className="col-md-6">
              <p><strong>Version:</strong> 1.0.0</p>
              <p><strong>Last Updated:</strong> {new Date().toLocaleDateString()}</p>
            </div>
            <div className="col-md-6">
              <p><strong>Features:</strong></p>
              <ul>
                <li>Expense & Income Tracking</li>
                <li>Budget Management</li>
                <li>Recurring Transactions</li>
                <li>Financial Reports</li>
                <li>Data Export</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
