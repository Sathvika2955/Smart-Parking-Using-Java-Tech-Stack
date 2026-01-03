import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import api from '../../services/api';
import { PARKING_API } from '../../utils/constants';

// Fix Leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons for parking slots
const availableIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42">
      <path fill="#48bb78" d="M16 0C7.2 0 0 7.2 0 16c0 12 16 26 16 26s16-14 16-26c0-8.8-7.2-16-16-16z"/>
      <text x="16" y="22" font-size="16" fill="white" text-anchor="middle" font-weight="bold">P</text>
    </svg>
  `),
  iconSize: [32, 42],
  iconAnchor: [16, 42],
  popupAnchor: [0, -42]
});

const occupiedIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42">
      <path fill="#f56565" d="M16 0C7.2 0 0 7.2 0 16c0 12 16 26 16 26s16-14 16-26c0-8.8-7.2-16-16-16z"/>
      <text x="16" y="22" font-size="16" fill="white" text-anchor="middle" font-weight="bold">P</text>
    </svg>
  `),
  iconSize: [32, 42],
  iconAnchor: [16, 42],
  popupAnchor: [0, -42]
});

const userIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42">
      <path fill="#667eea" d="M16 0C7.2 0 0 7.2 0 16c0 12 16 26 16 26s16-14 16-26c0-8.8-7.2-16-16-16z"/>
      <circle cx="16" cy="16" r="8" fill="white"/>
    </svg>
  `),
  iconSize: [32, 42],
  iconAnchor: [16, 42],
  popupAnchor: [0, -42]
});

// Component to recenter map
function RecenterMap({ position }) {
  const map = useMap();
  
  useEffect(() => {
    if (position) {
      map.setView(position, 14);
    }
  }, [position, map]);
  
  return null;
}

const ParkingMap = ({ onSlotSelect, selectedSlot }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [nearbySlots, setNearbySlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchRadius, setSearchRadius] = useState(5);
  const [error, setError] = useState('');

  // Default center (Kakinada)
  const defaultCenter = [16.9891, 82.2475];

  useEffect(() => {
    getUserLocation();
  }, []);

  useEffect(() => {
    if (userLocation) {
      fetchNearbySlots();
    }
  }, [userLocation, searchRadius]);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          setUserLocation(location);
          setError('');
        },
        (error) => {
          console.error('Location error:', error);
          setError('Unable to get location. Showing default area.');
          // Use default location
          setUserLocation({ latitude: defaultCenter[0], longitude: defaultCenter[1] });
        }
      );
    } else {
      setError('Geolocation not supported');
      setUserLocation({ latitude: defaultCenter[0], longitude: defaultCenter[1] });
    }
  };

  const fetchNearbySlots = async () => {
    if (!userLocation) return;

    try {
      setLoading(true);
      const response = await api.get(`${PARKING_API}/nearby`, {
        params: {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          radius: searchRadius
        }
      });

      if (response.data.success) {
        setNearbySlots(response.data.nearbySlots || []);
      }
    } catch (error) {
      console.error('Error fetching nearby slots:', error);
      setError('Failed to fetch nearby parking slots');
    } finally {
      setLoading(false);
    }
  };

  const handleSlotClick = (slotData) => {
    if (!slotData.slot.isOccupied && slotData.slot.isAvailable) {
      onSlotSelect(slotData.slot);
    }
  };

  const mapCenter = userLocation 
    ? [userLocation.latitude, userLocation.longitude]
    : defaultCenter;

  if (loading && !userLocation) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '0 auto 20px' }}></div>
        <p>Loading map...</p>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {error && (
        <div style={{
          padding: '12px',
          background: '#fed7d7',
          color: '#742a2a',
          borderRadius: '8px',
          marginBottom: '16px',
          fontSize: '14px'
        }}>
          {error}
        </div>
      )}

      <div style={{
        marginBottom: '16px',
        padding: '16px',
        background: '#f7fafc',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        flexWrap: 'wrap'
      }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
            Search Radius: {searchRadius} km
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={searchRadius}
            onChange={(e) => setSearchRadius(Number(e.target.value))}
            style={{ width: '100%', cursor: 'pointer' }}
          />
        </div>
        <div style={{
          display: 'flex',
          gap: '16px',
          fontSize: '14px',
          fontWeight: '600'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '16px', height: '16px', background: '#48bb78', borderRadius: '50%' }}></div>
            <span>Available ({nearbySlots.filter(s => !s.slot.isOccupied).length})</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '16px', height: '16px', background: '#f56565', borderRadius: '50%' }}></div>
            <span>Occupied ({nearbySlots.filter(s => s.slot.isOccupied).length})</span>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, borderRadius: '12px', overflow: 'hidden', minHeight: '500px' }}>
        <MapContainer
          center={mapCenter}
          zoom={14}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <RecenterMap position={mapCenter} />

          {/* User location marker */}
          {userLocation && (
            <>
              <Marker 
                position={[userLocation.latitude, userLocation.longitude]}
                icon={userIcon}
              >
                <Popup>
                  <div style={{ textAlign: 'center' }}>
                    <strong>Your Location</strong>
                  </div>
                </Popup>
              </Marker>

              {/* Search radius circle */}
              <Circle
                center={[userLocation.latitude, userLocation.longitude]}
                radius={searchRadius * 1000}
                pathOptions={{ 
                  color: '#667eea', 
                  fillColor: '#667eea',
                  fillOpacity: 0.1
                }}
              />
            </>
          )}

          {/* Parking slot markers */}
          {nearbySlots.map((slotData, index) => (
            <Marker
              key={index}
              position={[slotData.slot.latitude, slotData.slot.longitude]}
              icon={slotData.slot.isOccupied ? occupiedIcon : availableIcon}
              eventHandlers={{
                click: () => handleSlotClick(slotData)
              }}
            >
              <Popup>
                <div style={{ minWidth: '200px' }}>
                  <h3 style={{ 
                    margin: '0 0 12px 0', 
                    fontSize: '16px', 
                    fontWeight: '700',
                    color: slotData.slot.isOccupied ? '#f56565' : '#48bb78'
                  }}>
                    Slot #{slotData.slot.slotNumber}
                  </h3>
                  
                  <div style={{ fontSize: '13px', marginBottom: '8px' }}>
                    <div style={{ marginBottom: '6px' }}>
                      <strong>Type:</strong> {slotData.slot.slotType}
                    </div>
                    <div style={{ marginBottom: '6px' }}>
                      <strong>Location:</strong> {slotData.slot.locationName}
                    </div>
                    <div style={{ marginBottom: '6px' }}>
                      <strong>Distance:</strong> {slotData.distance} km
                    </div>
                    <div style={{ marginBottom: '6px' }}>
                      <strong>Address:</strong> {slotData.slot.address}
                    </div>
                    <div>
                      <strong>Status:</strong>{' '}
                      <span style={{ 
                        color: slotData.slot.isOccupied ? '#f56565' : '#48bb78',
                        fontWeight: '700'
                      }}>
                        {slotData.slot.isOccupied ? 'OCCUPIED' : 'AVAILABLE'}
                      </span>
                    </div>
                  </div>

                  {!slotData.slot.isOccupied && slotData.slot.isAvailable && (
                    <button
                      onClick={() => handleSlotClick(slotData)}
                      style={{
                        width: '100%',
                        padding: '10px',
                        background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        marginTop: '12px'
                      }}
                    >
                      Select This Slot
                    </button>
                  )}

                  {selectedSlot?.id === slotData.slot.id && (
                    <div style={{
                      marginTop: '12px',
                      padding: '8px',
                      background: '#ebf4ff',
                      borderRadius: '6px',
                      textAlign: 'center',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#667eea'
                    }}>
                      ✓ Selected
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {nearbySlots.length === 0 && !loading && (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          color: '#a0aec0',
          marginTop: '20px'
        }}>
          <p>No parking slots found within {searchRadius} km</p>
          <p style={{ fontSize: '14px' }}>Try increasing the search radius</p>
        </div>
      )}
    </div>
  );
};

export default ParkingMap;