import React, { useState, useEffect } from 'react';
import { FaUsers, FaUserCheck, FaUserClock, FaCar } from 'react-icons/fa';
import api from '../../services/api';
import { AUTH_API, PARKING_API } from '../../utils/constants';
import Notification from '../Common/Notification';
import './Admin.css';

const AllUsers = () => {
  const [users, setUsers] = useState([]);
  const [userBookingMap, setUserBookingMap] = useState({});
  const [stats, setStats] = useState({ total: 0, withBookings: 0, activeBookings: 0 });
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // More frequent updates
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      console.log('=== FETCHING ALL USERS DATA ===');
      
      // Fetch all users
      const usersResponse = await api.get(`${AUTH_API}/users`);
      const allUsers = usersResponse.data;
      console.log('Users fetched:', allUsers.length);

      // Fetch all bookings to get user booking info
      const bookingsResponse = await api.get(`${PARKING_API}/report`);
      const activeBookings = bookingsResponse.data.activeBookings || [];
      const completedBookings = bookingsResponse.data.completedBookings || [];
      
      console.log('Active bookings:', activeBookings.length);
      console.log('Completed bookings:', completedBookings.length);

      // ✅ IMPORTANT: Include BOTH active and completed bookings
      const allBookings = [...activeBookings, ...completedBookings];

      // Create a map of userId -> booking counts
      const bookingMap = {};
      
      allBookings.forEach(booking => {
        const userId = booking.vehicle?.user?.id;
        console.log('Processing booking:', booking.bookingNumber, 'User ID:', userId, 'Status:', booking.status);
        
        if (userId) {
          if (!bookingMap[userId]) {
            bookingMap[userId] = { 
              total: 0, 
              active: 0,
              completed: 0 
            };
          }
          
          bookingMap[userId].total++;
          
          if (booking.status === 'ACTIVE') {
            bookingMap[userId].active++;
          } else if (booking.status === 'COMPLETED') {
            bookingMap[userId].completed++;
          }
        }
      });

      console.log('User booking map:', bookingMap);

      // Calculate stats
      const usersWithBookings = Object.keys(bookingMap).length;
      const totalActiveBookings = Object.values(bookingMap).reduce(
        (sum, user) => sum + user.active, 0
      );

      console.log('Stats - With Bookings:', usersWithBookings, 'Active Now:', totalActiveBookings);

      setUsers(allUsers);
      setUserBookingMap(bookingMap);
      setStats({
        total: allUsers.length,
        withBookings: usersWithBookings,
        activeBookings: totalActiveBookings
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      showNotification('Failed to fetch users data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      return 'N/A';
    }
  };

  const getUserStatus = (userId) => {
    const userBooking = userBookingMap[userId];
    
    if (!userBooking || userBooking.total === 0) {
      return { label: 'No Bookings', className: 'secondary' };
    }
    
    if (userBooking.active > 0) {
      return { label: 'Active', className: 'success' };
    }
    
    // ✅ Show "Completed" if user has bookings but none active
    return { label: 'Completed', className: 'info' };
  };

  const getUserBookingStats = (userId) => {
    return userBookingMap[userId] || { total: 0, active: 0, completed: 0 };
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
        <p className="page-subtitle">Manage registered users and their bookings</p>
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
          <div className="stat-icon success">
            <FaUserCheck />
          </div>
          <div className="stat-content">
            <div className="stat-label">With Bookings</div>
            <div className="stat-value">{stats.withBookings}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon warning">
            <FaUserClock />
          </div>
          <div className="stat-content">
            <div className="stat-label">Active Now</div>
            <div className="stat-value">{stats.activeBookings}</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Users List</h3>
          <div className="card-subtitle">
            Total: {users.length} users
          </div>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Name</th>
                <th>Username</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Registered On</th>
                <th>Total Bookings</th>
                <th>Active Bookings</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const status = getUserStatus(user.id);
                const bookingStats = getUserBookingStats(user.id);

                return (
                  <tr key={user.id}>
                    <td className="user-id">#{user.id}</td>
                    <td className="user-name">{user.fullName || '-'}</td>
                    <td className="user-username">{user.username || '-'}</td>
                    <td className="user-email">{user.email}</td>
                    <td className="user-phone">{user.phoneNumber || 'N/A'}</td>
                    <td>
                      <span className={`badge badge-${user.userType === 'ADMIN' ? 'danger' : 'primary'}`}>
                        {user.userType}
                      </span>
                    </td>
                    <td className="registered-date">{formatDate(user.createdAt)}</td>
                    
                    {/* ✅ Total Bookings - Shows even after checkout */}
                    <td className="text-center">
                      {bookingStats.total > 0 ? (
                        <div className="vehicle-count">
                          <FaCar className="vehicle-icon" />
                          <span>{bookingStats.total}</span>
                        </div>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    
                    {/* ✅ Active Bookings - Shows only active count */}
                    <td className="text-center">
                      {bookingStats.active > 0 ? (
                        <span className="active-booking-badge">{bookingStats.active}</span>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    
                    <td>
                      <span className={`badge badge-${status.className}`}>
                        {status.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {users.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon"><FaUsers /></div>
              <div className="empty-state-text">No users registered yet</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllUsers;