import React, { useState, useEffect } from 'react';
import { FaUsers, FaUserShield, FaUser } from 'react-icons/fa';
import api from '../../services/api';
import { AUTH_API } from '../../utils/constants';
import Notification from '../Common/Notification';
import './Admin.css';

const AllUsers = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ total: 0, admins: 0, customers: 0 });
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get(`${AUTH_API}/users`);
      if (response.data.success) {
        const allUsers = response.data.users;
        setUsers(allUsers);
        
        const admins = allUsers.filter(u => u.userType === 'ADMIN').length;
        const customers = allUsers.filter(u => u.userType === 'CUSTOMER').length;
        
        setStats({
          total: allUsers.length,
          admins,
          customers
        });
      }
    } catch (error) {
      showNotification('Failed to fetch users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const getFilteredUsers = () => {
    switch (filter) {
      case 'ADMIN':
        return users.filter(u => u.userType === 'ADMIN');
      case 'CUSTOMER':
        return users.filter(u => u.userType === 'CUSTOMER');
      default:
        return users;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="page-container">
      {notification && (
        <Notification 
          message={notification.message} 
          type={notification.type} 
          onClose={() => setNotification(null)} 
        />
      )}

      <div className="page-header">
        <h1 className="page-title">All Users</h1>
        <p className="page-subtitle">Manage registered users</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon primary">
            <FaUsers />
          </div>
          <div className="stat-content">
            <div className="stat-label">Total Users</div>
            <div className="stat-value">{stats.total}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon danger">
            <FaUserShield />
          </div>
          <div className="stat-content">
            <div className="stat-label">Admins</div>
            <div className="stat-value">{stats.admins}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon success">
            <FaUser />
          </div>
          <div className="stat-content">
            <div className="stat-label">Customers</div>
            <div className="stat-value">{stats.customers}</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Users List</h3>
          <div className="filter-buttons">
            <button 
              className={`btn btn-secondary ${filter === 'ALL' ? 'active' : ''}`}
              onClick={() => setFilter('ALL')}
            >
              All
            </button>
            <button 
              className={`btn btn-danger ${filter === 'ADMIN' ? 'active' : ''}`}
              onClick={() => setFilter('ADMIN')}
            >
              Admins
            </button>
            <button 
              className={`btn btn-success ${filter === 'CUSTOMER' ? 'active' : ''}`}
              onClick={() => setFilter('CUSTOMER')}
            >
              Customers
            </button>
          </div>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Full Name</th>
                <th>Username</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Type</th>
                <th>Registered</th>
              </tr>
            </thead>
            <tbody>
              {getFilteredUsers().map((user) => (
                <tr key={user.id}>
                  <td>#{user.id}</td>
                  <td>{user.fullName}</td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{user.phoneNumber || 'N/A'}</td>
                  <td>
                    <span className={`badge badge-${user.userType === 'ADMIN' ? 'danger' : 'info'}`}>
                      {user.userType}
                    </span>
                  </td>
                  <td>{formatDate(user.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AllUsers;