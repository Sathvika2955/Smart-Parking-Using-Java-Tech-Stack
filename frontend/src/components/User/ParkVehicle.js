import React, { useState, useEffect } from 'react';
import { FaCar, FaIdCard, FaPhone, FaMapMarkerAlt, FaMoneyBillWave, FaCreditCard, FaCheck, FaClock } from 'react-icons/fa';
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
    upiId: '',
    startTime: '',     // ✅ NEW
    endTime: ''        // ✅ NEW
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
  const [estimatedFee, setEstimatedFee] = useState(null); // ✅ NEW

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

  // ✅ NEW: Calculate fee when times change
  useEffect(() => {
    if (formData.startTime && formData.endTime) {
      calculateEstimatedFee();
    } else {
      setEstimatedFee(null);
    }
  }, [formData.startTime, formData.endTime, formData.vehicleType]);

  const fetchSlots = async () => {
    try {
      const response = await api.get(`${PARKING_API}/slots`);
      setSlots(response.data);
    } catch (error) {
      showNotification('Failed to fetch slots', 'error');
    }
  };

  // ✅ NEW: Calculate estimated fee
  const calculateEstimatedFee = () => {
    const start = new Date(formData.startTime);
    const end = new Date(formData.endTime);
    
    if (end <= start) {
      setEstimatedFee(null);
      return;
    }

    const durationMs = end - start;
    const minutes = Math.floor(durationMs / (1000 * 60));
    const hours = Math.ceil(minutes / 60); // Round up
    
    const vehicleTypeData = VEHICLE_TYPES.find(v => v.value === formData.vehicleType);
    const ratePerHour = vehicleTypeData ? vehicleTypeData.rate : 20;
    
    const baseFee = hours * ratePerHour;
    const tax = baseFee * 0.18;
    const total = baseFee + tax;

    setEstimatedFee({
      minutes,
      hours,
      ratePerHour,
      baseFee: baseFee.toFixed(2),
      tax: tax.toFixed(2),
      total: total.toFixed(2)
    });
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

    // ✅ NEW: Validate times
    if (!formData.startTime || !formData.endTime) {
      showNotification('Please select start and end time', 'error');
      return;
    }

    const start = new Date(formData.startTime);
    const end = new Date(formData.endTime);

    if (end <= start) {
      showNotification('End time must be after start time', 'error');
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
      const advanceAmount = estimatedFee ? estimatedFee.total : vehicleTypeData.rate;

      const parkingResponse = await api.post(`${PARKING_API}/park`, {
        ...formData,
        userId: user.id,
        slotNumber: selectedSlot.slotNumber,
        location: userLocation,
        startTime: formData.startTime,  // ✅ SEND TO BACKEND
        endTime: formData.endTime        // ✅ SEND TO BACKEND
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
          amount: advanceAmount,
          startTime: formData.startTime,   // ✅ INCLUDE
          endTime: formData.endTime         // ✅ INCLUDE
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
      const advanceAmount = estimatedFee ? estimatedFee.total : vehicleTypeData.rate;

      const requestData = {
        licensePlate: formData.licensePlate,
        vehicleType: formData.vehicleType,
        ownerName: formData.ownerName,
        phoneNumber: formData.phoneNumber,
        userId: user.id,
        slotNumber: selectedSlot.slotNumber,
        paymentMethod: 'online',
        upiId: formData.upiId,
        startTime: formData.startTime,  // ✅ SEND TO BACKEND
        endTime: formData.endTime        // ✅ SEND TO BACKEND
      };

      const parkingResponse = await api.post(`${PARKING_API}/park`, requestData);

      if (parkingResponse.data && parkingResponse.data.success) {
        setTimeout(() => {
          const details = {
            bookingNumber: parkingResponse.data.bookingNumber,
            vehicleNumber: formData.licensePlate,
            slotNumber: selectedSlot.slotNumber,
            ownerName: formData.ownerName,
            phoneNumber: formData.phoneNumber,
            email: user.email,
            paymentMethod: `UPI (${formData.upiId})`,
            amount: advanceAmount,
            startTime: formData.startTime,  // ✅ INCLUDE
            endTime: formData.endTime        // ✅ INCLUDE
          };

          setShowUpiModal(false);
          setBookingDetails(details);
          setShowSuccess(true);
          fetchSlots();
          setLoading(false);
        }, 2000);
      } else {
        const errorMessage = parkingResponse.data?.message || 'Failed to park vehicle';
        showNotification(errorMessage, 'error');
        setLoading(false);
      }
    } catch (error) {
      console.error('Payment error:', error);
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
      upiId: '',
      startTime: '',
      endTime: ''
    });
    setEstimatedFee(null);
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const getAvailableSlots = () => {
    return slots.filter(slot => !slot.isOccupied && slot.isAvailable);
  };

  // ✅ NEW: Get minimum datetime
  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5);
    return now.toISOString().slice(0, 16);
  };

  // ✅ NEW: Get minimum end time
  const getMinEndTime = () => {
    if (!formData.startTime) return getMinDateTime();
    const start = new Date(formData.startTime);
    start.setMinutes(start.getMinutes() + 30);
    return start.toISOString().slice(0, 16);
  };

  // ✅ NEW: Format date time for display
  const formatDateTime = (dateTime) => {
    if (!dateTime) return '';
    return new Date(dateTime).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
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
              {/* ✅ NEW: Show start/end times */}
              {bookingDetails.startTime && (
                <div className="summary-row">
                  <span>Start Time:</span>
                  <strong>{formatDateTime(bookingDetails.startTime)}</strong>
                </div>
              )}
              {bookingDetails.endTime && (
                <div className="summary-row">
                  <span>End Time:</span>
                  <strong>{formatDateTime(bookingDetails.endTime)}</strong>
                </div>
              )}
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
                  ₹{estimatedFee ? estimatedFee.total : (VEHICLE_TYPES.find(v => v.value === formData.vehicleType)?.rate || 20)}
                </div>
                <div className="amount-details">
                  {estimatedFee ? `${estimatedFee.hours} Hours` : '1 Hour Advance Payment'}
                </div>
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
        <p className="page-subtitle">Select a slot and schedule your parking</p>
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

              {/* ✅ NEW: Start Time */}
              <div className="form-group">
                <label className="form-label">
                  <FaClock /> Start Time *
                </label>
                <input
                  type="datetime-local"
                  name="startTime"
                  className="form-input"
                  value={formData.startTime}
                  onChange={handleChange}
                  min={getMinDateTime()}
                  required
                />
              </div>

              {/* ✅ NEW: End Time */}
              <div className="form-group">
                <label className="form-label">
                  <FaClock /> End Time *
                </label>
                <input
                  type="datetime-local"
                  name="endTime"
                  className="form-input"
                  value={formData.endTime}
                  onChange={handleChange}
                  min={getMinEndTime()}
                  required
                />
              </div>

              {/* ✅ NEW: Fee Estimate */}
              {estimatedFee && (
                <div className="fee-estimate-card">
                  <h4><FaMoneyBillWave /> Estimated Fee</h4>
                  <div className="fee-details">
                    <div className="fee-row">
                      <span>Duration:</span>
                      <span>{estimatedFee.minutes} mins ({estimatedFee.hours} hrs)</span>
                    </div>
                    <div className="fee-row">
                      <span>Rate:</span>
                      <span>₹{estimatedFee.ratePerHour}/hour</span>
                    </div>
                    <div className="fee-row">
                      <span>Base Fee:</span>
                      <span>₹{estimatedFee.baseFee}</span>
                    </div>
                    <div className="fee-row">
                      <span>Tax (18% GST):</span>
                      <span>₹{estimatedFee.tax}</span>
                    </div>
                    <div className="fee-row fee-total">
                      <span>Total Amount:</span>
                      <strong>₹{estimatedFee.total}</strong>
                    </div>
                  </div>
                </div>
              )}

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
                disabled={loading || !selectedSlot || !estimatedFee}
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