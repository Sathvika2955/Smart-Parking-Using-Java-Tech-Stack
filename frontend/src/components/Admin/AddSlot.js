import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { FaMapMarkerAlt, FaParking, FaBuilding, FaHome, FaCity, FaGlobe } from 'react-icons/fa';
import api from '../../services/api';
import Notification from '../Common/Notification';
import '../Admin/Admin.css';

// Fix Leaflet default marker
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Map click handler component
function LocationPicker({ onLocationSelect }) {
  useMapEvents({
    click: (e) => {
      onLocationSelect(e.latlng);
    },
  });
  return null;
}

const AddSlot = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    slotNumber: '',
    slotType: 'MEDIUM',
    floorNumber: 1,
    latitude: null,
    longitude: null,
    locationName: '',
    address: '',
    city: '',
    region: ''
  });
  const [markerPosition, setMarkerPosition] = useState(null);
  const [mapCenter, setMapCenter] = useState([16.9891, 82.2475]); // Default: Kakinada
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [nextSlotNumber, setNextSlotNumber] = useState(null);

  useEffect(() => {
    fetchNextSlotNumber();
    getUserLocation();
  }, []);

  const fetchNextSlotNumber = async () => {
    try {
      const response = await api.get('/slots/next-slot-number');
      console.log('Next slot number response:', response.data);
      if (response.data.success) {
        setNextSlotNumber(response.data.nextSlotNumber);
        setFormData(prev => ({ ...prev, slotNumber: response.data.nextSlotNumber }));
      }
    } catch (error) {
      console.error('Error fetching next slot number:', error);
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setMapCenter([latitude, longitude]);
          console.log('User location:', latitude, longitude);
        },
        (error) => {
          console.error('Location error:', error);
        }
      );
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleMapClick = (latlng) => {
    console.log('Map clicked at:', latlng);
    setMarkerPosition(latlng);
    setFormData({
      ...formData,
      latitude: latlng.lat,
      longitude: latlng.lng
    });
    showNotification('Location selected on map!', 'success');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log('=== SUBMITTING SLOT DATA ===');
    console.log('Form Data:', formData);

    // Validation
    if (!formData.slotNumber || !formData.slotType) {
      showNotification('Please fill all required fields', 'error');
      return;
    }

    if (!formData.latitude || !formData.longitude) {
      showNotification('Please select location on map', 'error');
      return;
    }

    setLoading(true);

    try {
      console.log('Sending request to /slots/add');
      const response = await api.post('/slots/add', formData);
      
      console.log('Response:', response.data);
      
      if (response.data.success) {
        showNotification('Slot added successfully!', 'success');
        setTimeout(() => {
          navigate('/admin/manage-slots');
        }, 1500);
      } else {
        console.error('Server returned error:', response.data.message);
        showNotification(response.data.message || 'Failed to add slot', 'error');
      }
    } catch (error) {
      console.error('=== ERROR ADDING SLOT ===');
      console.error('Error:', error);
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);
      
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error 
        || error.message 
        || 'Failed to add slot';
      
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
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
        <h1 className="page-title">Add New Parking Slot</h1>
        <p className="page-subtitle">Create a new parking slot with location</p>
      </div>

      <div className="park-vehicle-container">
        <div className="park-vehicle-form">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Slot Details</h3>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">
                  <FaParking /> Slot Number *
                </label>
                <input
                  type="number"
                  name="slotNumber"
                  className="form-input"
                  placeholder="e.g., 21"
                  value={formData.slotNumber}
                  onChange={handleChange}
                  min="1"
                  required
                />
                {nextSlotNumber && (
                  <p style={{ fontSize: '12px', color: '#718096', marginTop: '4px' }}>
                    Suggested: {nextSlotNumber}
                  </p>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">
                  <FaParking /> Slot Type *
                </label>
                <select
                  name="slotType"
                  className="form-select"
                  value={formData.slotType}
                  onChange={handleChange}
                  required
                >
                  <option value="SMALL">SMALL (Bike/Scooter)</option>
                  <option value="MEDIUM">MEDIUM (Car)</option>
                  <option value="LARGE">LARGE (SUV/Truck)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <FaBuilding /> Floor Number
                </label>
                <input
                  type="number"
                  name="floorNumber"
                  className="form-input"
                  placeholder="e.g., 1"
                  value={formData.floorNumber}
                  onChange={handleChange}
                  min="0"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <FaMapMarkerAlt /> Location Name
                </label>
                <input
                  type="text"
                  name="locationName"
                  className="form-input"
                  placeholder="e.g., Beach Road Parking - Slot 21"
                  value={formData.locationName}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <FaHome /> Address
                </label>
                <input
                  type="text"
                  name="address"
                  className="form-input"
                  placeholder="e.g., Near Railway Station, Sector 5"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <FaCity /> City
                </label>
                <input
                  type="text"
                  name="city"
                  className="form-input"
                  placeholder="e.g., Mumbai, Delhi, Bangalore"
                  value={formData.city}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <FaGlobe /> Region/State
                </label>
                <input
                  type="text"
                  name="region"
                  className="form-input"
                  placeholder="e.g., Maharashtra, Delhi, Karnataka"
                  value={formData.region}
                  onChange={handleChange}
                />
              </div>

              {formData.latitude && formData.longitude && (
                <div style={{
                  background: '#ebf4ff',
                  padding: '12px',
                  borderRadius: '8px',
                  marginBottom: '16px'
                }}>
                  <div style={{ fontSize: '13px', color: '#667eea', fontWeight: '600' }}>
                    📍 Selected Coordinates:
                  </div>
                  <div style={{ fontSize: '12px', color: '#4a5568', marginTop: '4px' }}>
                    Lat: {formData.latitude.toFixed(6)}, Long: {formData.longitude.toFixed(6)}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => navigate('/admin/manage-slots')}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading || !formData.latitude || !formData.longitude}
                  style={{ flex: 1 }}
                >
                  {loading ? 'Adding...' : 'Add Slot'}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="slot-selection">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Select Location on Map</h3>
              <p style={{ fontSize: '13px', color: '#718096', margin: '8px 0 0 0' }}>
                Click anywhere on the map to set slot location
              </p>
            </div>

            <div style={{ height: '600px', borderRadius: '12px', overflow: 'hidden' }}>
              <MapContainer
                center={mapCenter}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationPicker onLocationSelect={handleMapClick} />
                
                {markerPosition && (
                  <Marker position={markerPosition} />
                )}
              </MapContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddSlot;