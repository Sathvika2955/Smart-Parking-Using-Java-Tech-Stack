import React, { useState, useEffect } from 'react';
import { FaCar, FaIdCard, FaPhone } from 'react-icons/fa';
import api from '../../services/api';
import { PARKING_API, VEHICLE_TYPES } from '../../utils/constants';
import { initiatePayment } from '../../services/razorpay';
import SlotCard from '../Common/SlotCard';
import Notification from '../Common/Notification';
import './User.css';

const ParkVehicle = ({ user }) => {
  const [formData, setFormData] = useState({
    licensePlate: '',
    vehicleType: 'CAR',
    ownerName: user.fullName,
    phoneNumber: user.phoneNumber || ''
  });
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    try {
      const response = await api.get(`${PARKING_API}/slots`);
      setSlots(response.data);
    } catch (error) {
      showNotification('Failed to fetch slots', 'error');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.licensePlate || !formData.phoneNumber) {
      showNotification('Please fill all required fields', 'error');
      return;
    }

    if (!selectedSlot) {
      showNotification('Please select a parking slot', 'error');
      return;
    }

    setLoading(true);

    try {
      // First, create parking booking
      const parkingResponse = await api.post(`${PARKING_API}/park`, {
        ...formData,
        userId: user.id,
        slotNumber: selectedSlot.slotNumber
      });

      if (parkingResponse.data.success) {
        const bookingDetails = {
          bookingNumber: parkingResponse.data.bookingNumber,
          vehicleNumber: formData.licensePlate,
          slotNumber: selectedSlot.slotNumber,
          ownerName: formData.ownerName,
          phoneNumber: formData.phoneNumber,
          email: user.email
        };

        // Calculate advance payment (1 hour)
        const vehicleTypeData = VEHICLE_TYPES.find(v => v.value === formData.vehicleType);
        const advanceAmount = vehicleTypeData.rate;

        // Initiate Razorpay payment
        initiatePayment(
          advanceAmount,
          bookingDetails,
          (paymentResponse) => {
            // Payment success
            showNotification('Vehicle parked and payment successful!', 'success');
            setFormData({
              ...formData,
              licensePlate: ''
            });
            setSelectedSlot(null);
            fetchSlots();
          },
          (error) => {
            // Payment failed
            showNotification(`Payment failed: ${error}`, 'error');
          }
        );
      } else {
        showNotification(parkingResponse.data.message, 'error');
      }
    } catch (error) {
      showNotification('Failed to park vehicle', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const getAvailableSlots = () => {
    return slots.filter(slot => !slot.isOccupied && slot.isAvailable);
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
        <h1 className="page-title">Park Vehicle</h1>
        <p className="page-subtitle">Select a slot and park your vehicle</p>
      </div>

      <div className="park-vehicle-container">
        <div className="park-vehicle-form">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Vehicle Details</h3>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">
                  <FaIdCard /> License Plate Number *
                </label>
                <input
                  type="text"
                  name="licensePlate"
                  className="form-input"
                  placeholder="e.g., AP39CK1234"
                  value={formData.licensePlate}
                  onChange={handleChange}
                  style={{ textTransform: 'uppercase' }}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <FaCar /> Vehicle Type *
                </label>
                <select
                  name="vehicleType"
                  className="form-select"
                  value={formData.vehicleType}
                  onChange={handleChange}
                  required
                >
                  {VEHICLE_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label} - ₹{type.rate}/hour
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <FaPhone /> Phone Number *
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  className="form-input"
                  placeholder="10-digit number"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  maxLength="10"
                  required
                />
              </div>

              {selectedSlot && (
                <div className="selected-slot-info">
                  <h4>Selected Slot</h4>
                  <div className="selected-slot-details">
                    <div className="selected-slot-number">#{selectedSlot.slotNumber}</div>
                    <div className="selected-slot-type">{selectedSlot.slotType}</div>
                  </div>
                </div>
              )}

              <button 
                type="submit" 
                className="btn btn-primary btn-block"
                disabled={loading || !selectedSlot}
              >
                {loading ? 'Processing...' : 'Park & Pay'}
              </button>
            </form>
          </div>
        </div>

        <div className="slot-selection">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Select Parking Slot</h3>
              <span className="available-count">
                {getAvailableSlots().length} Available
              </span>
            </div>

            <div className="slots-grid">
              {slots.map(slot => (
                <SlotCard
                  key={slot.id}
                  slot={slot}
                  selected={selectedSlot?.id === slot.id}
                  onSelect={handleSlotSelect}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParkVehicle;