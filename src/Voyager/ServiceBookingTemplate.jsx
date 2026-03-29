import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ServiceBookingTemplate.css';
import '../Home.css';
import facilitiesImg from '../assets/facilities.png';

// Time slot constants (Pill shaped buttons)
const TIME_SLOTS = [
  { id: '4to7pm', label: '4:00 PM - 7:00 PM', time: '16:00' },
  { id: '8to11pm', label: '8:00 PM - 11:00 PM', time: '20:00' },
  { id: '12to3am', label: '12:00 AM - 3:00 AM', time: '00:00' }
];

const ServiceBookingTemplate = ({ title, categoryFilter }) => {
  const [services, setServices] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  
  // Selection State
  const [date, setDate] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      // 1. Fetch Services
      try {
        const servRes = await fetch('http://localhost:5001/api/public/services');
        if (servRes.ok) {
          const allServs = await servRes.json();
          setServices(allServs.filter(s => categoryFilter.includes(s.category)));
        }
      } catch (err) { console.error("Service fetch failed"); }

      // 2. Fetch Bookings
      try {
        const bookRes = await fetch('http://localhost:5001/api/public/bookings');
        if (bookRes.ok) {
          const allBooks = await bookRes.json();
          setAllBookings(allBooks);
        }
      } catch (err) { console.error("Bookings fetch failed"); }
    };
    fetchData();
  }, [categoryFilter]);

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
      alert("Please sign in first to complete your reservation.");
      return navigate('/admin/login');
    }
    if (!date || !selectedServiceId || !selectedTime) {
      return alert("Please select a Date, Venue, and Timing to book.");
    }
    
    // Calculate start/end objects
    let startTimeObj = new Date(`${date}T${selectedTime}:00`);
    let endTimeObj = new Date(startTimeObj.getTime() + 3 * 60 * 60 * 1000);

    try {
      const res = await fetch('http://localhost:5001/api/voyager/bookings', {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({
          service_id: selectedServiceId,
          start_time: startTimeObj.toISOString(),
          end_time: endTimeObj.toISOString()
        })
      });
      
      if (res.ok) {
        alert(`Reservation Confirmed for ${startTimeObj.toLocaleTimeString()}! Syncing Database...`);
        navigate('/voyager/dashboard');
      } else {
        alert("Booking failure. That time slot may currently be locked.");
      }
    } catch(err) {
      alert("Encountered server processing delay submitting API network request.");
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="booking-page-container">
      <div className="booking-header">
        <h1><span>Select</span> {title}</h1>
        <p className="subtitle" style={{ color: 'rgba(255,255,255,0.7)', marginTop: '1rem', maxWidth: '600px', margin: '1rem auto' }}>
          Reserve your exclusive maritime experience directly onto your internal itinerary.
        </p>
      </div>

      {/* 1. MINIMAL DATE SELECTOR */}
      <div style={{ textAlign: 'center', marginBottom: '3rem', animation: 'fadeInData 1s ease forwards' }}>
        <span style={{ color: 'var(--secondary-color)', fontSize: '1.5rem', marginRight: '1rem', fontStyle: 'italic', fontFamily: 'serif' }}>on</span>
        <input 
          type="date" 
          value={date} 
          onChange={e => { setDate(e.target.value); setSelectedTime(''); }} 
          min={todayStr}
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
          {services.length > 0 ? services.map(service => {
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
                                setSelectedServiceId(service.id);
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
