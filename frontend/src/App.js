import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import UserDashboard from './components/User/UserDashboard';
import AdminDashboard from './components/Admin/AdminDashboard';
import { authService } from './services/auth';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const handleLogin = (user) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="app">
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/login" 
            element={
              !isAuthenticated ? 
                <Login onLogin={handleLogin} /> : 
                <Navigate to={currentUser?.userType === 'ADMIN' ? '/admin' : '/user'} />
            } 
          />
          <Route 
            path="/register" 
            element={
              !isAuthenticated ? 
                <Register onRegister={handleLogin} /> : 
                <Navigate to={currentUser?.userType === 'ADMIN' ? '/admin' : '/user'} />
            } 
          />

          {/* Protected Routes - User */}
          <Route 
            path="/user/*" 
            element={
              isAuthenticated && currentUser?.userType === 'CUSTOMER' ? 
                <UserDashboard user={currentUser} onLogout={handleLogout} /> : 
                <Navigate to="/login" />
            } 
          />

          {/* Protected Routes - Admin */}
          <Route 
            path="/admin/*" 
            element={
              isAuthenticated && currentUser?.userType === 'ADMIN' ? 
                <AdminDashboard user={currentUser} onLogout={handleLogout} /> : 
                <Navigate to="/login" />
            } 
          />

          {/* Default Route */}
          <Route 
            path="/" 
            element={
              isAuthenticated ? 
                <Navigate to={currentUser?.userType === 'ADMIN' ? '/admin' : '/user'} /> : 
                <Navigate to="/login" />
            } 
          />

          {/* 404 Route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;