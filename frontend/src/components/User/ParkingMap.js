import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import api from '../../services/api';
import { PARKING_API } from '../../utils/constants';

/* =========================
   UTF-8 SAFE BASE64 HELPER
========================= */
const utf8ToBase64 = (str) => btoa(unescape(encodeURIComponent(str)));

// Fix Leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

/* =========================
   CUSTOM ICONS
========================= */

const availableIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + utf8ToBase64(`
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
  iconUrl: 'data:image/svg+xml;base64,' + utf8ToBase64(`
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42">
      <path fill="#f56565" d="M16 0C7.2 0 0 7.2 0 16c0 12 16 26 16 26s16-14 16-26c0-8.8-7.2-16-16-16z"/>
      <text x="16" y="22" font-size="16" fill="white" text-anchor="middle" font-weight="bold">P</text>
    </svg>
  `),
  iconSize: [32, 42],
  iconAnchor: [16, 42],
  popupAnchor: [0, -42]
});

const maintenanceIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + utf8ToBase64(`
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42">
      <path fill="#f59e0b" d="M16 0C7.2 0 0 7.2 0 16c0 12 16 26 16 26s16-14 16-26c0-8.8-7.2-16-16-16z"/>
      <text x="16" y="22" font-size="16" fill="white" text-anchor="middle" font-weight="bold">🔧</text>
    </svg>
  `),
  iconSize: [32, 42],
  iconAnchor: [16, 42],
  popupAnchor: [0, -42]
});

const userIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + utf8ToBase64(`
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42">
      <path fill="#667eea" d="M16 0C7.2 0 0 7.2 0 16c0 12 16 26 16 26s16-14 16-26c0-8.8-7.2-16-16-16z"/>
      <circle cx="16" cy="16" r="8" fill="white"/>
    </svg>
  `),
  iconSize: [32, 42],
  iconAnchor: [16, 42],
  popupAnchor: [0, -42]
});

/* =========================
   MAP RECENTER COMPONENT
========================= */
function RecenterMap({ position }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.setView(position, 14);
    }
  }, [position, map]);

  return null;
}

/* =========================
   MAIN COMPONENT
========================= */
const ParkingMap = ({ onSlotSelect, selectedSlot }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [nearbySlots, setNearbySlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchRadius, setSearchRadius] = useState(5);
  const [error, setError] = useState('');

  const defaultCenter = [16.9891, 82.2475];

  useEffect(() => {
    getUserLocation();
  }, []);

  useEffect(() => {
    if (userLocation) fetchNearbySlots();
  }, [userLocation, searchRadius]);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude
          });
          setError('');
        },
        () => {
          setError('Unable to get location. Showing default area.');
          setUserLocation({ latitude: defaultCenter[0], longitude: defaultCenter[1] });
        }
      );
    } else {
      setError('Geolocation not supported');
      setUserLocation({ latitude: defaultCenter[0], longitude: defaultCenter[1] });
    }
  };

  const fetchNearbySlots = async () => {
    try {
      setLoading(true);
      const res = await api.get(`${PARKING_API}/nearby`, {
        params: {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          radius: searchRadius
        }
      });
      if (res.data.success) setNearbySlots(res.data.nearbySlots || []);
    } catch {
      setError('Failed to fetch nearby parking slots');
    } finally {
      setLoading(false);
    }
  };

  const handleSlotClick = (slotData) => {
    if (!slotData.slot.isOccupied && slotData.slot.isAvailable && !slotData.slot.isUnderMaintenance) {
      onSlotSelect(slotData.slot);
    }
  };

  const mapCenter = userLocation
    ? [userLocation.latitude, userLocation.longitude]
    : defaultCenter;

  return (
    <div style={{ height: '100%' }}>
      <MapContainer center={mapCenter} zoom={14} style={{ height: '500px', width: '100%' }}>
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <RecenterMap position={mapCenter} />

        {userLocation && (
          <>
            <Marker position={mapCenter} icon={userIcon}>
              <Popup>Your Location</Popup>
            </Marker>
            <Circle
              center={mapCenter}
              radius={searchRadius * 1000}
              pathOptions={{ color: '#667eea', fillOpacity: 0.1 }}
            />
          </>
        )}

        {nearbySlots.map((slotData, i) => {
          const icon = slotData.slot.isUnderMaintenance
            ? maintenanceIcon
            : slotData.slot.isOccupied
            ? occupiedIcon
            : availableIcon;

          return (
            <Marker
              key={i}
              position={[slotData.slot.latitude, slotData.slot.longitude]}
              icon={icon}
              eventHandlers={{ click: () => handleSlotClick(slotData) }}
            >
              <Popup>
                <strong>Slot #{slotData.slot.slotNumber}</strong><br />
                {slotData.slot.locationName}<br />
                Status: {slotData.slot.isUnderMaintenance
                  ? 'UNDER MAINTENANCE'
                  : slotData.slot.isOccupied
                  ? 'OCCUPIED'
                  : 'AVAILABLE'}
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default ParkingMap;
