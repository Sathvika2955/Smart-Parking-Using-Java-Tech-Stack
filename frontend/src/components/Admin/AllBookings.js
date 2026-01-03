import React, { useState, useEffect } from 'react';
import { FaCar, FaClock, FaMoneyBillWave, FaTrash, FaStopwatch, FaCheckCircle } from 'react-icons/fa';
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
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchData = async () => {
    try {
      const response = await api.get(`${PARKING_API}/report`);
      const allBookings = [...response.data.activeBookings];
      
      const scheduledRevenue = allBookings.reduce((total, booking) => {
        const amount = booking.totalAmount || 0;
        return total + (isNaN(amount) ? 0 : Number(amount));
      }, 0);
      
      setBookings(allBookings);
      setStats({
        total: allBookings.length,
        active: response.data.activeBookings.length,
        completed: 0,
        revenue: isNaN(scheduledRevenue) ? 0 : scheduledRevenue
      });
    } catch (error) {
      console.error('Error fetching bookings:', error);
      showNotification('Failed to fetch bookings', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ✅ NEW: Checkout function for admin
  const handleCheckout = async (bookingId, bookingNumber) => {
    if (!window.confirm(`Complete checkout for booking ${bookingNumber}?`)) return;

    try {
      const response = await api.put(`${PARKING_API}/checkout/${bookingId}`);
      if (response.data.success) {
        showNotification(
          `Checkout completed! Amount: ₹${Number(response.data.totalAmount || 0).toFixed(2)}`, 
          'success'
        );
        fetchData();
      } else {
        showNotification(response.data.message, 'error');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      showNotification('Failed to complete checkout', 'error');
    }
  };

  const handleRemoveVehicle = async (licensePlate) => {
    if (!window.confirm(`Remove vehicle ${licensePlate}?`)) return;

    try {
      const response = await api.delete(`${PARKING_API}/remove/${licensePlate}`);
      if (response.data.success) {
        const booking = bookings.find(b => b.vehicle.licensePlate === licensePlate);
        const amount = booking?.totalAmount || response.data.totalAmount || 0;
        
        showNotification(
          `Vehicle removed! Fee: ₹${Number(amount).toFixed(2)}`, 
          'success'
        );
        fetchData();
      } else {
        showNotification(response.data.message, 'error');
      }
    } catch (error) {
      console.error('Remove error:', error);
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
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return '-';
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      return '-';
    }
  };

  // ✅ Calculate elapsed time (stops when status is COMPLETED)
  const getElapsedTime = (booking) => {
    if (!booking.entryTime) return '-';
    
    try {
      const entryTime = new Date(booking.entryTime);
      // ✅ Use exitTime if completed, otherwise current time
      const endTime = booking.status === 'COMPLETED' && booking.exitTime 
        ? new Date(booking.exitTime) 
        : currentTime;
      
      const diffMs = endTime - entryTime;
      
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
      
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    } catch (e) {
      console.error('Elapsed time calculation error:', e);
      return '-';
    }
  };

  const getScheduledDuration = (booking) => {
    if (booking.startTime && booking.endTime) {
      try {
        const start = new Date(booking.startTime);
        const end = new Date(booking.endTime);
        const diffMs = end - start;
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        
        if (hours > 0 && minutes > 0) {
          return `${hours}h ${minutes}m`;
        } else if (hours > 0) {
          return `${hours}h`;
        } else if (minutes > 0) {
          return `${minutes}m`;
        }
      } catch (e) {
        console.error('Duration calculation error:', e);
      }
    }
    return '-';
  };

  const isOverdue = (booking) => {
    if (!booking.endTime || booking.status !== 'ACTIVE') return false;
    try {
      const endTime = new Date(booking.endTime);
      return currentTime > endTime;
    } catch (e) {
      return false;
    }
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
                <th>⏱️ Elapsed Time</th>
                <th>End Time</th>
                <th>Scheduled</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {getFilteredBookings().map((booking) => (
                <tr key={booking.id} className={isOverdue(booking) ? 'overdue-row' : ''}>
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
                  
                  {/* ✅ Timer that stops on completion */}
                  <td className="elapsed-time-cell">
                    <div className="timer-display">
                      <FaStopwatch className={`timer-icon ${booking.status === 'COMPLETED' ? 'stopped' : ''}`} />
                      <span className="timer-value">{getElapsedTime(booking)}</span>
                      {isOverdue(booking) && (
                        <span className="overdue-badge" title="Past scheduled end time">⚠️</span>
                      )}
                    </div>
                  </td>
                  
                  <td className="end-time">
                    {booking.endTime ? (
                      <div className="time-info">
                        <div className="time-value">{formatTime(booking.endTime)}</div>
                        <div className="time-date">
                          {new Date(booking.endTime).toLocaleDateString('en-IN', { 
                            day: '2-digit', 
                            month: 'short' 
                          })}
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </td>
                  
                  <td className="duration-cell">
                    {getScheduledDuration(booking) !== '-' ? (
                      <span className="duration-badge">{getScheduledDuration(booking)}</span>
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </td>
                  
                  {/* ✅ Amount now displays properly */}
                  <td className="amount-cell">
                    {booking.totalAmount && !isNaN(booking.totalAmount) ? (
                      <span className="amount-value">
                        ₹{Number(booking.totalAmount).toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </td>
                  
                  <td>
                    <span className={`badge badge-${booking.status === 'ACTIVE' ? 'success' : 'info'}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td>
                    {booking.status === 'ACTIVE' && (
                      <div className="action-buttons">
                        {/* ✅ NEW: Checkout button */}
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => handleCheckout(booking.id, booking.bookingNumber)}
                          title="Complete checkout"
                        >
                          <FaCheckCircle /> Checkout
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleRemoveVehicle(booking.vehicle.licensePlate)}
                          title="Force remove"
                        >
                          <FaTrash /> Remove
                        </button>
                      </div>
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