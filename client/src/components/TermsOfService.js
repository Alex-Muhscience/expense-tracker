import React from 'react';
import { Link } from 'react-router-dom';
import '../index.css';

const TermsOfService = () => {
  return (
    <div className="fade-in">
      <div className="container">
        <div className="dashboard-header">
          <h1>Terms of Service</h1>
          <p>Legal terms and conditions for using Expense Tracker Pro</p>
        </div>

        <div className="card">
          <div className="privacy-content">
            <h2>1. Acceptance of Terms</h2>
            <p>By accessing and using Expense Tracker Pro, you accept and agree to be bound by the terms and provision of this agreement.</p>

            <h2>2. Use License</h2>
            <p>Permission is granted to temporarily use Expense Tracker Pro for personal, non-commercial transitory viewing only.</p>

            <h2>3. User Accounts</h2>
            <p>You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.</p>

            <h2>4. Acceptable Use</h2>
            <p>You agree not to use the service for any unlawful purpose or to solicit others to perform unlawful acts.</p>

            <h2>5. Data Privacy</h2>
            <p>Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the service.</p>

            <h2>6. Service Availability</h2>
            <p>While we strive to provide continuous service, we do not guarantee that the service will be uninterrupted or error-free.</p>

            <h2>7. Limitation of Liability</h2>
            <p>In no event shall Expense Tracker Pro be liable for any damages arising out of the use or inability to use the service.</p>

            <h2>8. Termination</h2>
            <p>We may terminate or suspend your account immediately, without prior notice, for any reason.</p>

            <h2>9. Changes to Terms</h2>
            <p>We reserve the right to modify these terms at any time. Continued use of the service constitutes acceptance of the new terms.</p>

            <h2>10. Governing Law</h2>
            <p>These terms shall be interpreted and governed by the laws of the jurisdiction in which the service is provided.</p>

            <h2>11. Contact Information</h2>
            <p>If you have questions about these Terms of Service, please contact us at legal@expensetrackerpro.com.</p>

            <p><em>Last updated: {new Date().toLocaleDateString()}</em></p>
          </div>

          <div className="text-center mt-4">
            <Link to="/contact-us" className="btn btn-primary">Contact Us</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
