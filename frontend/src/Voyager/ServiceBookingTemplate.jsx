import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client/react';
import { toast } from 'react-toastify';

import './ServiceBookingTemplate.css';
import '../Home.css';
import facilitiesImg from '../assets/facilities.png';
import { CREATE_BOOKING_MUTATION, SERVICE_BOOKING_DATA_QUERY } from '../graphql/operations';

// Time slot constants (Pill shaped buttons)
const TIME_SLOTS = [
  { id: '4to7pm', label: '4:00 PM - 7:00 PM', time: '16:00' },
  { id: '8to11pm', label: '8:00 PM - 11:00 PM', time: '20:00' },
  { id: '12to3am', label: '12:00 AM - 3:00 AM', time: '00:00' }
];

const getLocalDateString = (value = new Date()) => {
  const dateObj = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(dateObj.getTime())) {
    return '';
  }

  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const isPastDate = (value, minDate) => {
  if (!value || !minDate) {
    return false;
  }

  return value < minDate;
};

const ServiceBookingTemplate = ({ title, categoryFilter }) => {
  const { data, loading, error, refetch } = useQuery(SERVICE_BOOKING_DATA_QUERY, {
    fetchPolicy: 'cache-and-network',
  });
  const [createBooking] = useMutation(CREATE_BOOKING_MUTATION);
  
  const [services, setServices] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  
  // Selection State
  const [date, setDate] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  
  const location = useLocation();
  const navigate = useNavigate();
  const focusedServiceId = location.state?.selectedServiceId ?? null;
  const focusedServiceName = location.state?.selectedServiceName ?? '';

  useEffect(() => {
    if (data) {
      const matchingServices = data.services.filter((service) => categoryFilter.includes(service.category));
      setServices(matchingServices);
      setAllBookings(data.bookings);

      if (focusedServiceId && matchingServices.some((service) => String(service.id) === String(focusedServiceId))) {
        setSelectedServiceId(String(focusedServiceId));
      }
    }
  }, [data, categoryFilter, focusedServiceId]);

  const displayedServices = focusedServiceId
    ? services.filter((service) => String(service.id) === String(focusedServiceId))
    : services;

  // Count how many bookings exist for a specific slot on the selected Date and Service
  const getBookingsCount = (serviceId, timeStr) => {
    if (!date) return 0;
    const slotDTTM = new Date(`${date}T${timeStr}:00`);
    const collisionCount = allBookings.filter(b => {
      if (b.service_id !== serviceId) return false;
      const existingReqDTTM = new Date(b.start_time);
      if (existingReqDTTM.getTime() === slotDTTM.getTime()) return true;
      return false;
    }).length;
    return collisionCount; 
  };

  const handleConfirmReservation = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.info('Please sign in first to complete your reservation.');
      return navigate('/admin/login');
    }
    if (!date || !selectedServiceId || !selectedTime) {
      toast.info('Please select a Date, Venue, and Timing to book.');
      return;
    }

    if (isPastDate(date, todayStr)) {
      toast.error('Please choose today or a future date. Past dates are not allowed.');
      return;
    }
    
    // Calculate start/end objects
    let startTimeObj = new Date(`${date}T${selectedTime}:00`);
    let endTimeObj = new Date(startTimeObj.getTime() + 3 * 60 * 60 * 1000);

    try {
      const { data: mutationData } = await createBooking({
        variables: {
          service_id: selectedServiceId,
          start_time: startTimeObj.toISOString(),
          end_time: endTimeObj.toISOString()
        }
      });
      
      if (mutationData) {
        refetch(); // Reload data
        navigate('/voyager/dashboard');
      }
    } catch (err) {
      console.error("Booking error:", err);
      const errorMessage =
        err?.message?.replace(/^GraphQL error:\s*/i, '') ||
        err?.graphQLErrors?.[0]?.message ||
        'Booking failed. Please try again.';
      toast.error(errorMessage);
    }
  };

  const todayStr = getLocalDateString();

  const openNativeDatePicker = (event) => {
    if (typeof event?.target?.showPicker === 'function') {
      try {
        event.target.showPicker();
      } catch (error) {
        // Ignore browsers that reject scripted picker opening.
      }
    }
  };

  if (loading) return <div className="loading">Loading maritime experiences...</div>;
  if (error) return <div className="error">Error loading data: {error.message}</div>;

  return (
    <div className="booking-page-container">
      <div className="booking-header">
        <h1><span>Select</span> {title}</h1>
        <p className="subtitle" style={{ color: 'rgba(255,255,255,0.7)', marginTop: '1rem', maxWidth: '600px', margin: '1rem auto' }}>
          {focusedServiceName
            ? `Choose a date and time for ${focusedServiceName}, then confirm your reservation.`
            : 'Reserve your exclusive maritime experience directly onto your internal itinerary.'}
        </p>
      </div>

      {/* 1. MINIMAL DATE SELECTOR */}
      <div style={{ textAlign: 'center', marginBottom: '3rem', animation: 'fadeInData 1s ease forwards' }}>
        <span style={{ color: 'var(--secondary-color)', fontSize: '1.5rem', marginRight: '1rem', fontStyle: 'italic', fontFamily: 'serif' }}>on</span>
        <input 
          type="date" 
          value={date} 
          onChange={e => { setDate(e.target.value); setSelectedTime(''); }} 
          onClick={openNativeDatePicker}
          onFocus={openNativeDatePicker}
          min={todayStr}
          className="booking-date-input"
          style={{
            padding: '12px 24px',
            background: 'rgba(0,0,0,0.4)',
            border: '1px solid var(--secondary-color)',
            color: 'var(--secondary-color)',
            borderRadius: '50px',
            fontSize: '1.2rem',
            fontFamily: 'var(--font-heading)',
            cursor: 'pointer',
            backdropFilter: 'blur(10px)',
            outline: 'none',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
          }}
        />
      </div>

      <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '3rem' }}>
        
        {/* 2. WIDE VENUE CARDS WITH INLINE SLOTS */}
        <div>
          {displayedServices.length > 0 ? displayedServices.map(service => {
            let deckLocation = ['Party', 'Dining', 'Entertainment'].includes(service.category) ? 'Deck 7, Aft' : 'Deck 14, Forward';
            let sqFt = ['Spa', 'Beauty'].includes(service.category) ? '3,500 sq ft' : '12,000 sq ft';

            return (
              <div 
                key={service.id}
                className={`venue-card-wrapper ${selectedServiceId === service.id ? 'selected' : ''}`}
              >
                <div className="venue-card-top">
                    <img src={facilitiesImg} alt={service.name} className="venue-img" />
                    <div className="venue-info">
                      <h3>{service.name}</h3>
                      <div className="venue-details">
                        <span><strong>Location:</strong> {deckLocation}</span>
                        <span><strong>Area:</strong> {sqFt}</span>
                      </div>
                      <span className="venue-price">${parseFloat(service.price).toLocaleString()} / session</span>
                    </div>
                </div>

                <div className="venue-slots-area">
                   <h4>Available Operational Blocks</h4>
                   {(!date) ? (
                     <p style={{color: '#ff6b6b', fontSize: '0.9rem', fontStyle: 'italic', margin: 0}}>
                       Please select a Date above to unlock live capacities.
                     </p>
                   ) : (
                     <div style={{display: 'flex', flexWrap: 'wrap'}}>
                       {TIME_SLOTS.map(slot => {
                          let maxSeats = 1; 
                          if (['Gym', 'Fitness', 'Entertainment', 'Movie'].includes(service.category)) maxSeats = 50;
                          else if (['Dining', 'Catering'].includes(service.category)) maxSeats = 20;
                          
                          const bookedCount = getBookingsCount(service.id, slot.time);
                          const available = maxSeats - bookedCount;
                          const unavailable = available <= 0;
                          
                          const isCurrentlySelected = selectedServiceId === service.id && selectedTime === slot.time;

                          return (
                            <button
                              key={slot.id}
                              className={`slot-pill ${isCurrentlySelected ? 'selected' : ''}`}
                              disabled={unavailable}
                              onClick={() => {
                                setSelectedServiceId(String(service.id));
                                setSelectedTime(slot.time);
                              }}
                            >
                              <span className="slot-pill-time">( {slot.label} )</span>
                              <span className="slot-pill-status">
                                {unavailable ? 'Fully Booked' : `${available} Seat${available !== 1 ? 's' : ''} Left`}
                              </span>
                            </button>
                          );
                       })}
                     </div>
                   )}
                </div>
              </div>
            )
          }) : (
            <div style={{textAlign: 'center', padding: '3rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px'}}>
              <p style={{color: 'rgba(255,255,255,0.6)'}}>⚠️ Awaiting Fleet Delivery (No items loaded in Database)</p>
            </div>
          )}
        </div>

        {/* 3. MASTER CONFIRM BUTTON */}
        <div style={{ textAlign: 'center', marginTop: '1rem', paddingBottom: '4rem' }}>
          <button 
             className="btn-curved-huge" 
             onClick={handleConfirmReservation}
             disabled={!date || !selectedServiceId || !selectedTime}
             style={{ 
               opacity: (!date || !selectedServiceId || !selectedTime) ? 0.5 : 1,
               cursor: (!date || !selectedServiceId || !selectedTime) ? 'not-allowed' : 'pointer',
               letterSpacing: '3px'
             }}
          >
            CONFIRM RESERVATION
          </button>
        </div>

      </div>
    </div>
  );
};

export default ServiceBookingTemplate;
