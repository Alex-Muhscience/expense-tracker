import React from 'react';
import PropTypes from 'prop-types';

function BudgetSummary({ totalBudget, totalExpenses }) {
  const remainingBudget = totalBudget - totalExpenses;

  return (
    <div className="budget-summary">
      <h2>Budget Summary</h2>
      <div className="budget-summary__item">
        <span>Total Budget:</span>
        <span>${totalBudget.toLocaleString()}</span>
      </div>
      <div className="budget-summary__item">
        <span>Total Expenses:</span>
        <span>${totalExpenses.toLocaleString()}</span>
      </div>
      <div className="budget-summary__item budget-summary__item--remaining">
        <span>Remaining Budget:</span>
        <span>${remainingBudget.toLocaleString()}</span>
      </div>
    </div>
  );
}

BudgetSummary.propTypes = {
  totalBudget: PropTypes.number.isRequired,
  totalExpenses: PropTypes.number.isRequired,
};

export default BudgetSummary;
