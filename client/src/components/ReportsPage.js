import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import '../index.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ReportsPage = () => {
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const fetchData = useCallback(async () => {
    if (!user?.token) {
      setError('No authentication token found. Please log in again.');
      setLoading(false);
      return;
    }

    try {
      const [expensesRes, incomesRes] = await Promise.all([
        fetch('http://localhost:5000/api/expenses', {
          headers: { 'Authorization': `Bearer ${user?.token}` }
        }),
        fetch('http://localhost:5000/api/incomes', {
          headers: { 'Authorization': `Bearer ${user?.token}` }
        })
      ]);

      const expensesData = await expensesRes.json();
      const incomesData = await incomesRes.json();

      if (!expensesRes.ok || !incomesRes.ok) {
        throw new Error('Failed to fetch data');
      }

      setExpenses(expensesData);
      setIncomes(incomesData);
      prepareChartData(expensesData, incomesData);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, [user?.token]);

  const prepareChartData = (expenses, incomes) => {
    // Group by month-year
    const monthlyData = {};

    const addToMonthly = (items, key) => {
      items.forEach(item => {
        const date = new Date(item.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { expenses: 0, incomes: 0 };
        }
        monthlyData[monthKey][key] += parseFloat(item.amount);
      });
    };

    addToMonthly(expenses, 'expenses');
    addToMonthly(incomes, 'incomes');

    const labels = Object.keys(monthlyData).sort();
    const expenseValues = labels.map(label => monthlyData[label].expenses);
    const incomeValues = labels.map(label => monthlyData[label].incomes);

    setChartData({
      labels,
      datasets: [
        {
          label: 'Expenses',
          data: expenseValues,
          backgroundColor: '#FF6384',
          borderColor: '#FF6384',
          borderWidth: 1,
        },
        {
          label: 'Income',
          data: incomeValues,
          backgroundColor: '#36A2EB',
          borderColor: '#36A2EB',
          borderWidth: 1,
        },
      ],
    });
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, fetchData]);

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
          <h1>Financial Reports</h1>
        </div>

        {error && (
          <div className="alert alert-danger">{error}</div>
        )}

        <div className="card">
          <h2 className="mb-3">Monthly Trends</h2>
          <div className="chart-container" style={{ height: '500px' }}>
            {chartData ? (
              <Bar
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                    title: {
                      display: true,
                      text: 'Monthly Income vs Expenses',
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Amount ($)',
                      },
                    },
                  },
                }}
              />
            ) : (
              <p>No data to display</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
