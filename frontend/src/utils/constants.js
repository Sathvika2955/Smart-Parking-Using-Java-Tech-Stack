// API Configuration
export const API_BASE_URL = 'http://localhost:8080/api';

// ✅ API Endpoints - Just the paths, not full URLs
export const AUTH_API = '/auth';
export const PARKING_API = '/parking';
export const SLOTS_API = '/slots';

// Razorpay Configuration
export const RAZORPAY_KEY = 'rzp_test_YOUR_KEY_HERE';
export const RAZORPAY_SECRET = 'YOUR_SECRET_HERE';

// Vehicle Types
export const VEHICLE_TYPES = [
  { value: 'BIKE', label: '🏍️ Bike', rate: 10 },
  { value: 'CAR', label: '🚗 Car', rate: 20 },
  { value: 'SUV', label: '🚙 SUV', rate: 30 },
  { value: 'TRUCK', label: '🚛 Truck', rate: 50 }
];

// Slot Types
export const SLOT_TYPES = {
  SMALL: 'SMALL',
  MEDIUM: 'MEDIUM',
  LARGE: 'LARGE'
};

// User Roles
export const USER_ROLES = {
  ADMIN: 'ADMIN',
  CUSTOMER: 'CUSTOMER'
};

// Booking Status
export const BOOKING_STATUS = {
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
};

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED'
};

// Local Storage Keys
export const STORAGE_KEYS = {
  USER: 'parkingUser',
  TOKEN: 'parkingToken'
};

// Toast Messages
export const MESSAGES = {
  LOGIN_SUCCESS: 'Login successful!',
  LOGOUT_SUCCESS: 'Logged out successfully!',
  REGISTER_SUCCESS: 'Registration successful!',
  PARK_SUCCESS: 'Vehicle parked successfully!',
  REMOVE_SUCCESS: 'Vehicle removed successfully!',
  PAYMENT_SUCCESS: 'Payment completed successfully!',
  PAYMENT_FAILED: 'Payment failed. Please try again.',
  ERROR: 'Something went wrong. Please try again.'
};

// Validation Patterns
export const PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[0-9]{10}$/,
  LICENSE_PLATE: /^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$/,
  PASSWORD: /^.{6,}$/
};

// Date/Time Format
export const DATE_FORMAT = 'DD-MM-YYYY';
export const TIME_FORMAT = 'HH:mm:ss';
export const DATETIME_FORMAT = 'DD-MM-YYYY HH:mm:ss';

// Pagination
export const ITEMS_PER_PAGE = 10;

// Colors
export const COLORS = {
  PRIMARY: '#667eea',
  SECONDARY: '#764ba2',
  SUCCESS: '#48bb78',
  ERROR: '#f56565',
  WARNING: '#ed8936',
  INFO: '#4299e1',
  AVAILABLE: '#48bb78',
  OCCUPIED: '#f56565',
  UNAVAILABLE: '#a0aec0'
};