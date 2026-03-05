import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../index.css';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, this would send the form data to a backend
    console.log('Contact form submitted:', formData);
    setSubmitted(true);
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: ''
    });
  };

  return (
    <div className="fade-in">
      <div className="container">
        <div className="dashboard-header">
          <h1>Contact Us</h1>
          <p>Get in touch with the Expense Tracker Pro team</p>
        </div>

        <div className="row">
          <div className="col-md-6">
            <div className="card">
              <h2>Send us a Message</h2>

              {submitted ? (
                <div className="alert alert-success">
                  <h4>Thank you!</h4>
                  <p>Your message has been sent successfully. We'll get back to you within 24 hours.</p>
                  <button
                    className="btn btn-primary"
                    onClick={() => setSubmitted(false)}
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className="form-control"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className="form-control"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="subject" className="form-label">Subject</label>
                    <select
                      id="subject"
                      name="subject"
                      className="form-control"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Subject</option>
                      <option value="general">General Inquiry</option>
                      <option value="support">Technical Support</option>
                      <option value="feedback">Feedback</option>
                      <option value="bug">Bug Report</option>
                      <option value="feature">Feature Request</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="message" className="form-label">Message</label>
                    <textarea
                      id="message"
                      name="message"
                      className="form-control"
                      rows="5"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell us how we can help you..."
                      required
                    ></textarea>
                  </div>

                  <button type="submit" className="btn btn-primary">
                    Send Message
                  </button>
                </form>
              )}
            </div>
          </div>

          <div className="col-md-6">
            <div className="card">
              <h3>Get in Touch</h3>
              <div className="contact-info">
                <div className="contact-item">
                  <span className="contact-icon">📧</span>
                  <div>
                    <strong>Email</strong><br />
                    support@expensetrackerpro.com
                  </div>
                </div>

                <div className="contact-item">
                  <span className="contact-icon">📱</span>
                  <div>
                    <strong>Phone</strong><br />
                    +1 (555) 123-4567
                  </div>
                </div>

                <div className="contact-item">
                  <span className="contact-icon">💼</span>
                  <div>
                    <strong>Business Hours</strong><br />
                    Monday - Friday: 9:00 AM - 6:00 PM EST
                  </div>
                </div>

                <div className="contact-item">
                  <span className="contact-icon">🌐</span>
                  <div>
                    <strong>Response Time</strong><br />
                    We typically respond within 24 hours
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <h3>Quick Links</h3>
              <ul>
                <li><Link to="/help-center">Help Center</Link></li>
                <li><Link to="/privacy-policy">Privacy Policy</Link></li>
                <li><Link to="/terms-of-service">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
