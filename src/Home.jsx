import React, { useEffect, useState } from 'react';
import './Home.css';
import { Link, useNavigate } from 'react-router-dom';
import heroBg from './assets/hero-bg.png';
import aboutUsImg from './assets/about-us.png';
import facilitiesImg from './assets/facilities.png';
import medImg from './assets/med.png';
import caribbeanImg from './assets/caribbean.png';
import alaskaImg from './assets/alaska.png';

// Cute little animation counter for stats
const Counter = ({ end, duration, label }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime = null;
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = currentTime - startTime;
      const currentCount = Math.min(Math.floor((progress / duration) * end), end);
      setCount(currentCount);
      if (progress < duration) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [end, duration]);

  return (
    <div className="counter-box">
      <div className="counter-number">{count}{end >= 10 ? '+' : ''}</div>
      <div className="counter-label">{label}</div>
    </div>
  );
};

const Home = ({ loggedIn }) => {
  const navigate = useNavigate();

  const handleCTA = () => {
    if (loggedIn) {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      if(user && user.role === 'admin') navigate('/admin/dashboard');
      else navigate('/voyager/dashboard');
    } else {
      navigate('/admin/login');
    }
  };

  return (
    <div className="home-container">
      {/* HERO SECTION */}
      <div className="home-hero">
        <div className="home-bg-wrapper">
          <img src={heroBg} alt="Luxury Cruise Sunset" className="home-bg-img" />
          <div className="home-overlay"></div>
        </div>

        <div className="home-content">
          <header className="home-header">
            <h1>Experience <span>Ocean Serenity</span></h1>
            <p>
              Your ultimate maritime gateway. Manage your onboard reservations, access bespoke catering, and immerse yourself in absolute luxury.
            </p>
          </header>

          <div className="home-button-group">
            <button onClick={handleCTA} className="home-btn-primary">
              {loggedIn ? "Enter Dashboard" : "Sign In & Explore"}
            </button>
            {!loggedIn && <Link to="/admin/signup" className="home-btn-outline">Join Us</Link>}
          </div>
        </div>
      </div>

      {/* COUNTERS SECTION */}
      <div className="counter-section">
        <Counter end={120} duration={2000} label="Annual Voyages" />
        <Counter end={15} duration={2500} label="Luxury Ships" />
        <Counter end={500} duration={3000} label="Premium Facilities" />
        <Counter end={99} duration={2000} label="Satisfaction Rate (%)" />
      </div>

      {/* ABOUT US */}
      <div className="home-section" id="about">
        <div className="split-view">
          <div className="split-text">
            <h2>About Us</h2>
            <p className="subtitle" style={{textAlign: "left", marginLeft: 0}}>
              Since 2012, Ocean Serenity has redefined what it means to travel the seas. We are committed to providing the ultimate luxury experience, blending classical maritime heritage with modern cutting-edge comforts. Our ships are floating penthouses designed for the discerning traveler.
            </p>
          </div>
          <div className="split-image">
            <img src={aboutUsImg} alt="Luxury Lobby" />
          </div>
        </div>
      </div>

      {/* DESTINATIONS (PLACES WE COVER) */}
      <div className="home-section" id="destinations" style={{ background: "rgba(13, 34, 53, 0.4)" }}>
        <h2>Destinations We Cover</h2>
        <p className="subtitle">From the icy majesty of Alaska to the sun-kissed coasts of the Mediterranean.</p>
        <div className="destinations-grid">
          <div className="dest-card">
            <img src={medImg} alt="Mediterranean" />
            <div className="dest-info">
              <h3>Mediterranean Charms</h3>
            </div>
          </div>
          <div className="dest-card">
            <img src={caribbeanImg} alt="Caribbean" />
            <div className="dest-info">
              <h3>Caribbean Escapes</h3>
            </div>
          </div>
          <div className="dest-card">
            <img src={alaskaImg} alt="Alaska" />
            <div className="dest-info">
              <h3>Alaskan Frontiers</h3>
            </div>
          </div>
        </div>
      </div>

      {/* WHAT WE OFFER */}
      <div className="home-section" id="offer">
        <div className="split-view reverse">
          <div className="split-text">
            <h2>World-Class Facilities</h2>
            <p className="subtitle" style={{textAlign: "left", marginLeft: 0}}>
              Indulge yourself without limits. From panoramic ocean-facing Spas to vibrant Grand Party Halls, we offer an array of meticulously designed locations. Keep fit in our robust Fitness Centre, dine on global cuisines at our Fine Dining hall, and catch the latest releases at our onboard cinema. 
            </p>
          </div>
          <div className="split-image">
             <img src={facilitiesImg} alt="Luxury Spa" />
          </div>
        </div>
      </div>

      {/* FINAL CURVED CTA FOR UPCOMING TRIPS */}
      {!loggedIn && (
        <div className="home-cta-section">
          <h2>Ready to Embark?</h2>
          <p>Discover our upcoming itineraries and secure your spot.</p>
          <div style={{ marginTop: '3rem' }}>
            <button onClick={handleCTA} className="btn-curved-huge pulse-animation">
              Log in to view upcoming trips
            </button>
          </div>
        </div>
      )}

      {loggedIn && (
        <div className="home-cta-section">
          <h2>Your Journey Awaits</h2>
          <div style={{ marginTop: '3rem' }}>
            <button onClick={handleCTA} className="btn-curved-huge pulse-animation">
              Access the Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
