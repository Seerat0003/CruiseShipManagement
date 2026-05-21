import React, { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery } from '@apollo/client/react';
import medImg from '../assets/med.png';
import caribImg from '../assets/caribbean.png';
import alaskaImg from '../assets/alaska.png';
import { hasAuthSession } from '../auth/storage';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { CRUISE_BOOKING_QUERY } from '../graphql/operations';
import CruiseRegistrationForm from './CruiseRegistrationForm';
import './CruiseBookingPage.css';

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

const formatPrice = (value) => {
  const amount = Number.parseFloat(value);
  return Number.isFinite(amount) ? amount.toLocaleString() : '0';
};

const CruiseBookingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedCruiseId, setSelectedCruiseId] = useState(
    location.state?.selectedCruiseId ? String(location.state.selectedCruiseId) : null
  );
  const [formCruise, setFormCruise] = useState(null);

  const { data, loading, error } = useQuery(CRUISE_BOOKING_QUERY, {
    fetchPolicy: 'cache-and-network',
  });

  const cruises = data?.cruises ?? [];
  const services = data?.services ?? [];

  const displayedCruises = useMemo(() => {
    if (!selectedCruiseId) return cruises;
    const selectedCruise = cruises.find((cruise) => String(cruise.id) === String(selectedCruiseId));
    return selectedCruise ? [selectedCruise] : cruises;
  }, [cruises, selectedCruiseId]);

  const handleOpenForm = (cruise) => {
    if (!hasAuthSession()) {
      toast.info('Please sign in first to reserve a cabin.');
      navigate('/admin/login');
      return;
    }
    const availableSeats = Number.parseInt(cruise.available_seats, 10);
    if (Number.isFinite(availableSeats) && availableSeats <= 0) {
      toast.error('This cruise is fully booked.');
      return;
    }
    setFormCruise(cruise);
  };

  if (loading && !data) {
    return <div className="cruise-booking-page"><div className="cruise-booking-shell"><p>Loading excursions...</p></div></div>;
  }

  if (error) {
    return <div className="cruise-booking-page"><div className="cruise-booking-shell"><p>{error.message}</p></div></div>;
  }

  return (
    <div className="cruise-booking-page">
      <div className="cruise-booking-shell">
        <div className="cruise-booking-header">
          <h1>Select Your Ship & Voyage</h1>
          <p>
            Choose a cruise itinerary, then complete your passenger registration.
            Cabin pricing varies by suite type — Standard, Deluxe, or Grand Suite.
          </p>
          {selectedCruiseId && cruises.length > 1 && (
            <button type="button" className="cruise-booking-link" onClick={() => setSelectedCruiseId(null)}>
              ← View All Ships
            </button>
          )}
        </div>

        {displayedCruises.length === 0 ? (
          <div className="cruise-booking-empty">No ships are available right now. Check back soon!</div>
        ) : (
          <div className="cruise-booking-grid">
            {displayedCruises.map((cruise) => {
              const isSelected = String(cruise.id) === String(selectedCruiseId);
              const availableSeats = Number.parseInt(cruise.available_seats, 10);
              const isLowAvailability = Number.isFinite(availableSeats) && availableSeats < 100;
              const isFullyBooked = Number.isFinite(availableSeats) && availableSeats <= 0;

              return (
                <article key={cruise.id} className={`cruise-option-card ${isSelected ? 'selected' : ''}`}>
                  <img src={getCruiseImage(cruise.image_url)} alt={cruise.name} className="cruise-option-image" />

                  <div className="cruise-option-body">
                    <div className="cruise-option-top">
                      {/* Ship & trip name */}
                      <div className="cruise-name-block">
                        <h2>{cruise.ship_name || cruise.name}</h2>
                        {cruise.ship_name && <span className="cruise-trip-subtitle">{cruise.name}</span>}
                      </div>
                      <p className="cruise-option-meta">{cruise.duration_days} Day Voyage</p>

                      {/* Route visual */}
                      {(cruise.departure_port || cruise.destination) && (
                        <div className="cruise-route-visual">
                          <span className="cruise-port-from">{cruise.departure_port || '—'}</span>
                          <span className="cruise-route-line">──────▶</span>
                          <span className="cruise-port-to">{cruise.destination || '—'}</span>
                        </div>
                      )}

                      <div className="cruise-option-details">
                        {cruise.route && <span><strong>Via:</strong> {cruise.route}</span>}
                        <span><strong>Departure:</strong> {formatDate(cruise.start_date)}</span>
                        <span className={isLowAvailability ? 'cruise-seat-low' : 'cruise-seat-good'}>
                          <strong>Seats Remaining:</strong> {cruise.available_seats} / {cruise.total_seats}
                        </span>
                      </div>

                      {/* Cabin pricing preview */}
                      <div className="cruise-pricing-grid">
                        <div className="cruise-price-tier">
                          <span className="cruise-tier-label">🛏️ Standard</span>
                          <span className="cruise-tier-price">${formatPrice(cruise.price)}/pp</span>
                        </div>
                        <div className="cruise-price-tier">
                          <span className="cruise-tier-label">🛋️ Deluxe</span>
                          <span className="cruise-tier-price">${formatPrice(Number.parseFloat(cruise.price) * 1.5)}/pp</span>
                        </div>
                        <div className="cruise-price-tier">
                          <span className="cruise-tier-label">👑 Suite</span>
                          <span className="cruise-tier-price">${formatPrice(Number.parseFloat(cruise.price) * 2.5)}/pp</span>
                        </div>
                      </div>
                    </div>

                    <div className="cruise-option-footer">
                      <div className="cruise-option-price">
                        From ${formatPrice(cruise.price)} <small>/ person</small>
                      </div>
                      <div className="cruise-option-actions">
                        {!isSelected && (
                          <button
                            type="button"
                            className="cruise-booking-button"
                            onClick={() => setSelectedCruiseId(String(cruise.id))}
                          >
                            Select
                          </button>
                        )}
                        <button
                          type="button"
                          className="cruise-booking-button primary"
                          onClick={() => handleOpenForm(cruise)}
                          disabled={isFullyBooked}
                        >
                          {isFullyBooked ? 'Fully Booked' : '🚢 Reserve Cabin'}
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Registration Modal */}
      {formCruise && (
        <CruiseRegistrationForm
          cruise={formCruise}
          services={services}
          onClose={() => setFormCruise(null)}
          onSuccess={() => navigate('/voyager/dashboard')}
        />
      )}
    </div>
  );
};

export default CruiseBookingPage;
