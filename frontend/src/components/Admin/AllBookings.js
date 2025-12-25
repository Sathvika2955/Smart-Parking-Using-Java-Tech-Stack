import React, { useState, useEffect } from 'react';
import { FaCar, FaClock, FaMoneyBillWave, FaTrash } from 'react-icons/fa';
import api from '../../services/api';
import { PARKING_API } from '../../utils/constants';
import Notification from '../Common/Notification';
import './Admin.css';

const AllBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, completed: 0, revenue: 0 });
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const response = await api.get(`${PARKING_API}/report`);
      const allBookings = [...response.data.activeBookings];
      
      setBookings(allBookings);
      setStats({
        total: allBookings.length,
        active: response.data.activeBookings.length,
        completed: 0,
        revenue: response.data.totalRevenue
      });
    } catch (error) {
      showNotification('Failed to fetch bookings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveVehicle = async (licensePlate) => {
    if (!window.confirm(`Remove vehicle ${licensePlate}?`)) return;

    try {
      const response = await api.delete(`${PARKING_API}/remove/${licensePlate}`);
      if (response.data.success) {
        showNotification(`Vehicle removed! Fee: ₹${response.data.totalAmount}`, 'success');
        fetchData();
      } else {
        showNotification(response.data.message, 'error');
      }
    } catch (error) {
      showNotification('Failed to remove vehicle', 'error');
    }
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const getFilteredBookings = () => {
    switch (filter) {
      case 'ACTIVE':
        return bookings.filter(b => b.status === 'ACTIVE');
      case 'COMPLETED':
        return bookings.filter(b => b.status === 'COMPLETED');
      default:
        return bookings;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
        <h1 className="page-title">All Bookings</h1>
        <p className="page-subtitle">Manage all parking bookings</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon primary">
            <FaCar />
          </div>
          <div className="stat-content">
            <div className="stat-label">Total Bookings</div>
            <div className="stat-value">{stats.total}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon success">
            <FaClock />
          </div>
          <div className="stat-content">
            <div className="stat-label">Active</div>
            <div className="stat-value">{stats.active}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon warning">
            <FaMoneyBillWave />
          </div>
          <div className="stat-content">
            <div className="stat-label">Total Revenue</div>
            <div className="stat-value">₹{stats.revenue.toFixed(0)}</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Bookings List</h3>
          <div className="filter-buttons">
            <button 
              className={`btn btn-secondary ${filter === 'ALL' ? 'active' : ''}`}
              onClick={() => setFilter('ALL')}
            >
              All ({bookings.length})
            </button>
            <button 
              className={`btn btn-success ${filter === 'ACTIVE' ? 'active' : ''}`}
              onClick={() => setFilter('ACTIVE')}
            >
              Active ({stats.active})
            </button>
          </div>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Booking #</th>
                <th>Vehicle</th>
                <th>Owner</th>
                <th>Phone</th>
                <th>Slot</th>
                <th>Entry Time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {getFilteredBookings().map((booking) => (
                <tr key={booking.id}>
                  <td className="booking-number">{booking.bookingNumber}</td>
                  <td>
                    <div className="vehicle-info">
                      <div className="vehicle-number">{booking.vehicle.licensePlate}</div>
                      <div className="vehicle-type">{booking.vehicle.vehicleType}</div>
                    </div>
                  </td>
                  <td>{booking.vehicle.ownerName}</td>
                  <td>{booking.vehicle.phoneNumber}</td>
                  <td>
                    <span className="slot-badge">#{booking.parkingSlot.slotNumber}</span>
                  </td>
                  <td className="entry-time">{formatDate(booking.entryTime)}</td>
                  <td>
                    <span className={`badge badge-${booking.status === 'ACTIVE' ? 'success' : 'info'}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td>
                    {booking.status === 'ACTIVE' && (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleRemoveVehicle(booking.vehicle.licensePlate)}
                      >
                        <FaTrash /> Remove
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {getFilteredBookings().length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon"><FaCar /></div>
              <div className="empty-state-text">No bookings found</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllBookings;