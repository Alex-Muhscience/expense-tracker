import {format} from "date-fns";

export function getVisualizationConfig(reportType, data, dateRange) {
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.formattedValue}`;
          }
        }
      }
    }
  };

  switch(reportType) {
    case 'category':
      return {
        chartType: 'pie',
        title: 'Spending by Category',
        data: {
          labels: data.labels,
          datasets: [{
            data: data.values,
            backgroundColor: [
              '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
              '#EC4899', '#14B8A6', '#F97316', '#64748B', '#A855F7'
            ],
            borderWidth: 1
          }]
        },
        options: commonOptions,
        footer: `From ${format(dateRange.startDate, 'MMM d, yyyy')} to ${format(dateRange.endDate, 'MMM d, yyyy')}`
      };
    case 'trends':
      return {
        chartType: 'line',
        title: 'Spending Trends',
        data: {
          labels: data.months,
          datasets: [{
            label: 'Total Spending',
            data: data.amounts,
            borderColor: '#3B82F6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.3,
            fill: true
          }]
        },
        options: {
          ...commonOptions,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: function(value) {
                  return '$' + value;
                }
              }
            }
          }
        }
      };
    case 'expenses':
      return {
        chartType: 'bar',
        title: 'Expense Distribution',
        data: {
          labels: data.labels,
          datasets: [{
            label: 'Amount',
            data: data.values,
            backgroundColor: '#3B82F6'
          }]
        },
        options: {
          ...commonOptions,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: function(value) {
                  return '$' + value;
                }
              }
            }
          }
        }
      };
    default:
      return null;
  }
}