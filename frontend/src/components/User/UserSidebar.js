import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaClock, FaParking, FaEye, FaSignOutAlt, FaBars, FaTimes, FaUser } from 'react-icons/fa';
import './User.css';

const UserSidebar = ({ user, isOpen, onToggle, onLogout }) => {
  return (
    <>
      <button className="sidebar-toggle" onClick={onToggle}>
        {isOpen ? <FaTimes /> : <FaBars />}
      </button>
      
      <div className={`sidebar user-sidebar ${isOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <FaParking />
            {isOpen && <span>Smart Parking</span>}
          </div>
          {isOpen && (
            <div className="sidebar-user">
              <div className="user-avatar">
                <FaUser />
              </div>
              <div className="user-info">
                <div className="user-name">{user.fullName}</div>
                <div className="user-role">Customer</div>
              </div>
            </div>
          )}
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/user/my-bookings" className="sidebar-link">
            <FaClock />
            {isOpen && <span>My Bookings</span>}
          </NavLink>
          <NavLink to="/user/park-vehicle" className="sidebar-link">
            <FaParking />
            {isOpen && <span>Park Vehicle</span>}
          </NavLink>
          <NavLink to="/user/view-slots" className="sidebar-link">
            <FaEye />
            {isOpen && <span>View Slots</span>}
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

export default UserSidebar;