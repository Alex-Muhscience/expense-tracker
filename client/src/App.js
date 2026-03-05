import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import IncomePage from './components/IncomePage';
import ReportsPage from './components/ReportsPage';
import RecurringPage from './components/RecurringPage';
import SettingsPage from './components/SettingsPage';
import HelpCenter from './components/HelpCenter';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import ContactUs from './components/ContactUs';
import Navbar from './components/Navbar';
import './index.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app-container">
          <Navbar />
          <main className="main-content">
            <div className="container-fluid">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/income"
                  element={
                    <ProtectedRoute>
                      <IncomePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/reports"
                  element={
                    <ProtectedRoute>
                      <ReportsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/recurring"
                  element={
                    <ProtectedRoute>
                      <RecurringPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <SettingsPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="/help-center" element={<HelpCenter />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms-of-service" element={<TermsOfService />} />
                <Route path="/contact-us" element={<ContactUs />} />
                <Route path="/" element={<Login />} />
              </Routes>
            </div>
          </main>
          <footer className="app-footer">
            <div className="footer-content">
              <div className="footer-section">
                <h4>Expense Tracker Pro</h4>
                <p>Your comprehensive financial management solution</p>
                <div className="footer-links">
                  <Link to="/dashboard">Dashboard</Link>
                  <Link to="/income">Income</Link>
                  <Link to="/reports">Reports</Link>
                  <Link to="/settings">Settings</Link>
                </div>
              </div>
              <div className="footer-section">
                <h5>Features</h5>
                <ul>
                  <li>Real-time Analytics</li>
                  <li>Budget Tracking</li>
                  <li>Expense Management</li>
                  <li>Financial Reports</li>
                </ul>
              </div>
              <div className="footer-section">
                <h5>Support</h5>
                <ul>
                  <li><Link to="/help-center">Help Center</Link></li>
                  <li><Link to="/privacy-policy">Privacy Policy</Link></li>
                  <li><Link to="/terms-of-service">Terms of Service</Link></li>
                  <li><Link to="/contact-us">Contact Us</Link></li>
                </ul>
              </div>
              <div className="footer-section">
                <h5>Connect</h5>
                <div className="social-links">
                  <span>📧</span>
                  <span>📱</span>
                  <span>💼</span>
                  <span>🌐</span>
                </div>
                <p>&copy; {new Date().getFullYear()} Expense Tracker Pro. All rights reserved.</p>
              </div>
            </div>
          </footer>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;