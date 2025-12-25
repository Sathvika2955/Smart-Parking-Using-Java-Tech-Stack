import React, { useState, useEffect } from 'react';
import { FaClock, FaCar, FaMapMarkerAlt, FaMoneyBillWave } from 'react-icons/fa';
import api from '../../services/api';
import { PARKING_API } from '../../utils/constants';
import Notification from '../Common/Notification';
import './User.css';

const MyBookings = ({ user }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await api.get(`${PARKING_API}/user/${user.id}/bookings`);
      if (response.data.success) {
        setBookings(response.data.bookings || []);
      }
    } catch (error) {
      showNotification('Failed to fetch bookings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
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
        <h1 className="page-title">My Bookings</h1>
        <p className="page-subtitle">View your parking history and active bookings</p>
      </div>

      {bookings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><FaCar /></div>
          <div className="empty-state-text">No bookings yet</div>
          <p>Park your first vehicle to see bookings here</p>
        </div>
      ) : (
        <div className="bookings-grid">
          {bookings.map((booking) => (
            <div key={booking.id} className={`booking-card ${booking.status.toLowerCase()}`}>
              <div className="booking-header">
                <div className="booking-number">
                  #{booking.bookingNumber}
                </div>
                <span className={`badge badge-${booking.status === 'ACTIVE' ? 'success' : 'info'}`}>
                  {booking.status}
                </span>
              </div>

              <div className="booking-body">
                <div className="booking-detail">
                  <FaCar className="detail-icon" />
                  <div>
                    <div className="detail-label">Vehicle</div>
                    <div className="detail-value">{booking.vehicle.licensePlate}</div>
                    <div className="detail-sub">{booking.vehicle.vehicleType}</div>
                  </div>
                </div>

                <div className="booking-detail">
                  <FaMapMarkerAlt className="detail-icon" />
                  <div>
                    <div className="detail-label">Slot</div>
                    <div className="detail-value">Slot #{booking.parkingSlot.slotNumber}</div>
                    <div className="detail-sub">{booking.parkingSlot.slotType}</div>
                  </div>
                </div>

                <div className="booking-detail">
                  <FaClock className="detail-icon" />
                  <div>
                    <div className="detail-label">Entry Time</div>
                    <div className="detail-value">{formatDate(booking.entryTime)}</div>
                  </div>
                </div>

                {booking.exitTime && (
                  <div className="booking-detail">
                    <FaClock className="detail-icon" />
                    <div>
                      <div className="detail-label">Exit Time</div>
                      <div className="detail-value">{formatDate(booking.exitTime)}</div>
                    </div>
                  </div>
                )}

                {booking.totalAmount && (
                  <div className="booking-detail">
                    <FaMoneyBillWave className="detail-icon" />
                    <div>
                      <div className="detail-label">Amount Paid</div>
                      <div className="detail-value">₹{booking.totalAmount}</div>
                      <div className="detail-sub">@₹{booking.hourlyRate}/hour</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;