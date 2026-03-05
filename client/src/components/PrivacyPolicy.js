import React from 'react';
import { Link } from 'react-router-dom';
import '../index.css';

const PrivacyPolicy = () => {
  return (
    <div className="fade-in">
      <div className="container">
        <div className="dashboard-header">
          <h1>Privacy Policy</h1>
          <p>How we collect, use, and protect your personal information</p>
        </div>

        <div className="card">
          <div className="privacy-content">
            <h2>1. Information We Collect</h2>
            <p>We collect information you provide directly to us, such as when you create an account, add expenses, or contact us for support.</p>

            <h2>2. How We Use Your Information</h2>
            <p>Your information is used solely to provide and improve our expense tracking service. We may use your email for account-related communications and important updates.</p>

            <h2>3. Information Sharing</h2>
            <p>We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as required by law.</p>

            <h2>4. Data Security</h2>
            <p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>

            <h2>5. Data Retention</h2>
            <p>We retain your personal information for as long as your account is active or as needed to provide our services. You can delete your account at any time.</p>

            <h2>6. Your Rights</h2>
            <p>You have the right to access, update, or delete your personal information. You can export your data or delete your account through the Settings page.</p>

            <h2>7. Cookies</h2>
            <p>We use cookies to enhance your experience and provide secure authentication. You can control cookie settings through your browser.</p>

            <h2>8. Changes to This Policy</h2>
            <p>We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page.</p>

            <h2>9. Contact Us</h2>
            <p>If you have questions about this privacy policy, please contact us at privacy@expensetrackerpro.com.</p>

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

export default PrivacyPolicy;
