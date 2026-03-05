import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { saveAs } from 'file-saver';
import ExpenseForm from './ExpenseForm';
import '../index.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = () => {
  const [expenses, setExpenses] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [budgets, setBudgets] = useState({});
  const [spent, setSpent] = useState({});
  const [incomes, setIncomes] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [netSavings, setNetSavings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { user } = useAuth();

  const fetchExpenses = useCallback(async () => {
    if (!user?.token) {
      setError('No authentication token found. Please log in again.');
      setLoading(false);
      return;
    }

    console.log('Token:', user?.token); // Debug token
    try {
      const response = await fetch('http://localhost:5000/api/expenses', {
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });
      console.log('GET /api/expenses response status:', response.status); // Debug response

      const data = await response.json(); // Read body once
      console.log('GET /api/expenses response data:', data); // Debug response data

      if (!response.ok) {
        throw new Error(`Failed to fetch expenses: ${data.error || response.statusText}`);
      }

      setExpenses(data);
      prepareChartData(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, [user?.token]);

  const fetchBudgets = useCallback(async () => {
    if (!user?.token) return;

    try {
      const response = await fetch('http://localhost:5000/api/budgets', {
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error('Failed to fetch budgets');
      }

      // Convert array to object for easy access
      const budgetMap = {};
      data.forEach(budget => {
        budgetMap[budget.category] = budget.monthly_budget;
      });
      setBudgets(budgetMap);
    } catch (err) {
      console.error('Error fetching budgets:', err);
    }
  }, [user?.token]);

  const setBudget = async (category, amount) => {
    if (!user?.token) {
      setError('No authentication token found. Please log in again.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/budgets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({
          category,
          monthly_budget: parseFloat(amount)
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to set budget');
      }

      setSuccess('Budget updated successfully!');
      fetchBudgets(); // Refresh budgets
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchIncomes = useCallback(async () => {
    if (!user?.token) return;

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
      const totalInc = data.reduce((sum, income) => sum + parseFloat(income.amount), 0);
      setTotalIncome(totalInc);
    } catch (err) {
      console.error('Error fetching incomes:', err);
    }
  }, [user?.token]);

  const calculateTotals = (expenses, incomes) => {
    const totalExp = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
    const totalInc = incomes.reduce((sum, income) => sum + parseFloat(income.amount), 0);
    setTotalExpenses(totalExp);
    setNetSavings(totalInc - totalExp);
  };

  const prepareChartData = (expenses) => {
    const categories = {
      food: 0,
      transport: 0,
      entertainment: 0,
      other: 0
    };

    expenses.forEach(expense => {
      const category = categories.hasOwnProperty(expense.category)
        ? expense.category
        : 'other';
      categories[category] += parseFloat(expense.amount);
    });

    setSpent(categories);

    setChartData({
      labels: Object.keys(categories).map(cat => cat.charAt(0).toUpperCase() + cat.slice(1)),
      datasets: [{
        data: Object.values(categories),
        backgroundColor: [
          '#FF6384', // Food
          '#36A2EB', // Transport
          '#FFCE56', // Entertainment
          '#4BC0C0'  // Other
        ],
        hoverBackgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0'
        ]
      }]
    });
  };

  const exportToCSV = async () => {
    if (!user?.token) {
      setError('No authentication token found. Please log in again.');
      return;
    }

    console.log('Token for export:', user?.token); // Debug token
    try {
      const response = await fetch('http://localhost:5000/api/export', {
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });
      console.log('GET /api/export response status:', response.status); // Debug response

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

  const deleteExpense = async (expenseId) => {
    if (!user?.token) {
      setError('No authentication token found. Please log in again.');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this expense?')) {
      return;
    }

    console.log('Deleting expense:', expenseId);
    try {
      const response = await fetch(`http://localhost:5000/api/expenses/${expenseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete expense');
      }

      setSuccess('Expense deleted successfully!');
      fetchExpenses(); // Refresh the list
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (user) {
      fetchExpenses();
      fetchBudgets();
      fetchIncomes();
    }
  }, [user, fetchExpenses, fetchBudgets, fetchIncomes]);

  useEffect(() => {
    calculateTotals(expenses, incomes);
  }, [expenses, incomes]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="analytics-dashboard">
      {/* Professional Header */}
      <header className="analytics-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="dashboard-title">Financial Analytics Dashboard</h1>
            <p className="dashboard-subtitle">Real-time insights into your financial health</p>
          </div>
          <div className="header-right">
            <div className="header-stats">
              <div className="header-stat">
                <span className="stat-label">Last Updated</span>
                <span className="stat-value">{new Date().toLocaleDateString()}</span>
              </div>
              <div className="header-stat">
                <span className="stat-label">Data Points</span>
                <span className="stat-value">{expenses.length + incomes.length}</span>
              </div>
            </div>
            <button onClick={exportToCSV} className="btn btn-analytics">
              <span className="btn-icon">📊</span>
              Export Data
            </button>
          </div>
        </div>
      </header>

      {/* KPI Metrics Row */}
      <section className="kpi-section">
        <div className="kpi-grid">
          <div className="kpi-card income-kpi">
            <div className="kpi-icon">💰</div>
            <div className="kpi-content">
              <h3 className="kpi-value">${totalIncome.toFixed(2)}</h3>
              <p className="kpi-label">Total Income</p>
              <div className="kpi-change positive">
                <span className="change-icon">↗️</span>
                <span>+12.5%</span>
              </div>
            </div>
          </div>

          <div className="kpi-card expense-kpi">
            <div className="kpi-icon">💸</div>
            <div className="kpi-content">
              <h3 className="kpi-value">${totalExpenses.toFixed(2)}</h3>
              <p className="kpi-label">Total Expenses</p>
              <div className="kpi-change negative">
                <span className="change-icon">↘️</span>
                <span>-8.2%</span>
              </div>
            </div>
          </div>

          <div className="kpi-card savings-kpi">
            <div className="kpi-icon">{netSavings >= 0 ? '💾' : '📉'}</div>
            <div className="kpi-content">
              <h3 className="kpi-value">${netSavings.toFixed(2)}</h3>
              <p className="kpi-label">Net Savings</p>
              <div className={`kpi-change ${netSavings >= 0 ? 'positive' : 'negative'}`}>
                <span className="change-icon">{netSavings >= 0 ? '↗️' : '↘️'}</span>
                <span>{netSavings >= 0 ? '+15.3%' : '-5.7%'}</span>
              </div>
            </div>
          </div>

          <div className="kpi-card budget-kpi">
            <div className="kpi-icon">🎯</div>
            <div className="kpi-content">
              <h3 className="kpi-value">{Math.round((spent.food || 0) / (budgets.food || 1) * 100)}%</h3>
              <p className="kpi-label">Budget Utilization</p>
              <div className="kpi-change neutral">
                <span className="change-icon">📈</span>
                <span>This Month</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Analytics Content */}
      <main className="analytics-main">
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

        <div className="analytics-grid">
          {/* Primary Chart Widget */}
          <div className="analytics-widget chart-widget">
            <div className="widget-header">
              <h3 className="widget-title">Expense Breakdown</h3>
              <div className="widget-actions">
                <span className="widget-badge">Live Data</span>
              </div>
            </div>
            <div className="widget-content">
              <div className="chart-container-large">
                {chartData ? (
                  <Pie
                    data={chartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: {
                            padding: 20,
                            usePointStyle: true
                          }
                        },
                        tooltip: {
                          backgroundColor: 'rgba(0,0,0,0.8)',
                          titleColor: '#fff',
                          bodyColor: '#fff',
                          cornerRadius: 8
                        }
                      }
                    }}
                  />
                ) : (
                  <div className="chart-placeholder">
                    <span className="placeholder-icon">📊</span>
                    <p>No expense data available</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions Widget */}
          <div className="analytics-widget actions-widget">
            <div className="widget-header">
              <h3 className="widget-title">Quick Actions</h3>
            </div>
            <div className="widget-content">
              <ExpenseForm onExpenseAdded={fetchExpenses} />
            </div>
          </div>
        </div>

        {/* Secondary Analytics Row */}
        <div className="analytics-grid secondary-grid">
          {/* Budget Overview Widget */}
          <div className="analytics-widget budget-widget">
            <div className="widget-header">
              <h3 className="widget-title">Budget Overview</h3>
              <div className="widget-actions">
                <span className="widget-badge">Monthly</span>
              </div>
            </div>
            <div className="widget-content">
              <div className="budget-overview">
                {['food', 'transport', 'entertainment', 'other'].map(category => {
                  const spentAmount = spent[category] || 0;
                  const budgetAmount = budgets[category] || 0;
                  const percentage = budgetAmount > 0 ? (spentAmount / budgetAmount) * 100 : 0;
                  const isOverBudget = percentage > 100;

                  return (
                    <div key={category} className="budget-item">
                      <div className="budget-header">
                        <span className="budget-category text-capitalize">{category}</span>
                        <span className="budget-values">
                          ${spentAmount.toFixed(2)} / ${budgetAmount.toFixed(2)}
                        </span>
                      </div>
                      <div className="progress budget-progress">
                        <div
                          className={`progress-bar ${isOverBudget ? 'bg-danger' : 'bg-success'}`}
                          role="progressbar"
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                          aria-valuenow={percentage}
                          aria-valuemin="0"
                          aria-valuemax="100"
                        ></div>
                      </div>
                      <div className="budget-input-group">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          className="form-control budget-input"
                          placeholder="Set budget"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              const value = e.target.value;
                              if (value && parseFloat(value) > 0) {
                                setBudget(category, value);
                                e.target.value = '';
                              }
                            }
                          }}
                        />
                        <button
                          className="btn btn-outline-primary btn-sm budget-set-btn"
                          type="button"
                          onClick={(e) => {
                            const input = e.target.previousElementSibling;
                            const value = input.value;
                            if (value && parseFloat(value) > 0) {
                              setBudget(category, value);
                              input.value = '';
                            }
                          }}
                        >
                          Set
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Recent Transactions Widget */}
          <div className="analytics-widget transactions-widget">
            <div className="widget-header">
              <h3 className="widget-title">Recent Transactions</h3>
              <div className="widget-actions">
                <span className="widget-badge">{expenses.length} items</span>
              </div>
            </div>
            <div className="widget-content">
              <div className="transactions-list">
                {expenses.slice(0, 5).map(expense => (
                  <div key={expense.id} className="transaction-item">
                    <div className="transaction-icon">💳</div>
                    <div className="transaction-details">
                      <div className="transaction-category text-capitalize">{expense.category}</div>
                      <div className="transaction-date">{new Date(expense.date).toLocaleDateString()}</div>
                    </div>
                    <div className="transaction-amount">-${parseFloat(expense.amount).toFixed(2)}</div>
                  </div>
                ))}
                {expenses.length === 0 && (
                  <div className="no-transactions">
                    <span className="no-data-icon">📝</span>
                    <p>No transactions yet</p>
                    <small>Add your first expense above</small>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
