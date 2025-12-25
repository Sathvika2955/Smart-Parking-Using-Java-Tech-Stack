import { RAZORPAY_KEY } from '../utils/constants';

export const initiatePayment = (amount, bookingDetails, onSuccess, onFailure) => {
  const options = {
    key: RAZORPAY_KEY,
    amount: amount * 100, // Convert to paise
    currency: 'INR',
    name: 'Smart Parking System',
    description: `Booking #${bookingDetails.bookingNumber}`,
    image: '/logo.png', // Add your logo
    handler: function (response) {
      console.log('Payment Success:', response);
      onSuccess({
        paymentId: response.razorpay_payment_id,
        bookingNumber: bookingDetails.bookingNumber,
        amount: amount
      });
    },
    prefill: {
      name: bookingDetails.ownerName,
      email: bookingDetails.email || '',
      contact: bookingDetails.phoneNumber
    },
    notes: {
      booking_id: bookingDetails.bookingNumber,
      vehicle_number: bookingDetails.vehicleNumber,
      slot_number: bookingDetails.slotNumber
    },
    theme: {
      color: '#667eea'
    },
    modal: {
      ondismiss: function() {
        onFailure('Payment cancelled by user');
      }
    }
  };

  const rzp = new window.Razorpay(options);
  
  rzp.on('payment.failed', function (response) {
    console.log('Payment Failed:', response.error);
    onFailure(response.error.description);
  });

  rzp.open();
};

export const verifyPayment = async (paymentId, bookingId) => {
  // Call your backend to verify payment
  // This is a placeholder - implement actual verification
  return {
    success: true,
    verified: true
  };
};