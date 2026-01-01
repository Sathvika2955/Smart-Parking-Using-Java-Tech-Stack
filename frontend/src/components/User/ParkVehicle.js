import React, { useState, useEffect } from 'react';
import { FaCar, FaIdCard, FaPhone, FaMapMarkerAlt, FaMoneyBillWave, FaCreditCard, FaCheck } from 'react-icons/fa';
import api from '../../services/api';
import { PARKING_API, VEHICLE_TYPES } from '../../utils/constants';
import SlotCard from '../Common/SlotCard';
import Notification from '../Common/Notification';
import './User.css';

const ParkVehicle = ({ user }) => {
  const [formData, setFormData] = useState({
    licensePlate: '',
    vehicleType: 'CAR',
    ownerName: user.fullName,
    phoneNumber: user.phoneNumber || '',
    paymentMethod: 'cash',
    upiId: ''
  });
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [showUpiModal, setShowUpiModal] = useState(false);

  // Get GPS location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          setLocationError('');
        },
        (error) => {
          setLocationError('Unable to get location. Showing default parking area.');
          console.error('Location error:', error);
        }
      );
    } else {
      setLocationError('Geolocation is not supported by your browser.');
    }
  }, []);

  useEffect(() => {
    fetchSlots();
    const interval = setInterval(fetchSlots, 3000);
    return () => clearInterval(interval);
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
    if (slot.isOccupied || !slot.isAvailable) {
      showNotification('This slot is already occupied', 'error');
      return;
    }
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

    // If online payment selected, show UPI modal
    if (formData.paymentMethod === 'online') {
      setShowUpiModal(true);
      return;
    }

    // Process cash payment
    processCashPayment();
  };

  const processCashPayment = async () => {
    setLoading(true);

    try {
      const vehicleTypeData = VEHICLE_TYPES.find(v => v.value === formData.vehicleType);
      const advanceAmount = vehicleTypeData.rate;

      const parkingResponse = await api.post(`${PARKING_API}/park`, {
        ...formData,
        userId: user.id,
        slotNumber: selectedSlot.slotNumber,
        location: userLocation
      });

      if (parkingResponse.data && parkingResponse.data.success) {
        const details = {
          bookingNumber: parkingResponse.data.bookingNumber,
          vehicleNumber: formData.licensePlate,
          slotNumber: selectedSlot.slotNumber,
          ownerName: formData.ownerName,
          phoneNumber: formData.phoneNumber,
          email: user.email,
          paymentMethod: 'Cash',
          amount: advanceAmount
        };

        setBookingDetails(details);
        setShowSuccess(true);
        fetchSlots();
      } else {
        const errorMessage = parkingResponse.data?.message || 'Failed to park vehicle';
        showNotification(errorMessage, 'error');
        fetchSlots();
        setSelectedSlot(null);
      }
    } catch (error) {
      console.error('Parking error:', error);
      
      if (error.response) {
        const errorMessage = error.response.data?.message || 
                            error.response.data?.error || 
                            'Vehicle is already parked or slot is occupied';
        showNotification(errorMessage, 'error');
      } else {
        showNotification('Failed to park vehicle. Please try again.', 'error');
      }
      
      fetchSlots();
      setSelectedSlot(null);
    } finally {
      setLoading(false);
    }
  };

  const handleUpiPayment = async () => {
    if (!formData.upiId || !formData.upiId.includes('@')) {
      showNotification('Please enter a valid UPI ID (e.g., abc@paytm)', 'error');
      return;
    }

    setLoading(true);

    try {
      const vehicleTypeData = VEHICLE_TYPES.find(v => v.value === formData.vehicleType);
      const advanceAmount = vehicleTypeData.rate;

      const requestData = {
        licensePlate: formData.licensePlate,
        vehicleType: formData.vehicleType,
        ownerName: formData.ownerName,
        phoneNumber: formData.phoneNumber,
        userId: user.id,
        slotNumber: selectedSlot.slotNumber,
        paymentMethod: 'online',
        upiId: formData.upiId
      };

      console.log('=== UPI PAYMENT DEBUG ===');
      console.log('API URL:', `${PARKING_API}/park`);
      console.log('Request Data:', requestData);
      console.log('User Object:', user);
      console.log('Selected Slot:', selectedSlot);
      console.log('Location:', userLocation);

      const parkingResponse = await api.post(`${PARKING_API}/park`, requestData);

      console.log('=== SUCCESS RESPONSE ===');
      console.log('Response Data:', parkingResponse.data);

      if (parkingResponse.data && parkingResponse.data.success) {
        // Simulate payment processing
        setTimeout(() => {
          const details = {
            bookingNumber: parkingResponse.data.bookingNumber,
            vehicleNumber: formData.licensePlate,
            slotNumber: selectedSlot.slotNumber,
            ownerName: formData.ownerName,
            phoneNumber: formData.phoneNumber,
            email: user.email,
            paymentMethod: `UPI (${formData.upiId})`,
            amount: advanceAmount
          };

          setShowUpiModal(false);
          setBookingDetails(details);
          setShowSuccess(true);
          fetchSlots();
          setLoading(false);
        }, 2000);
      } else {
        console.error('Backend returned success=false');
        const errorMessage = parkingResponse.data?.message || 'Failed to park vehicle';
        showNotification(errorMessage, 'error');
        setLoading(false);
      }
    } catch (error) {
      console.error('=== ERROR CAUGHT ===');
      console.error('Full Error Object:', error);
      console.error('Error Response:', error.response);
      console.error('Response Data:', error.response?.data);
      console.error('Response Status:', error.response?.status);
      console.error('Error Message:', error.message);
      
      const errorMsg = error.response?.data?.message || 
                       error.response?.data?.error ||
                       error.message ||
                       'Payment failed. Please try again.';
      
      showNotification(errorMsg, 'error');
      setLoading(false);
    }
  };

  const resetBooking = () => {
    setShowSuccess(false);
    setBookingDetails(null);
    setSelectedSlot(null);
    setShowUpiModal(false);
    setFormData({
      ...formData,
      licensePlate: '',
      upiId: ''
    });
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const getAvailableSlots = () => {
    return slots.filter(slot => !slot.isOccupied && slot.isAvailable);
  };

  // Success Screen
  if (showSuccess && bookingDetails) {
    return (
      <div className="page-container">
        <div className="success-screen">
          <div className="success-card">
            <div className="success-icon">
              <FaCheck />
            </div>
            <h2>Payment Successful!</h2>
            <p>Your parking slot has been booked</p>
            
            <div className="booking-summary">
              <div className="summary-row">
                <span>Booking Number:</span>
                <strong>{bookingDetails.bookingNumber}</strong>
              </div>
              <div className="summary-row">
                <span>Slot Number:</span>
                <strong>#{bookingDetails.slotNumber}</strong>
              </div>
              <div className="summary-row">
                <span>Vehicle:</span>
                <strong>{bookingDetails.vehicleNumber}</strong>
              </div>
              <div className="summary-row">
                <span>Payment Method:</span>
                <strong>{bookingDetails.paymentMethod}</strong>
              </div>
              <div className="summary-row">
                <span>Amount Paid:</span>
                <strong className="text-success">₹{bookingDetails.amount}</strong>
              </div>
            </div>

            <button className="btn btn-primary btn-block" onClick={resetBooking}>
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
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

      {/* UPI Payment Modal */}
      {showUpiModal && (
        <div className="modal-overlay">
          <div className="upi-modal">
            <div className="modal-header">
              <h3>Enter UPI Details</h3>
              <button className="modal-close" onClick={() => setShowUpiModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">UPI ID *</label>
                <input
                  type="text"
                  name="upiId"
                  className="form-input"
                  placeholder="e.g., yourname@paytm, yourname@gpay"
                  value={formData.upiId}
                  onChange={handleChange}
                  autoFocus
                />
                <p className="upi-hint">Supported: GPay, PhonePe, Paytm, BHIM, etc.</p>
              </div>
              
              <div className="amount-display">
                <h4>Amount to Pay</h4>
                <div className="amount-value">
                  ₹{VEHICLE_TYPES.find(v => v.value === formData.vehicleType)?.rate || 20}
                </div>
                <div className="amount-details">1 Hour Advance Payment</div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-secondary" 
                onClick={() => setShowUpiModal(false)}
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleUpiPayment}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Pay Now'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="page-header">
        <h1 className="page-title">Park Vehicle</h1>
        <p className="page-subtitle">Select a slot and park your vehicle</p>
        {userLocation && (
          <div className="location-badge">
            <FaMapMarkerAlt />
            <span>Location: Lat {userLocation.latitude.toFixed(4)}, Lon {userLocation.longitude.toFixed(4)}</span>
          </div>
        )}
        {locationError && (
          <div className="location-error">{locationError}</div>
        )}
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

              <div className="form-group">
                <label className="form-label">Payment Method *</label>
                <div className="payment-options">
                  <label className="payment-option">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash"
                      checked={formData.paymentMethod === 'cash'}
                      onChange={handleChange}
                    />
                    <FaMoneyBillWave className="payment-icon cash" />
                    <span>Cash Payment</span>
                  </label>
                  <label className="payment-option">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="online"
                      checked={formData.paymentMethod === 'online'}
                      onChange={handleChange}
                    />
                    <FaCreditCard className="payment-icon online" />
                    <span>UPI Payment</span>
                  </label>
                </div>
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
                {loading ? 'Processing...' : 'Confirm & Pay'}
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