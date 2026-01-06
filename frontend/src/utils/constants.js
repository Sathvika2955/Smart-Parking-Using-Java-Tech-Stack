// API Configuration
export const API_BASE_URL = 'http://localhost:8080/api';

// API Endpoints - DON'T include baseURL here!
export const AUTH_API = '/auth';  // Will become /api/auth
export const PARKING_API = '/parking';  // Will become /api/parking
export const SLOTS_API = '/slots';  // Will become /api/slots

// Storage Keys
export const STORAGE_KEYS = {
  USER: 'parking_user',
  TOKEN: 'parking_token'
};

// Vehicle Types
export const VEHICLE_TYPES = [
  { value: 'BIKE', label: '🏍️ Bike', rate: 10 },
  { value: 'CAR', label: '🚗 Car', rate: 20 },
  { value: 'SUV', label: '🚙 SUV', rate: 30 },
  { value: 'TRUCK', label: '🚚 Truck', rate: 50 }
];

// Slot Types
export const SLOT_TYPES = [
  { value: 'SMALL', label: 'Small (Bike/Scooter)' },
  { value: 'MEDIUM', label: 'Medium (Car)' },
  { value: 'LARGE', label: 'Large (SUV/Truck)' }
];