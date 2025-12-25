import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaCar } from 'react-icons/fa';
import { authService } from '../../services/auth';
import Notification from '../Common/Notification';
import './Auth.css';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username || !formData.password) {
      showNotification('Please fill in all fields', 'error');
      return;
    }

    setLoading(true);

    try {
      const response = await authService.login(formData.username, formData.password);
      
      if (response.success) {
        showNotification('Login successful!', 'success');
        setTimeout(() => {
          onLogin(response.user);
        }, 1000);
      } else {
        showNotification(response.message, 'error');
      }
    } catch (error) {
      showNotification('Login failed. Please try again.', 'error');
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

      <div className="auth-wrapper">
        <div className="auth-left">
          <div className="auth-left-content">
            <FaCar className="auth-logo-icon" />
            <h1>Smart Parking System</h1>
            <p>Manage your parking with ease and efficiency</p>
            <div className="auth-features">
              <div className="feature-item">
                <span className="feature-icon">✓</span>
                <span>Real-time slot availability</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">✓</span>
                <span>Secure payment gateway</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">✓</span>
                <span>24/7 customer support</span>
              </div>
            </div>
          </div>
        </div>

        <div className="auth-right">
          <div className="auth-form-container">
            <div className="auth-header">
              <h2>Welcome Back!</h2>
              <p>Login to continue to your account</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label className="form-label">
                  <FaUser /> Username
                </label>
                <input
                  type="text"
                  name="username"
                  className="form-input"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={handleChange}
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <FaLock /> Password
                </label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    className="form-input"
                    placeholder="Enter your password"
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

              <button 
                type="submit" 
                className="btn btn-primary btn-block"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>

            <div className="auth-divider">
              <span>Demo Credentials</span>
            </div>

            <div className="demo-credentials">
              <div className="demo-item">
                <strong>Admin:</strong> admin / admin123
              </div>
              <div className="demo-item">
                <strong>User:</strong> user / user123
              </div>
            </div>

            <div className="auth-footer">
              Don't have an account? <Link to="/register">Register here</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;