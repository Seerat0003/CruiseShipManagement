import React, { useEffect } from 'react';
import { useQuery } from '@apollo/client/react';
import './VoyagerDashboard.css';
import '../Home.css';
import { useNavigate } from 'react-router-dom';
import medImg from '../assets/med.png';
import caribImg from '../assets/caribbean.png';
import alaskaImg from '../assets/alaska.png';
import { VOYAGER_DASHBOARD_QUERY } from '../graphql/operations';
import { getStoredUser } from '../auth/storage';
import ShipStatusBanner from './ShipStatusBanner';

const getCruiseImage = (imageUrl) => {
  const normalizedImageUrl = String(imageUrl || '').toLowerCase();
  if (normalizedImageUrl.includes('med')) return medImg;
  if (normalizedImageUrl.includes('carib')) return caribImg;
  return alaskaImg;
};

const formatDate = (value) => {
  if (!value) return 'TBA';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? 'TBA' : parsed.toLocaleDateString();
};

const formatDateTime = (value) => {
  if (!value) return 'TBA';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? 'TBA' : parsed.toLocaleString();
};

const formatPrice = (value) => {
  const amount = Number.parseFloat(value);
  return Number.isFinite(amount) ? amount.toLocaleString() : '0';
};

const VoyagerDashboard = () => {
  const navigate = useNavigate();
  const { data, loading, error, refetch } = useQuery(VOYAGER_DASHBOARD_QUERY, {
    fetchPolicy: 'cache-and-network',
  });

  useEffect(() => {
    const handleRefresh = () => refetch();
    window.addEventListener('REFRESH_USER_BOOKINGS', handleRefresh);
    return () => window.removeEventListener('REFRESH_USER_BOOKINGS', handleRefresh);
  }, [refetch]);

  const getBookingRoute = (category) => {
    if (category === 'Spa' || category === 'Beauty') return '/voyager/beauty';
    if (category === 'Gym') return '/voyager/fitness';
    if (category === 'Dining' || category === 'Party') return '/voyager/party';
    if (category === 'Entertainment') return '/voyager/resort';
    return '/voyager/party';
  };

  const handleBookClick = (service) => {
    navigate(getBookingRoute(service.category), {
      state: { selectedServiceId: service.id, selectedServiceName: service.name },
    });
  };

  const user = getStoredUser() || { name: 'Guest' };
  const firstName = user?.name?.split(' ')[0] || 'Guest';
  const cruises = data?.cruises ?? [];
  const services = data?.services ?? [];
  const myBookings = data?.me?.bookings ?? [];

  // Find active cruise booking for facility lock check
  const activeCruiseBooking = myBookings.find(b => b.cruise_id && (b.status === 'Confirmed' || b.status === 'Pending'));
  const facilitiesUnlocked = myBookings.some(b => b.cruise_id && (b.status === 'Confirmed' || b.status === 'Pending'));
  const hasPendingCruise = myBookings.some(b => b.cruise_id && b.status === 'Pending');

  // Separate cruise and service bookings for the itinerary table
  const serviceBookings = myBookings.filter(b => b.service_id);
  const cruiseBookings = myBookings.filter(b => b.cruise_id);

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
          <h1>Welcome back, <span>{firstName}</span></h1>
          <p className="subtitle" style={{ color: 'rgba(255,255,255,0.7)', maxWidth: '600px', margin: '0 auto', fontSize: '1.1rem' }}>
            Your personal fleet command. Manage your voyage, cabin, and onboard experiences.
          </p>
        </div>
      </div>

      {/* Ship Status Banner */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1.5rem' }}>
        <ShipStatusBanner bookings={myBookings} />
      </div>

      {/* Itinerary / My Bookings */}
      <div className="my-reservations">
        <h2 style={{ color: '#f7d6a5', fontSize: '1.8rem', marginBottom: '1.5rem' }}>My Personal Itinerary</h2>

        {/* Cruise Bookings */}
        {cruiseBookings.length > 0 && (
          <>
            <h3 style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1rem', marginBottom: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              🚢 Cruise Reservations
            </h3>
            <table className="res-table" style={{ marginBottom: '1.5rem' }}>
              <thead>
                <tr>
                  <th>Booking Ref</th>
                  <th>Ship</th>
                  <th>Cabin</th>
                  <th>Passengers</th>
                  <th>Total Price</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {cruiseBookings.map(b => (
                  <tr key={b.id}>
                    <td>VOY-{b.id}CRZ</td>
                    <td>{b.cruise?.ship_name || b.cruise?.name || '—'}</td>
                    <td>{b.cabin_type || '—'}</td>
                    <td>{b.passengers || '—'}</td>
                    <td>{b.total_price ? `$${formatPrice(b.total_price)}` : '—'}</td>
                    <td>
                      <span style={{
                        color: b.status === 'Confirmed' ? '#51cf66' : b.status === 'Rejected' ? '#ff6b6b' : '#fcc419',
                        fontWeight: 600
                      }}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {/* Service bookings */}
        {serviceBookings.length > 0 && (
          <>
            <h3 style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1rem', marginBottom: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              🎯 Onboard Facility Bookings
            </h3>
            <table className="res-table">
              <thead>
                <tr>
                  <th>Booking Ref #</th>
                  <th>Ship / Voyage</th>
                  <th>Facility</th>
                  <th>Time / Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {serviceBookings.map(b => (
                  <tr key={b.id}>
                    <td>VOY-{b.id}BOK</td>
                    <td style={{ color: '#f7d6a5' }}>{b.cruise?.ship_name || b.cruise?.name || '—'}</td>
                    <td>{b.service?.name || '—'}</td>
                    <td>{formatDateTime(b.start_time)}</td>
                    <td>
                      <span style={{ color: '#51cf66', fontWeight: 600 }}>{b.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {myBookings.length === 0 && (
          <p style={{ color: 'rgba(255,255,255,0.5)' }}>
            No bookings yet. Reserve your cruise below to start your journey!
          </p>
        )}
      </div>

      {/* Available Ships */}
      <div className="home-section" id="booking">
        <h2>Available Ships & Voyages</h2>
        <p className="subtitle">Discover breathtaking destinations. Register your group, select your cabin type, and set sail.</p>
        <div className="card-grid">
          {cruises.map(cruise => {
            const imgSource = getCruiseImage(cruise.image_url);
            return (
              <div className="luxury-card" key={cruise.id}>
                <div className="card-image-wrapper">
                  <img src={imgSource} alt={cruise.name} />
                </div>
                <div>
                  <h3>{cruise.ship_name || cruise.name}</h3>
                  {cruise.ship_name && <span className="card-meta" style={{ display: 'block', marginBottom: '0.3rem' }}>{cruise.name}</span>}
                  <span className="card-meta">{cruise.duration_days} Day Voyage</span>
                  <div className="card-details">
                    {(cruise.departure_port || cruise.destination) && (
                      <span>📍 {cruise.departure_port || '—'} → {cruise.destination || '—'}</span>
                    )}
                    <span><strong>Departure:</strong> {formatDate(cruise.start_date)}</span>
                    <span style={{ color: cruise.available_seats < 100 ? '#ff6b6b' : '#51cf66' }}>
                      <strong>Seats Remaining:</strong> {cruise.available_seats} / {cruise.total_seats}
                    </span>
                  </div>
                </div>
                <div className="card-footer">
                  <span className="price">From ${formatPrice(cruise.price)} <span className="price-small">/ pp</span></span>
                  <button
                    className="btn-luxury"
                    onClick={() => navigate('/voyager/cruises', { state: { selectedCruiseId: cruise.id } })}
                  >
                    Reserve Cabin
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Onboard Facilities — locked until cruise confirmed */}
      <div className="home-section" style={{ background: 'transparent', position: 'relative' }}>
        <h2>Onboard Premium Facilities</h2>
        <p className="subtitle">
          {facilitiesUnlocked
            ? 'Indulge in exquisite dining, rejuvenating spas, and thrilling entertainment without leaving the ship.'
            : hasPendingCruise
              ? 'Facilities will unlock once your cruise booking is confirmed by our team. Preview them below.'
              : 'Book a cruise to unlock onboard facilities.'}
        </p>

        {/* Padlock overlay if not confirmed */}
        {!facilitiesUnlocked && (
          <div className="facilities-locked-overlay">
            <div className="facilities-lock-card">
              <span className="facilities-lock-icon">🔒</span>
              <h3>Facilities Locked</h3>
              <p>
                {hasPendingCruise
                  ? 'Your cruise booking is pending admin approval. Once confirmed, all onboard facilities will be available to book.'
                  : 'Reserve a cruise ship cabin first. After admin confirmation, you can book all onboard services.'}
              </p>
              {!activeCruiseBooking && (
                <button className="btn-luxury" onClick={() => navigate('/voyager/cruises')}>Browse Ships</button>
              )}
            </div>
          </div>
        )}

        <div className="card-grid" style={{ opacity: facilitiesUnlocked ? 1 : 0.3, pointerEvents: facilitiesUnlocked ? 'auto' : 'none' }}>
          {services.map(service => (
            <div className="luxury-card" key={service.id}>
              <div>
                <h3>{service.name}</h3>
                <span className="card-meta">{service.category} Experience</span>
                <div className="card-details">
                  Enjoy our bespoke {service.category} offering. Fully serviced and ready to book for your preferred time slot.
                </div>
              </div>
              <div className="card-footer">
                <span className="price">${formatPrice(service.price)} <span className="price-small">/ session</span></span>
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
