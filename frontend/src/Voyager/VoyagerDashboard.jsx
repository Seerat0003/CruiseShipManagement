import React, { useEffect } from 'react';
import { useQuery } from '@apollo/client/react';
import './VoyagerDashboard.css';
import '../Home.css'; // to reuse the luxury-card styles
import { useNavigate } from 'react-router-dom';
import medImg from '../assets/med.png';
import caribImg from '../assets/caribbean.png';
import alaskaImg from '../assets/alaska.png';
import { VOYAGER_DASHBOARD_QUERY } from '../graphql/operations';

const VoyagerDashboard = () => {
  const navigate = useNavigate();
  const { data, loading, error, refetch } = useQuery(VOYAGER_DASHBOARD_QUERY, {
    fetchPolicy: 'cache-and-network',
  });

  useEffect(() => {
    const handleRefresh = () => {
      refetch();
    };

    window.addEventListener('REFRESH_USER_BOOKINGS', handleRefresh);
    return () => window.removeEventListener('REFRESH_USER_BOOKINGS', handleRefresh);
  }, [refetch]);

  const getBookingRoute = (category) => {
    if (category === "Spa" || category === "Beauty") return '/voyager/beauty';
    if (category === "Gym") return '/voyager/fitness';
    if (category === "Dining" || category === "Party") return '/voyager/party';
    if (category === "Entertainment") return '/voyager/resort';
    return '/voyager/party';
  };

  const handleBookClick = (service) => {
    navigate(getBookingRoute(service.category), {
      state: {
        selectedServiceId: service.id,
        selectedServiceName: service.name,
      },
    });
  };

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : { name: "Guest" };
  const cruises = data?.cruises ?? [];
  const services = data?.services ?? [];
  const myBookings = data?.me?.bookings ?? [];

  if (loading && !data) {
    return <div className="voyager-dashboard"><p style={{ color: '#fff', padding: '2rem' }}>Loading dashboard...</p></div>;
  }

  if (error) {
    return <div className="voyager-dashboard"><p style={{ color: '#fff', padding: '2rem' }}>{error.message}</p></div>;
  }

  return (
    <div className="voyager-dashboard">
      <div className="dashboard-hero">
        <div className="dashboard-hero-content">
          <h1>Welcome back, <span>{user.name.split(' ')[0]}</span></h1>
          <p className="subtitle" style={{ color: 'rgba(255,255,255,0.7)', maxWidth: '600px', margin: '0 auto', fontSize: '1.2rem'}}>
            Manage your personal reservations and discover new premier experiences exclusively available to you.
          </p>
        </div>
      </div>

      <div className="my-reservations">
        <h2 style={{color: '#f7d6a5', fontSize: '2rem', marginBottom: '1.5rem'}}>My Personal Itinerary</h2>
        {myBookings.length > 0 ? (
          <table className="res-table">
            <thead>
              <tr>
                <th>Booking Ref #</th>
                <th>Time / Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {myBookings.map(b => (
                <tr key={b.id}>
                  <td>VOY-{b.id}BOK</td>
                  <td>{new Date(b.start_time || Date.now()).toLocaleString()}</td>
                  <td><span style={{ color: '#51cf66', fontWeight: 600 }}>{b.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ color: 'rgba(255,255,255,0.7)' }}>No upcoming reservations. Select an experience below to begin your journey!</p>
        )}
      </div>

      <div className="home-section" id="booking">
        <h2>Available Excursions</h2>
        <p className="subtitle">Discover breathtaking destinations with our handpicked itineraries. Slots are selling out safely to verified voyagers.</p>
        
        <div className="card-grid">
          {cruises.map(cruise => {
            let imgSource = alaskaImg;
            if(cruise.image_url.includes('med')) imgSource = medImg;
            if(cruise.image_url.includes('carib')) imgSource = caribImg;

            return (
              <div className="luxury-card" key={cruise.id}>
                <div className="card-image-wrapper">
                   <img src={imgSource} alt={cruise.name} />
                </div>
                <div>
                  <h3>{cruise.name}</h3>
                  <span className="card-meta">{cruise.duration_days} Days Excursion</span>
                  <div className="card-details">
                    <span><strong>Voyage Map:</strong> {cruise.route}</span>
                    <span><strong>Departure:</strong> {new Date(cruise.start_date).toLocaleDateString()}</span>
                    <span style={{color: cruise.available_seats < 100 ? '#ff6b6b' : '#51cf66'}}>
                      <strong>Seats Remaining:</strong> {cruise.available_seats} / {cruise.total_seats}
                    </span>
                  </div>
                </div>
                <div className="card-footer">
                  <span className="price">${parseFloat(cruise.price).toLocaleString()} <span className="price-small">/ pp</span></span>
                  <button className="btn-luxury" onClick={() => navigate('/voyager/resort')}>Reserve Cabin</button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="home-section" style={{ background: 'transparent' }}>
        <h2>Onboard Premium Facilities</h2>
        <p className="subtitle">Indulge in exquisite dining, rejuvenating spas, and thrilling entertainment without leaving the ship.</p>
        
        <div className="card-grid">
          {services.map(service => (
            <div className="luxury-card" key={service.id}>
              <div>
                <h3>{service.name}</h3>
                <span className="card-meta">{service.category} Experience</span>
                <div className="card-details">
                  Enjoy our bespoke offering in the {service.category} category. Fully serviced and ready to be booked for your preferred time slot.
                </div>
              </div>
              <div className="card-footer">
                <span className="price">${parseFloat(service.price).toLocaleString()} <span className="price-small">/ session</span></span>
                <button className="btn-luxury" onClick={() => handleBookClick(service)}>Reserve Slot</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VoyagerDashboard;
