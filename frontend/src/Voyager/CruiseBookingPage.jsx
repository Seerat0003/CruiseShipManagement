import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client/react';
import { toast } from 'react-toastify';
import medImg from '../assets/med.png';
import caribImg from '../assets/caribbean.png';
import alaskaImg from '../assets/alaska.png';
import { hasAuthSession } from '../auth/storage';
import { CREATE_BOOKING_MUTATION, CRUISE_BOOKING_QUERY } from '../graphql/operations';
import './CruiseBookingPage.css';

const getCruiseImage = (imageUrl) => {
  const normalizedImageUrl = String(imageUrl || '').toLowerCase();

  if (normalizedImageUrl.includes('med')) return medImg;
  if (normalizedImageUrl.includes('carib')) return caribImg;
  return alaskaImg;
};

const formatDate = (value) => {
  if (!value) {
    return 'TBA';
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? 'TBA' : parsed.toLocaleDateString();
};

const formatPrice = (value) => {
  const amount = Number.parseFloat(value);
  return Number.isFinite(amount) ? amount.toLocaleString() : '0';
};

const buildCruiseWindow = (cruise) => {
  const startDate = cruise?.start_date ? new Date(cruise.start_date) : new Date();
  if (Number.isNaN(startDate.getTime())) {
    const fallbackStart = new Date();
    const fallbackEnd = new Date(fallbackStart.getTime() + 3 * 60 * 60 * 1000);
    return { start: fallbackStart.toISOString(), end: fallbackEnd.toISOString() };
  }

  const durationDays = Number.parseInt(cruise?.duration_days, 10);
  const endDate = new Date(startDate.getTime());
  if (Number.isFinite(durationDays) && durationDays > 0) {
    endDate.setDate(endDate.getDate() + durationDays);
  } else {
    endDate.setHours(endDate.getHours() + 3);
  }

  return {
    start: startDate.toISOString(),
    end: endDate.toISOString(),
  };
};

const CruiseBookingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedCruiseId, setSelectedCruiseId] = useState(location.state?.selectedCruiseId ? String(location.state.selectedCruiseId) : null);
  const { data, loading, error } = useQuery(CRUISE_BOOKING_QUERY, {
    fetchPolicy: 'cache-and-network',
  });
  const [createBooking, { loading: isSubmitting }] = useMutation(CREATE_BOOKING_MUTATION);

  const cruises = data?.cruises ?? [];

  const displayedCruises = useMemo(() => {
    if (!selectedCruiseId) {
      return cruises;
    }

    const selectedCruise = cruises.find((cruise) => String(cruise.id) === String(selectedCruiseId));
    return selectedCruise ? [selectedCruise] : cruises;
  }, [cruises, selectedCruiseId]);

  const handleReserveCruise = async (cruise) => {
    if (!hasAuthSession()) {
      toast.info('Please sign in first to reserve an excursion.');
      navigate('/admin/login');
      return;
    }

    if (!cruise) {
      toast.error('Please select an excursion first.');
      return;
    }

    const availableSeats = Number.parseInt(cruise.available_seats, 10);
    if (Number.isFinite(availableSeats) && availableSeats <= 0) {
      toast.error('This excursion is fully booked.');
      return;
    }

    const bookingWindow = buildCruiseWindow(cruise);

    try {
      await createBooking({
        variables: {
          cruise_id: cruise.id,
          start_time: bookingWindow.start,
          end_time: bookingWindow.end,
        },
      });

      toast.success('Excursion reservation request submitted successfully.');
      navigate('/voyager/dashboard');
    } catch (mutationError) {
      console.error(mutationError);
      toast.error(mutationError?.message || 'Failed to reserve excursion.');
    }
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
          <h1>Select Your Excursion</h1>
          <p>
            Choose the cruise itinerary you want to reserve. When you confirm, your cabin reservation request will be
            submitted for approval with the selected departure schedule.
          </p>
          {selectedCruiseId && cruises.length > 1 && (
            <button type="button" className="cruise-booking-link" onClick={() => setSelectedCruiseId(null)}>
              View All Excursions
            </button>
          )}
        </div>

        {displayedCruises.length === 0 ? (
          <div className="cruise-booking-empty">No excursions are available right now.</div>
        ) : (
          <div className="cruise-booking-grid">
            {displayedCruises.map((cruise) => {
              const isSelected = String(cruise.id) === String(selectedCruiseId);
              const availableSeats = Number.parseInt(cruise.available_seats, 10);
              const isLowAvailability = Number.isFinite(availableSeats) && availableSeats < 100;

              return (
                <article key={cruise.id} className={`cruise-option-card ${isSelected ? 'selected' : ''}`}>
                  <img src={getCruiseImage(cruise.image_url)} alt={cruise.name} className="cruise-option-image" />

                  <div className="cruise-option-body">
                    <div className="cruise-option-top">
                      <h2>{cruise.name}</h2>
                      <p className="cruise-option-meta">{cruise.duration_days} Days Excursion</p>

                      <div className="cruise-option-details">
                        <span><strong>Voyage Map:</strong> {cruise.route || 'TBA'}</span>
                        <span><strong>Departure:</strong> {formatDate(cruise.start_date)}</span>
                        <span className={isLowAvailability ? 'cruise-seat-low' : 'cruise-seat-good'}>
                          <strong>Seats Remaining:</strong> {cruise.available_seats} / {cruise.total_seats}
                        </span>
                      </div>
                    </div>

                    <div className="cruise-option-footer">
                      <div className="cruise-option-price">
                        ${formatPrice(cruise.price)} <small>/ pp</small>
                      </div>

                      <div className="cruise-option-actions">
                        {!isSelected && (
                          <button
                            type="button"
                            className="cruise-booking-button"
                            onClick={() => setSelectedCruiseId(String(cruise.id))}
                          >
                            Select Excursion
                          </button>
                        )}

                        <button
                          type="button"
                          className="cruise-booking-button primary"
                          onClick={() => handleReserveCruise(cruise)}
                          disabled={isSubmitting}
                        >
                          {isSubmitting && isSelected ? 'Submitting...' : 'Reserve Cabin'}
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
    </div>
  );
};

export default CruiseBookingPage;
