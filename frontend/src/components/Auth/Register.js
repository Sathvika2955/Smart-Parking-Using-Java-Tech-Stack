import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaUser, FaLock, FaEnvelope, FaPhone, FaIdCard, FaEye, FaEyeSlash, FaCar } from 'react-icons/fa';
import { authService } from '../../services/auth';
import Notification from '../Common/Notification';
import './Auth.css';

const Register = ({ onRegister }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phoneNumber: '',
    userType: 'CUSTOMER'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    if (!formData.username || !formData.email || !formData.password || !formData.fullName) {
      showNotification('Please fill in all required fields', 'error');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      showNotification('Passwords do not match', 'error');
      return false;
    }

    if (formData.password.length < 6) {
      showNotification('Password must be at least 6 characters', 'error');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showNotification('Please enter a valid email address', 'error');
      return false;
    }

    if (formData.phoneNumber && !/^[0-9]{10}$/.test(formData.phoneNumber)) {
      showNotification('Please enter a valid 10-digit phone number', 'error');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await authService.register(formData);
      
      if (response.success) {
        showNotification('Registration successful!', 'success');
        setTimeout(() => {
          onRegister(response.user);
        }, 1000);
      } else {
        showNotification(response.message, 'error');
      }
    } catch (error) {
      showNotification('Registration failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="auth-container">
      {notification && (
        <Notification 
          message={notification.message} 
          type={notification.type} 
          onClose={() => setNotification(null)} 
        />
      )}

      <div className="auth-wrapper register-wrapper">
        <div className="auth-left">
          <div className="auth-left-content">
            <FaCar className="auth-logo-icon" />
            <h1>Join Smart Parking</h1>
            <p>Create an account to get started</p>
            <div className="auth-features">
              <div className="feature-item">
                <span className="feature-icon">✓</span>
                <span>Easy vehicle management</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">✓</span>
                <span>Quick slot booking</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">✓</span>
                <span>Secure transactions</span>
              </div>
            </div>
          </div>
        </div>

        <div className="auth-right">
          <div className="auth-form-container register-form-container">
            <div className="auth-header">
              <h2>Create Account</h2>
              <p>Fill in the details to register</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    <FaIdCard /> Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    className="form-input"
                    placeholder="Enter full name"
                    value={formData.fullName}
                    onChange={handleChange}
                    autoFocus
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <FaUser /> Username *
                  </label>
                  <input
                    type="text"
                    name="username"
                    className="form-input"
                    placeholder="Choose username"
                    value={formData.username}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    <FaEnvelope /> Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    className="form-input"
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <FaPhone /> Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    className="form-input"
                    placeholder="10-digit number"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    maxLength="10"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    <FaLock /> Password *
                  </label>
                  <div className="password-input-wrapper">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      className="form-input"
                      placeholder="Min 6 characters"
                      value={formData.password}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <FaLock /> Confirm Password *
                  </label>
                  <div className="password-input-wrapper">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      className="form-input"
                      placeholder="Repeat password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <FaUser /> Register As
                </label>
                <select
                  name="userType"
                  className="form-select"
                  value={formData.userType}
                  onChange={handleChange}
                >
                  <option value="CUSTOMER">Customer</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary btn-block"
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Register'}
              </button>
            </form>

            <div className="auth-footer">
              Already have an account? <Link to="/login">Login here</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;