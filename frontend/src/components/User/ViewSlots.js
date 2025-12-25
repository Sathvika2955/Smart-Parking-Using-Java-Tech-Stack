import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { PARKING_API } from '../../utils/constants';
import SlotCard from '../Common/SlotCard';
import Notification from '../Common/Notification';
import './User.css';

const ViewSlots = () => {
  const [slots, setSlots] = useState([]);
  const [filter, setFilter] = useState('ALL');
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

  const getFilteredSlots = () => {
    switch (filter) {
      case 'AVAILABLE':
        return slots.filter(s => !s.isOccupied && s.isAvailable);
      case 'OCCUPIED':
        return slots.filter(s => s.isOccupied);
      default:
        return slots;
    }
  };

  const getStats = () => {
    return {
      total: slots.length,
      available: slots.filter(s => !s.isOccupied && s.isAvailable).length,
      occupied: slots.filter(s => s.isOccupied).length
    };
  };

  const stats = getStats();

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
        <h1 className="page-title">Parking Slots</h1>
        <p className="page-subtitle">Real-time slot availability</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon primary">
            <span>{stats.total}</span>
          </div>
          <div className="stat-content">
            <div className="stat-label">Total Slots</div>
            <div className="stat-value">{stats.total}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon success">
            <span>{stats.available}</span>
          </div>
          <div className="stat-content">
            <div className="stat-label">Available</div>
            <div className="stat-value">{stats.available}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon danger">
            <span>{stats.occupied}</span>
          </div>
          <div className="stat-content">
            <div className="stat-label">Occupied</div>
            <div className="stat-value">{stats.occupied}</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">All Slots</h3>
          <div className="filter-buttons">
            <button 
              className={`btn btn-secondary ${filter === 'ALL' ? 'active' : ''}`}
              onClick={() => setFilter('ALL')}
            >
              All
            </button>
            <button 
              className={`btn btn-success ${filter === 'AVAILABLE' ? 'active' : ''}`}
              onClick={() => setFilter('AVAILABLE')}
            >
              Available
            </button>
            <button 
              className={`btn btn-danger ${filter === 'OCCUPIED' ? 'active' : ''}`}
              onClick={() => setFilter('OCCUPIED')}
            >
              Occupied
            </button>
          </div>
        </div>

        <div className="slots-grid">
          {getFilteredSlots().map(slot => (
            <SlotCard key={slot.id} slot={slot} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ViewSlots;