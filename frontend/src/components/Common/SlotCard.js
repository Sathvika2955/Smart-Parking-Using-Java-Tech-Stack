import React from 'react';
import { FaCar, FaMotorcycle, FaTruck } from 'react-icons/fa';
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
    if (slot.isOccupied) {
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
    if (!slot.isOccupied && slot.isAvailable && onSelect) {
      onSelect(slot);
    }
  };

  return (
    <div className={getSlotClass()} onClick={handleClick}>
      <div className="slot-number">#{slot.slotNumber}</div>
      <div className="slot-icon">{getVehicleIcon()}</div>
      <div className="slot-type">{slot.slotType}</div>
      {slot.isOccupied && slot.currentBooking && (
        <div className="slot-vehicle-info">
          <div className="slot-vehicle-number">
            {slot.currentBooking.vehicle.licensePlate}
          </div>
        </div>
      )}
      {!slot.isOccupied && slot.isAvailable && (
        <div className="slot-status">AVAILABLE</div>
      )}
      {selected && <div className="slot-selected-badge">SELECTED</div>}
    </div>
  );
};

export default SlotCard;