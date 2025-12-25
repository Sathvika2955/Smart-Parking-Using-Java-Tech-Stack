import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import UserSidebar from './UserSidebar';
import MyBookings from './MyBookings';
import ParkVehicle from './ParkVehicle';
import ViewSlots from './ViewSlots';
import './User.css';

const UserDashboard = ({ user, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="dashboard-container">
      <UserSidebar 
        user={user} 
        isOpen={sidebarOpen} 
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onLogout={onLogout}
      />
      <div className={`dashboard-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <Routes>
          <Route path="/" element={<Navigate to="/user/my-bookings" />} />
          <Route path="/my-bookings" element={<MyBookings user={user} />} />
          <Route path="/park-vehicle" element={<ParkVehicle user={user} />} />
          <Route path="/view-slots" element={<ViewSlots user={user} />} />
        </Routes>
      </div>
    </div>
  );
};

export default UserDashboard;