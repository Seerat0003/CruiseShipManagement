import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaShoppingCart } from 'react-icons/fa';
import './Navigation.css';
import ProfileMenu from './components/ProfileMenu';
import { useCart } from './cart/CartContext';
import { clearAuthSession, getStoredUser } from './auth/storage';

const Navigation = ({ loggedIn, setLoggedIn }) => {
  const navigate = useNavigate();
  const { totalItems } = useCart();

  // Parse user for roles
  const user = getStoredUser();
  const isAdmin = user && user.role === 'admin';
  const isManager = user && user.role === 'manager';

  const handleLogout = () => {
    clearAuthSession();
    setLoggedIn(false);
    navigate('/');
  };

  useEffect(() => {
    document.body.classList.add('has-main-nav');
    document.body.classList.toggle('has-secondary-nav', loggedIn);

    return () => {
      document.body.classList.remove('has-main-nav');
      document.body.classList.remove('has-secondary-nav');
    };
  }, [loggedIn]);

  const firstName = user?.name?.split(' ')[0] || 'Voyager';

  return (
    <>
      <nav className="navbar">
        <div className="navbar-brand">
          <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>
            Ocean Serenity
          </Link>
        </div>

        <div className="nav-links">
          <Link to="/" className="nav-link">Home</Link>
          
          {!loggedIn ? (
            <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
              <Link to="/admin/login" className="btn-luxury" style={{ padding: "8px 24px", fontSize: "0.9rem" }}>Sign In</Link>
              <Link to="/admin/signup" className="nav-link" style={{ padding: "8px 0" }}>Join</Link>
            </div>
          ) : (
            <div className="nav-user-tools">
              {!isAdmin && !isManager && (
                <Link to="/voyager/cart" className="cart-icon-btn" aria-label="Open cart">
                  <FaShoppingCart size={19} />
                  {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
                </Link>
              )}
              <ProfileMenu firstName={firstName} onLogout={handleLogout} showOrderHistory={!isAdmin && !isManager} />
            </div>
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
            ) : isManager ? (
               <>
                  <Link to="/manager/viewparty" className="sec-nav-link">Party Hall Bookings</Link>
                  <Link to="/manager/viewsalon" className="sec-nav-link">Salon Bookings</Link>
                  <Link to="/manager/viewresort" className="sec-nav-link">Entertainment Bookings</Link>
                  <Link to="/manager/viewfitness" className="sec-nav-link">Fitness Bookings</Link>
                  <Link to="/manager/viewcatering" className="sec-nav-link">Catering Requests</Link>
                  <Link to="/manager/viewstationery" className="sec-nav-link">Gear Requests</Link>
               </>
            ) : (
               <>
                  <Link to="/voyager/dashboard" className="sec-nav-link">My Dashboard</Link>
                <Link to="/voyager/catering" className="sec-nav-link">Shop Catering</Link>
                <Link to="/voyager/stationery" className="sec-nav-link">Shop Boutique & Gear</Link>
                  <Link to="/voyager/party" className="sec-nav-link">Book Party Hall</Link>
                  <Link to="/voyager/resort" className="sec-nav-link">Book Resort/Movie</Link>
                  <Link to="/voyager/fitness" className="sec-nav-link">Book Fitness Center</Link>
                  <Link to="/voyager/beauty" className="sec-nav-link">Book Beauty Salon</Link>
               </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Navigation;
