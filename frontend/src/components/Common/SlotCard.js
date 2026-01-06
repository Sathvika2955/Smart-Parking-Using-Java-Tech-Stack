import React from 'react';
import { FaCar, FaMotorcycle, FaTruck, FaTools } from 'react-icons/fa';
import './Common.css';

const SlotCard = ({ slot, onSelect, selected }) => {
  const getVehicleIcon = () => {
    switch (slot.slotType) {
      case 'SMALL':
        return <FaMotorcycle />;
      case 'MEDIUM':
        return <FaCar />;
      case 'LARGE':
        return <FaTruck />;
      default:
        return <FaCar />;
    }
  };

  const getSlotClass = () => {
    let className = 'slot-card';
    
    // ✅ NEW: Maintenance status check
    if (slot.isUnderMaintenance) {
      className += ' slot-maintenance';
    } else if (slot.isOccupied) {
      className += ' slot-occupied';
    } else if (!slot.isAvailable) {
      className += ' slot-unavailable';
    } else {
      className += ' slot-available';
    }
    
    if (selected) {
      className += ' slot-selected';
    }
    return className;
  };

  const handleClick = () => {
    // ✅ NEW: Prevent clicking maintenance slots
    if (!slot.isOccupied && slot.isAvailable && !slot.isUnderMaintenance && onSelect) {
      onSelect(slot);
    }
  };

  return (
    <div className={getSlotClass()} onClick={handleClick}>
      <div className="slot-number">#{slot.slotNumber}</div>
      
      {/* ✅ NEW: Show maintenance icon */}
      {slot.isUnderMaintenance ? (
        <div className="slot-icon maintenance-icon">
          <FaTools />
        </div>
      ) : (
        <div className="slot-icon">{getVehicleIcon()}</div>
      )}
      
      <div className="slot-type">{slot.slotType}</div>
      
      {/* ✅ NEW: Show maintenance info */}
      {slot.isUnderMaintenance && (
        <div className="slot-maintenance-info">
          <div className="maintenance-badge">UNDER MAINTENANCE</div>
          {slot.maintenanceReason && (
            <div className="maintenance-reason">{slot.maintenanceReason}</div>
          )}
        </div>
      )}
      
      {slot.isOccupied && slot.currentBooking && (
        <div className="slot-vehicle-info">
          <div className="slot-vehicle-number">
            {slot.currentBooking.vehicle.licensePlate}
          </div>
        </div>
      )}
      
      {!slot.isOccupied && slot.isAvailable && !slot.isUnderMaintenance && (
        <div className="slot-status">AVAILABLE</div>
      )}
      
      {selected && <div className="slot-selected-badge">SELECTED</div>}
    </div>
  );
};

export default SlotCard;