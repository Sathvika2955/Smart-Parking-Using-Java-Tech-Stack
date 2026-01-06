import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaParking, FaToggleOn, FaToggleOff, FaCar, FaPlus, FaEdit, FaTrash, FaMapMarkerAlt } from 'react-icons/fa';
import api from '../../services/api';
import { PARKING_API } from '../../utils/constants';
import Notification from '../Common/Notification';
import './Admin.css';

const ManageSlots = () => {
  const navigate = useNavigate();
  const [slots, setSlots] = useState([]);
  const [stats, setStats] = useState({ total: 0, available: 0, occupied: 0, unavailable: 0 });
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [editingSlot, setEditingSlot] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState('ALL');

  useEffect(() => {
    fetchSlots();
    fetchCities();
    const interval = setInterval(fetchSlots, 5000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const fetchCities = async () => {
    try {
      const response = await api.get('/slots/cities');
      if (response.data.success) {
        setCities(response.data.cities);
      }
    } catch (error) {
      console.error('Failed to fetch cities:', error);
    }
  };

  const getFilteredSlots = () => {
    if (selectedCity === 'ALL') {
      return slots;
    }
    return slots.filter(slot => slot.city === selectedCity);
  };

  const handleToggleAvailability = async (slotId, currentStatus) => {
    try {
      const response = await api.put(`/slots/toggle-availability/${slotId}`);
      if (response.data.success) {
        showNotification(response.data.message, 'success');
        fetchSlots();
      } else {
        showNotification(response.data.message, 'error');
      }
    } catch (error) {
      showNotification('Failed to toggle availability', 'error');
    }
  };

  const handleEditSlot = (slot) => {
    setEditingSlot({
      id: slot.id,
      slotType: slot.slotType,
      floorNumber: slot.floorNumber,
      locationName: slot.locationName || '',
      address: slot.address || ''
    });
    setShowEditModal(true);
  };

  const handleUpdateSlot = async () => {
    if (!editingSlot) return;

    try {
      const response = await api.put(`/slots/update/${editingSlot.id}`, editingSlot);
      if (response.data.success) {
        showNotification('Slot updated successfully!', 'success');
        setShowEditModal(false);
        setEditingSlot(null);
        fetchSlots();
      } else {
        showNotification(response.data.message, 'error');
      }
    } catch (error) {
      showNotification('Failed to update slot', 'error');
    }
  };

  const handleDeleteSlot = async (slotId, slotNumber) => {
    if (!window.confirm(`Are you sure you want to delete Slot #${slotNumber}? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await api.delete(`/slots/delete/${slotId}`);
      if (response.data.success) {
        showNotification('Slot deleted successfully!', 'success');
        fetchSlots();
      } else {
        showNotification(response.data.message, 'error');
      }
    } catch (error) {
      showNotification('Failed to delete slot', 'error');
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

      {/* Edit Modal */}
      {showEditModal && editingSlot && (
        <div className="modal-overlay">
          <div className="upi-modal" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3>Edit Slot #{slots.find(s => s.id === editingSlot.id)?.slotNumber}</h3>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Slot Type</label>
                <select
                  className="form-select"
                  value={editingSlot.slotType}
                  onChange={(e) => setEditingSlot({ ...editingSlot, slotType: e.target.value })}
                >
                  <option value="SMALL">SMALL (Bike/Scooter)</option>
                  <option value="MEDIUM">MEDIUM (Car)</option>
                  <option value="LARGE">LARGE (SUV/Truck)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Floor Number</label>
                <input
                  type="number"
                  className="form-input"
                  value={editingSlot.floorNumber}
                  onChange={(e) => setEditingSlot({ ...editingSlot, floorNumber: parseInt(e.target.value) })}
                  min="0"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Location Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={editingSlot.locationName}
                  onChange={(e) => setEditingSlot({ ...editingSlot, locationName: e.target.value })}
                  placeholder="e.g., Main Parking - Slot 1"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Address</label>
                <input
                  type="text"
                  className="form-input"
                  value={editingSlot.address}
                  onChange={(e) => setEditingSlot({ ...editingSlot, address: e.target.value })}
                  placeholder="e.g., Near Gate 2"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-secondary" 
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleUpdateSlot}
              >
                Update Slot
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Manage Parking Slots</h1>
          <p className="page-subtitle">Add, edit, or manage parking slots</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/admin/add-slot')}
        >
          <FaPlus /> Add New Slot
        </button>
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
            <div className="stat-label">Disabled</div>
            <div className="stat-value">{stats.unavailable}</div>
          </div>
        </div>
      </div>

      {/* City Quick Filter Badges */}
      {cities.length > 0 && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <div style={{ padding: '16px' }}>
            <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#2d3748' }}>
              Quick City Filter
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              <button
                onClick={() => setSelectedCity('ALL')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: selectedCity === 'ALL' ? '2px solid #667eea' : '2px solid #e2e8f0',
                  background: selectedCity === 'ALL' ? '#667eea' : 'white',
                  color: selectedCity === 'ALL' ? 'white' : '#4a5568',
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
              >
                All Cities ({slots.length})
              </button>
              {cities.map(city => {
                const cityCount = slots.filter(s => s.city === city).length;
                const isSelected = selectedCity === city;
                return (
                  <button
                    key={city}
                    onClick={() => setSelectedCity(city)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '20px',
                      border: isSelected ? '2px solid #667eea' : '2px solid #e2e8f0',
                      background: isSelected ? '#667eea' : 'white',
                      color: isSelected ? 'white' : '#4a5568',
                      fontWeight: '600',
                      fontSize: '14px',
                      cursor: 'pointer',
                      transition: 'all 0.3s'
                    }}
                  >
                    📍 {city} ({cityCount})
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">All Parking Slots</h3>
          
          {/* City Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <label style={{ fontSize: '14px', fontWeight: '600', color: '#4a5568' }}>
              Filter by City:
            </label>
            <select
              className="form-select"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              style={{ width: '200px', padding: '8px 12px' }}
            >
              <option value="ALL">All Cities ({slots.length})</option>
              {cities.map(city => {
                const cityCount = slots.filter(s => s.city === city).length;
                return (
                  <option key={city} value={city}>
                    {city} ({cityCount})
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Slot #</th>
                <th>Type</th>
                <th>Floor</th>
                <th>Location</th>
                <th>GPS</th>
                <th>Status</th>
                <th>Availability</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {getFilteredSlots().map((slot) => (
                <tr key={slot.id}>
                  <td>
                    <span className="slot-badge">#{slot.slotNumber}</span>
                  </td>
                  <td>
                    <span className="badge badge-info">{slot.slotType}</span>
                  </td>
                  <td>Floor {slot.floorNumber}</td>
                  <td>
                    {slot.locationName || 'Not specified'}
                    {slot.address && (
                      <div style={{ fontSize: '12px', color: '#718096', marginTop: '2px' }}>
                        {slot.address}
                      </div>
                    )}
                    {slot.city && (
                      <div style={{ fontSize: '11px', color: '#667eea', marginTop: '2px', fontWeight: '600' }}>
                        📍 {slot.city}, {slot.region}
                      </div>
                    )}
                  </td>
                  <td>
                    {slot.latitude && slot.longitude ? (
                      <div style={{ fontSize: '12px' }}>
                        <FaMapMarkerAlt style={{ color: '#48bb78', marginRight: '4px' }} />
                        {slot.latitude.toFixed(4)}, {slot.longitude.toFixed(4)}
                      </div>
                    ) : (
                      <span style={{ color: '#a0aec0' }}>No GPS</span>
                    )}
                  </td>
                  <td>
                    <span className={`badge badge-${slot.isOccupied ? 'danger' : 'success'}`}>
                      {slot.isOccupied ? 'OCCUPIED' : 'FREE'}
                    </span>
                  </td>
                  <td>
                    <button
                      className={`btn ${slot.isAvailable ? 'btn-success' : 'btn-secondary'} btn-sm`}
                      onClick={() => handleToggleAvailability(slot.id, slot.isAvailable)}
                      disabled={slot.isOccupied}
                      title={slot.isOccupied ? 'Cannot disable occupied slot' : 'Toggle availability'}
                    >
                      {slot.isAvailable ? <FaToggleOn /> : <FaToggleOff />}
                      {slot.isAvailable ? ' Enabled' : ' Disabled'}
                    </button>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleEditSlot(slot)}
                        disabled={slot.isOccupied}
                        title={slot.isOccupied ? 'Cannot edit occupied slot' : 'Edit slot'}
                      >
                        <FaEdit /> Edit
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeleteSlot(slot.id, slot.slotNumber)}
                        disabled={slot.isOccupied}
                        title={slot.isOccupied ? 'Cannot delete occupied slot' : 'Delete slot'}
                      >
                        <FaTrash /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {getFilteredSlots().length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon"><FaParking /></div>
              <div className="empty-state-text">
                {selectedCity === 'ALL' ? 'No slots found' : `No slots in ${selectedCity}`}
              </div>
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/admin/add-slot')}
                style={{ marginTop: '20px' }}
              >
                <FaPlus /> Add First Slot
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageSlots;