import React, { useState, useEffect } from 'react';
import { FaParking, FaToggleOn, FaToggleOff,FaCar } from 'react-icons/fa';
import api from '../../services/api';
import { PARKING_API } from '../../utils/constants';
import SlotCard from '../Common/SlotCard';
import Notification from '../Common/Notification';
import './Admin.css';

const ManageSlots = () => {
  const [slots, setSlots] = useState([]);
  const [stats, setStats] = useState({ total: 20, available: 0, occupied: 0, unavailable: 0 });
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchSlots();
    const interval = setInterval(fetchSlots, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchSlots = async () => {
    try {
      const response = await api.get(`${PARKING_API}/slots`);
      setSlots(response.data);
      
      const available = response.data.filter(s => !s.isOccupied && s.isAvailable).length;
      const occupied = response.data.filter(s => s.isOccupied).length;
      const unavailable = response.data.filter(s => !s.isAvailable).length;
      
      setStats({
        total: response.data.length,
        available,
        occupied,
        unavailable
      });
    } catch (error) {
      showNotification('Failed to fetch slots', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
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
        <h1 className="page-title">Manage Parking Slots</h1>
        <p className="page-subtitle">Enable or disable parking slots</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon primary">
            <FaParking />
          </div>
          <div className="stat-content">
            <div className="stat-label">Total Slots</div>
            <div className="stat-value">{stats.total}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon success">
            <FaToggleOn />
          </div>
          <div className="stat-content">
            <div className="stat-label">Available</div>
            <div className="stat-value">{stats.available}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon danger">
            <FaCar />
          </div>
          <div className="stat-content">
            <div className="stat-label">Occupied</div>
            <div className="stat-value">{stats.occupied}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon warning">
            <FaToggleOff />
          </div>
          <div className="stat-content">
            <div className="stat-label">Unavailable</div>
            <div className="stat-value">{stats.unavailable}</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">All Parking Slots</h3>
        </div>

        <div className="slots-grid">
          {slots.map(slot => (
            <SlotCard key={slot.id} slot={slot} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ManageSlots;