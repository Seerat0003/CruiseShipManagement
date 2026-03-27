import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navigation.css';

const Navigation = ({ loggedIn, setLoggedIn }) => {
  // State for visibility of  dropdown menu
  const [voyagerDropdownOpen, setVoyagerDropdownOpen] = useState(false);
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false);
  const [managerDropdownOpen, setManagerDropdownOpen] = useState(false);
  const [headcookDropdownOpen, setHeadcookDropdownOpen] = useState(false);
  const [supervisorDropdownOpen, setSupervisorDropdownOpen] = useState(false);

  // Ref to clicks outside the dropdown closing 
  const voyagerRef = useRef(null);
  const adminRef = useRef(null);
  const managerRef = useRef(null);
  const headcookRef = useRef(null);
  const supervisorRef = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    // Handle to detect clicks outside any dropdown to close them
    function handleClickOutside(event) {
      if (voyagerRef.current && !voyagerRef.current.contains(event.target)) {
        console.log('Click outside Voyager dropdown detected, closing Voyager menu.');
        setVoyagerDropdownOpen(false);
      }
      if (adminRef.current && !adminRef.current.contains(event.target)) {
        console.log('Click outside Admin dropdown detected, closing Admin menu.');
        setAdminDropdownOpen(false);
      }
      if (managerRef.current && !managerRef.current.contains(event.target)) {
        console.log('Click outside Manager dropdown detected, closing Manager menu.');
        setManagerDropdownOpen(false);
      }
      if (headcookRef.current && !headcookRef.current.contains(event.target)) {
        console.log('Click outside Head Cook dropdown detected, closing Head Cook menu.');
        setHeadcookDropdownOpen(false);
      }
      if (supervisorRef.current && !supervisorRef.current.contains(event.target)) {
        console.log('Click outside Supervisor dropdown detected, closing Supervisor menu.');
        setSupervisorDropdownOpen(false);
      }
    }

    // Attach event listener on mount
    document.addEventListener('mousedown', handleClickOutside);
    console.log('Added event listener for outside clicks to close dropdowns.');

    // Clean up event listener on unmount
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      console.log('Removed event listener for outside clicks.');
    };
  }, []);

  // Logout handle
  const handleLogout = () => {
    console.log('Logging out user...');
    setLoggedIn(false);
    navigate('/admin/login');
  };

  return (
    <nav className="navbar">
      {/* Brand Name */}
      <div className="navbar-brand">
        <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>
          Ship Management
        </Link>
      </div>

      {/* Conditional rendering, shows nav links only if logged in */}
      {loggedIn && (
        <div className="nav-links">

          {/* Voyager Dropdown */}
          <div className="nav-dropdown" ref={voyagerRef}>
            <span
              className="nav-link"
              onClick={() => {
                console.log('Voyager menu toggle clicked.');
                setVoyagerDropdownOpen(!voyagerDropdownOpen);
                // Close other dropdowns
                setAdminDropdownOpen(false);
                setManagerDropdownOpen(false);
                setHeadcookDropdownOpen(false);
                setSupervisorDropdownOpen(false);
              }}
              style={{ userSelect: 'none' }}
            >
              Voyager ▾
            </span>
            {voyagerDropdownOpen && (
              <ul className="dropdown-menu">
                <li><Link to="/voyager/party" onClick={() => setVoyagerDropdownOpen(false)}>Book Party Hall</Link></li>
                <li><Link to="/voyager/resort" onClick={() => setVoyagerDropdownOpen(false)}>Book Resort/Movie</Link></li>
                <li><Link to="/voyager/fitness" onClick={() => setVoyagerDropdownOpen(false)}>Book Fitness Center</Link></li>
                <li><Link to="/voyager/beauty" onClick={() => setVoyagerDropdownOpen(false)}>Book Beauty Salon</Link></li>
                <li><Link to="/voyager/catering" onClick={() => setVoyagerDropdownOpen(false)}>Order Catering Items</Link></li>
                <li><Link to="/voyager/stationery" onClick={() => setVoyagerDropdownOpen(false)}>Order Stationery Items</Link></li>
              </ul>
            )}
          </div>

          {/* Admin Dropdown */}
          <div className="nav-dropdown" ref={adminRef}>
            <span
              className="nav-link"
              onClick={() => {
                console.log('Admin menu toggle clicked.');
                setAdminDropdownOpen(!adminDropdownOpen);
                // Close other dropdowns
                setVoyagerDropdownOpen(false);
                setManagerDropdownOpen(false);
                setHeadcookDropdownOpen(false);
                setSupervisorDropdownOpen(false);
              }}
              style={{ userSelect: 'none' }}
            >
              Admin ▾
            </span>
            {adminDropdownOpen && (
              <ul className="dropdown-menu">
                <li><Link to="/admin/login" onClick={() => setAdminDropdownOpen(false)}>Admin Login</Link></li>
                <li><Link to="/admin/signup" onClick={() => setAdminDropdownOpen(false)}>Admin Signup</Link></li>
                <li><Link to="/admin/manage" onClick={() => setAdminDropdownOpen(false)}>Manage Items</Link></li>
                <li><Link to="/admin/voyager" onClick={() => setAdminDropdownOpen(false)}>Voyager Registration</Link></li>
              </ul>
            )}
          </div>

          {/* Manager Dropdown */}
          <div className="nav-dropdown" ref={managerRef}>
            <span
              className="nav-link"
              onClick={() => {
                console.log('Manager menu toggle clicked.');
                setManagerDropdownOpen(!managerDropdownOpen);
                // Close other dropdowns
                setVoyagerDropdownOpen(false);
                setAdminDropdownOpen(false);
                setHeadcookDropdownOpen(false);
                setSupervisorDropdownOpen(false);
              }}
              style={{ userSelect: 'none' }}
            >
              Manager ▾
            </span>
            {managerDropdownOpen && (
              <ul className="dropdown-menu">
                <li><Link to="/manager/viewparty" onClick={() => setManagerDropdownOpen(false)}>View Booked Party Halls</Link></li>
                <li><Link to="/manager/viewsalon" onClick={() => setManagerDropdownOpen(false)}>View Booked Beauty Salon</Link></li>
                <li><Link to="/manager/viewresort" onClick={() => setManagerDropdownOpen(false)}>View Booked Resort and Movie Tickets</Link></li>
                <li><Link to="/manager/viewfitness" onClick={() => setManagerDropdownOpen(false)}>View Booked Fitness</Link></li>
                <li><Link to="/manager/viewcatering" onClick={() => setManagerDropdownOpen(false)}>View Booked Catering Foods</Link></li>
                <li><Link to="/manager/viewstationery" onClick={() => setManagerDropdownOpen(false)}>View Booked Stationery Items</Link></li>
              </ul>
            )}
          </div>

          {/* Head Cook Dropdown */}
          <div className="nav-dropdown" ref={headcookRef}>
            <span
              className="nav-link"
              onClick={() => {
                console.log('Head Cook menu toggle clicked.');
                setHeadcookDropdownOpen(!headcookDropdownOpen);
                // Close other dropdowns
                setVoyagerDropdownOpen(false);
                setAdminDropdownOpen(false);
                setManagerDropdownOpen(false);
                setSupervisorDropdownOpen(false);
              }}
              style={{ userSelect: 'none' }}
            >
              Head Cook ▾
            </span>
            {headcookDropdownOpen && (
              <ul className="dropdown-menu">
                <li><Link to="/manager/viewcatering" onClick={() => setHeadcookDropdownOpen(false)}>View Catering Foods</Link></li>
              </ul>
            )}
          </div>

          {/* Supervisor Dropdown */}
          <div className="nav-dropdown" ref={supervisorRef}>
            <span
              className="nav-link"
              onClick={() => {
                console.log('Supervisor menu toggle clicked.');
                setSupervisorDropdownOpen(!supervisorDropdownOpen);
                // Close other dropdowns
                setVoyagerDropdownOpen(false);
                setAdminDropdownOpen(false);
                setManagerDropdownOpen(false);
                setHeadcookDropdownOpen(false);
              }}
              style={{ userSelect: 'none' }}
            >
              Supervisor ▾
            </span>
            {supervisorDropdownOpen && (
              <ul className="dropdown-menu">
                <li><Link to="/manager/viewstationery" onClick={() => setSupervisorDropdownOpen(false)}>View Booked Stationery Items</Link></li>
              </ul>
            )}
          </div>

          {/* Logout Link */}
          <span
            className="nav-link logout-link"
            onClick={handleLogout}
            style={{ cursor: 'pointer' }}
          >
            Logout
          </span>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
