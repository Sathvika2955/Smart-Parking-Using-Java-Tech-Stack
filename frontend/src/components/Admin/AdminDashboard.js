import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AllBookings from './AllBookings';
import ManageSlots from './ManageSlots';
import AllUsers from './AllUsers';
import SearchVehicle from './SearchVehicle';
import './Admin.css';

const AdminDashboard = ({ user, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="dashboard-container">
      <AdminSidebar 
        user={user} 
        isOpen={sidebarOpen} 
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onLogout={onLogout}
      />
      <div className={`dashboard-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <Routes>
          <Route path="/" element={<Navigate to="/admin/all-bookings" />} />
          <Route path="/all-bookings" element={<AllBookings />} />
          <Route path="/manage-slots" element={<ManageSlots />} />
          <Route path="/all-users" element={<AllUsers />} />
          <Route path="/search" element={<SearchVehicle />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminDashboard;