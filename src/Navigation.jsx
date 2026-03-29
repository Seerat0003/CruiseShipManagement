import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navigation.css';

const Navigation = ({ loggedIn, setLoggedIn }) => {
  const navigate = useNavigate();

  // Parse user for roles
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const isAdmin = user && user.role === 'admin';

  const handleLogout = () => {
    setLoggedIn(false);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate('/');
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-brand">
          <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>
            Ocean Serenity
          </Link>
        </div>

        <div className="nav-links">
          <Link to="/" className="nav-link" style={{ marginRight: '1rem' }}>Home</Link>
          
          {!loggedIn ? (
            <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
              <Link to="/admin/login" className="btn-luxury" style={{ padding: "8px 24px", fontSize: "0.9rem" }}>Sign In</Link>
              <Link to="/admin/signup" className="nav-link" style={{ padding: "8px 0" }}>Join</Link>
            </div>
          ) : (
            <>
              <span className="nav-link" style={{ color: '#f7d6a5' }}>Welcome, {user?.name.split(' ')[0]}</span>
              <span className="nav-link logout-link" onClick={handleLogout} style={{ cursor: 'pointer', marginLeft: '1rem' }}>Logout</span>
            </>
          )}
        </div>
      </nav>

      {/* 2ND TAB BAR FOR MENUS */}
      {loggedIn && (
        <div className="secondary-navbar">
          <div className="sec-nav-container">
            {isAdmin ? (
               <>
                  <Link to="/admin/dashboard" className="sec-nav-link">Fleet Overview</Link>
                  <Link to="/admin/manage" className="sec-nav-link">Manage Inventory</Link>
                  <Link to="/admin/voyager" className="sec-nav-link">Voyager Registry</Link>
               </>
            ) : (
               <>
                  <Link to="/voyager/dashboard" className="sec-nav-link">My Dashboard</Link>
                  <Link to="/voyager/party" className="sec-nav-link">Book Party Hall</Link>
                  <Link to="/voyager/resort" className="sec-nav-link">Book Resort/Movie</Link>
                  <Link to="/voyager/fitness" className="sec-nav-link">Book Fitness Center</Link>
                  <Link to="/voyager/beauty" className="sec-nav-link">Book Beauty Salon</Link>
                  <Link to="/voyager/catering" className="sec-nav-link">Order Catering</Link>
               </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Navigation;
