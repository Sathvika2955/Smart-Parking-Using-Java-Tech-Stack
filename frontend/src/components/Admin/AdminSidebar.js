import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaClipboardList, FaParking, FaUsers, FaSearch, FaSignOutAlt, FaBars, FaTimes, FaShieldAlt } from 'react-icons/fa';
import './Admin.css';

const AdminSidebar = ({ user, isOpen, onToggle, onLogout }) => {
  return (
    <>
      <button className="sidebar-toggle" onClick={onToggle}>
        {isOpen ? <FaTimes /> : <FaBars />}
      </button>
      
      <div className={`sidebar admin-sidebar ${isOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <FaParking />
            {isOpen && <span>Smart Parking</span>}
          </div>
          {isOpen && (
            <div className="sidebar-user">
              <div className="user-avatar admin-avatar">
                <FaShieldAlt />
              </div>
              <div className="user-info">
                <div className="user-name">{user.fullName}</div>
                <div className="user-role">Administrator</div>
              </div>
            </div>
          )}
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/admin/all-bookings" className="sidebar-link">
            <FaClipboardList />
            {isOpen && <span>All Bookings</span>}
          </NavLink>
          <NavLink to="/admin/manage-slots" className="sidebar-link">
            <FaParking />
            {isOpen && <span>Manage Slots</span>}
          </NavLink>
          <NavLink to="/admin/all-users" className="sidebar-link">
            <FaUsers />
            {isOpen && <span>All Users</span>}
          </NavLink>
          <NavLink to="/admin/search" className="sidebar-link">
            <FaSearch />
            {isOpen && <span>Search Vehicle</span>}
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-link logout-btn" onClick={onLogout}>
            <FaSignOutAlt />
            {isOpen && <span>Logout</span>}
          </button>
        </div>
      </div>
    </>
  );
};

export default AdminSidebar;