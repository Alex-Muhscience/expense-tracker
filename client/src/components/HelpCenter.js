import React from 'react';
import '../index.css';

const HelpCenter = () => {
  return (
    <div className="fade-in">
      <div className="container">
        <div className="dashboard-header">
          <h1>Help Center</h1>
          <p>Get help with using Expense Tracker Pro</p>
        </div>

        <div className="row">
          <div className="col-md-8">
            <div className="card">
              <h2>Frequently Asked Questions</h2>

              <div className="faq-section">
                <h3>Getting Started</h3>
                <div className="faq-item">
                  <h4>How do I create an account?</h4>
                  <p>Click on "Register" in the navigation bar and fill out the registration form with your email and password.</p>
                </div>

                <div className="faq-item">
                  <h4>How do I add my first expense?</h4>
                  <p>Navigate to the Dashboard and use the "Add New Expense" form. Select a category, enter the amount, description, and date.</p>
                </div>
              </div>

              <div className="faq-section">
                <h3>Managing Expenses</h3>
                <div className="faq-item">
                  <h4>How do I categorize my expenses?</h4>
                  <p>You can select from existing categories or add custom categories using the "+" button next to the category dropdown.</p>
                </div>

                <div className="faq-item">
                  <h4>Can I edit or delete expenses?</h4>
                  <p>Yes, you can view your expenses in the Dashboard and use the table to manage your entries.</p>
                </div>
              </div>

              <div className="faq-section">
                <h3>Budgets and Goals</h3>
                <div className="faq-item">
                  <h4>How do I set a budget?</h4>
                  <p>In the Dashboard, scroll to the "Monthly Budgets" section and enter budget amounts for each category.</p>
                </div>

                <div className="faq-item">
                  <h4>What are recurring transactions?</h4>
                  <p>Recurring transactions are bills or subscriptions that occur regularly. Use the Recurring page to manage them.</p>
                </div>
              </div>

              <div className="faq-section">
                <h3>Data and Privacy</h3>
                <div className="faq-item">
                  <h4>How do I export my data?</h4>
                  <p>Go to Settings > Data Export and click the export buttons to download your expenses and incomes as CSV files.</p>
                </div>

                <div className="faq-item">
                  <h4>Is my data secure?</h4>
                  <p>Yes, all data is encrypted and stored securely. We use JWT authentication and follow industry security standards.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card">
              <h3>Contact Support</h3>
              <p>Need more help? Contact our support team:</p>
              <ul>
                <li>Email: support@expensetrackerpro.com</li>
                <li>Response time: Within 24 hours</li>
              </ul>
            </div>

            <div className="card">
              <h3>Quick Links</h3>
              <ul>
                <li><a href="/privacy-policy">Privacy Policy</a></li>
                <li><a href="/terms-of-service">Terms of Service</a></li>
                <li><a href="/contact-us">Contact Us</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;
