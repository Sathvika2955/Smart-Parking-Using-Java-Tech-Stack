import React, { useState } from 'react';
import { FaSearch, FaCar, FaMapMarkerAlt, FaClock, FaUser, FaPhone, FaTrash } from 'react-icons/fa';
import api from '../../services/api';
import { PARKING_API } from '../../utils/constants';
import Notification from '../Common/Notification';
import './Admin.css';

const SearchVehicle = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      showNotification('Please enter a license plate number', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await api.get(`${PARKING_API}/search/${searchQuery.toUpperCase()}`);
      
      if (response.data.success) {
        setSearchResult(response.data);
      } else {
        showNotification(response.data.message, 'error');
        setSearchResult(null);
      }
    } catch (error) {
      showNotification('Search failed. Please try again.', 'error');
      setSearchResult(null);
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
        setSearchResult(null);
        setSearchQuery('');
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
        <h1 className="page-title">Search Vehicle</h1>
        <p className="page-subtitle">Find vehicle by license plate number</p>
      </div>

      <div className="search-container">
        <div className="card">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-input-wrapper">
              <FaSearch className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Enter license plate (e.g., AP39CK1234)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
                autoFocus
              />
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading || !searchQuery.trim()}
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </form>
        </div>

        {searchResult && searchResult.success && (
          <div className="card search-result-card">
            <div className="result-header">
              <h3>Vehicle Found</h3>
              {searchResult.isParked ? (
                <span className="badge badge-success">PARKED</span>
              ) : (
                <span className="badge badge-info">NOT PARKED</span>
              )}
            </div>

            <div className="result-grid">
              <div className="result-item">
                <FaCar className="result-icon" />
                <div>
                  <div className="result-label">License Plate</div>
                  <div className="result-value">{searchResult.vehicle.licensePlate}</div>
                </div>
              </div>

              <div className="result-item">
                <FaCar className="result-icon" />
                <div>
                  <div className="result-label">Vehicle Type</div>
                  <div className="result-value">{searchResult.vehicle.vehicleType}</div>
                </div>
              </div>

              <div className="result-item">
                <FaUser className="result-icon" />
                <div>
                  <div className="result-label">Owner Name</div>
                  <div className="result-value">{searchResult.vehicle.ownerName}</div>
                </div>
              </div>

              <div className="result-item">
                <FaPhone className="result-icon" />
                <div>
                  <div className="result-label">Phone Number</div>
                  <div className="result-value">{searchResult.vehicle.phoneNumber}</div>
                </div>
              </div>

              {searchResult.isParked && (
                <>
                  <div className="result-item">
                    <FaMapMarkerAlt className="result-icon" />
                    <div>
                      <div className="result-label">Parking Slot</div>
                      <div className="result-value slot-number-large">
                        #{searchResult.slotNumber}
                      </div>
                    </div>
                  </div>

                  <div className="result-item">
                    <FaClock className="result-icon" />
                    <div>
                      <div className="result-label">Entry Time</div>
                      <div className="result-value">{formatDate(searchResult.booking.entryTime)}</div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {searchResult.isParked && (
              <button
                className="btn btn-danger btn-block remove-vehicle-btn"
                onClick={() => handleRemoveVehicle(searchResult.vehicle.licensePlate)}
              >
                <FaTrash /> Remove Vehicle & Calculate Fee
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchVehicle;