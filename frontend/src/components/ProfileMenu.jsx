import React, { useEffect, useRef, useState } from 'react';
import { FaChevronDown, FaRegUserCircle } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import './ProfileMenu.css';

const ProfileMenu = ({ firstName, onLogout, showOrderHistory = true }) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  return (
    <div
      className="profile-menu"
      ref={menuRef}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button className="profile-trigger" onClick={() => setOpen((prev) => !prev)}>
        <FaRegUserCircle size={20} />
        <span>{firstName}</span>
        <FaChevronDown size={12} className={open ? 'rotate' : ''} />
      </button>

      <div className={`profile-dropdown ${open ? 'open' : ''}`}>
        {showOrderHistory && (
          <Link to="/voyager/orders" className="profile-dropdown-item" onClick={() => setOpen(false)}>
            Order History
          </Link>
        )}
        <button className="profile-dropdown-item profile-logout-btn" onClick={onLogout}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default ProfileMenu;
