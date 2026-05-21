import React, { useState, useMemo } from 'react';
import { useMutation } from '@apollo/client/react';
import { toast } from 'react-toastify';
import { CREATE_BOOKING_MUTATION } from '../graphql/operations';
import './CruiseRegistrationForm.css';

const CABIN_TYPES = [
  { id: 'Standard', label: 'Standard Cabin', multiplier: 1.0, icon: '🛏️', desc: 'Comfortable twin or queen bed with ocean view porthole.' },
  { id: 'Deluxe', label: 'Deluxe Suite', multiplier: 1.5, icon: '🛋️', desc: 'Spacious suite with private balcony and premium amenities.' },
  { id: 'Suite', label: 'Grand Suite', multiplier: 2.5, icon: '👑', desc: 'Luxury suite with butler service, jacuzzi and panoramic views.' },
];

const GROUP_TYPES = [
  { id: 'solo', label: 'Solo', icon: '🧍', desc: 'Travelling alone' },
  { id: 'couple', label: 'Couple', icon: '💑', desc: 'Two travellers' },
  { id: 'family', label: 'Family', icon: '👨‍👩‍👧', desc: 'Group with children' },
];

const STEP_LABELS = ['Trip Details', 'Group & Passengers', 'Cabin & Facilities', 'Review & Confirm'];

const CruiseRegistrationForm = ({ cruise, services = [], onClose, onSuccess }) => {
  const [step, setStep] = useState(0);
  const [groupType, setGroupType] = useState('');
  const [passengers, setPassengers] = useState(1);
  const [cabinType, setCabinType] = useState('');
  const [rooms, setRooms] = useState(1);
  const [specialRequests, setSpecialRequests] = useState('');

  const [createBooking, { loading }] = useMutation(CREATE_BOOKING_MUTATION);

  const selectedCabin = CABIN_TYPES.find(c => c.id === cabinType);
  const basePrice = parseFloat(cruise?.price) || 0;
  const multiplier = selectedCabin?.multiplier || 1;
  const totalPrice = basePrice * multiplier * passengers;

  const formatPrice = (val) => parseFloat(val || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
  const formatDate = (val) => val ? new Date(val).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'TBA';

  const startDate = cruise?.start_date ? new Date(cruise.start_date) : new Date();
  const endDate = new Date(startDate.getTime());
  if (cruise?.duration_days) endDate.setDate(endDate.getDate() + parseInt(cruise.duration_days, 10));

  const canNext = useMemo(() => {
    if (step === 1) return groupType !== '' && passengers >= 1;
    if (step === 2) return cabinType !== '' && rooms >= 1;
    return true;
  }, [step, groupType, passengers, cabinType, rooms]);

  const handleSubmit = async () => {
    try {
      await createBooking({
        variables: {
          cruise_id: cruise.id,
          start_time: startDate.toISOString(),
          end_time: endDate.toISOString(),
          group_type: groupType,
          passengers: parseInt(passengers, 10),
          cabin_type: cabinType,
          rooms: parseInt(rooms, 10),
          special_requests: specialRequests || null,
        },
      });
      toast.success('🚢 Cruise booking submitted! Awaiting admin confirmation.');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toast.error(err?.message || 'Booking failed. Please try again.');
    }
  };

  return (
    <div className="crf-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="crf-modal">
        {/* Header */}
        <div className="crf-header">
          <div className="crf-header-top">
            <h2>🚢 Reserve Your Cabin</h2>
            <button className="crf-close" onClick={onClose}>✕</button>
          </div>
          <div className="crf-steps">
            {STEP_LABELS.map((label, i) => (
              <div key={i} className={`crf-step ${i === step ? 'active' : i < step ? 'done' : ''}`}>
                <div className="crf-step-dot">{i < step ? '✓' : i + 1}</div>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="crf-body">

          {/* STEP 0 — Trip Details */}
          {step === 0 && (
            <div className="crf-step-content">
              <h3>Confirm Your Trip</h3>
              <div className="crf-trip-card">
                <div className="crf-trip-row big">
                  <span className="crf-ship-name">{cruise?.ship_name || cruise?.name}</span>
                  {cruise?.ship_name && <span className="crf-trip-tag">{cruise.name}</span>}
                </div>
                {(cruise?.departure_port || cruise?.destination) && (
                  <div className="crf-route-visual">
                    <span className="crf-port">{cruise.departure_port || '—'}</span>
                    <span className="crf-route-arrow">✈ ────────── ✈</span>
                    <span className="crf-port dest">{cruise.destination || '—'}</span>
                  </div>
                )}
                {cruise?.route && <p className="crf-route-label">Via: {cruise.route}</p>}
                <div className="crf-trip-grid">
                  <div className="crf-info-box">
                    <div className="crf-info-label">Departure</div>
                    <div className="crf-info-val">{formatDate(cruise?.start_date)}</div>
                  </div>
                  <div className="crf-info-box">
                    <div className="crf-info-label">Duration</div>
                    <div className="crf-info-val">{cruise?.duration_days || '?'} Days</div>
                  </div>
                  <div className="crf-info-box">
                    <div className="crf-info-label">Base Price</div>
                    <div className="crf-info-val">{formatPrice(basePrice)} <small>/ person</small></div>
                  </div>
                  <div className="crf-info-box">
                    <div className="crf-info-label">Seats Left</div>
                    <div className="crf-info-val" style={{ color: (cruise?.available_seats || 0) < 50 ? '#ff6b6b' : '#51cf66' }}>
                      {cruise?.available_seats} / {cruise?.total_seats}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 1 — Group & Passengers */}
          {step === 1 && (
            <div className="crf-step-content">
              <h3>Who's Travelling?</h3>
              <div className="crf-group-grid">
                {GROUP_TYPES.map(g => (
                  <button
                    key={g.id}
                    className={`crf-group-card ${groupType === g.id ? 'selected' : ''}`}
                    onClick={() => setGroupType(g.id)}
                  >
                    <span className="crf-group-icon">{g.icon}</span>
                    <span className="crf-group-label">{g.label}</span>
                    <span className="crf-group-desc">{g.desc}</span>
                  </button>
                ))}
              </div>
              <div className="crf-field">
                <label>Number of Passengers</label>
                <div className="crf-counter">
                  <button type="button" onClick={() => setPassengers(Math.max(1, passengers - 1))}>−</button>
                  <span>{passengers}</span>
                  <button type="button" onClick={() => setPassengers(Math.min(20, passengers + 1))}>+</button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 — Cabin & Facilities Preview */}
          {step === 2 && (
            <div className="crf-step-content">
              <h3>Choose Your Cabin</h3>
              <div className="crf-cabin-grid">
                {CABIN_TYPES.map(c => (
                  <button
                    key={c.id}
                    className={`crf-cabin-card ${cabinType === c.id ? 'selected' : ''}`}
                    onClick={() => setCabinType(c.id)}
                  >
                    <span className="crf-cabin-icon">{c.icon}</span>
                    <span className="crf-cabin-label">{c.label}</span>
                    <span className="crf-cabin-mult">{c.multiplier}× base price</span>
                    <span className="crf-cabin-price">{formatPrice(basePrice * c.multiplier)} / person</span>
                    <span className="crf-cabin-desc">{c.desc}</span>
                  </button>
                ))}
              </div>
              <div className="crf-field">
                <label>Number of Rooms</label>
                <div className="crf-counter">
                  <button type="button" onClick={() => setRooms(Math.max(1, rooms - 1))}>−</button>
                  <span>{rooms}</span>
                  <button type="button" onClick={() => setRooms(Math.min(10, rooms + 1))}>+</button>
                </div>
              </div>
              <div className="crf-field">
                <label>Special Requests (optional)</label>
                <textarea
                  className="crf-textarea"
                  placeholder="Dietary requirements, accessibility needs, celebration surprises..."
                  value={specialRequests}
                  onChange={e => setSpecialRequests(e.target.value)}
                  rows={3}
                />
              </div>
              {services.length > 0 && (
                <div className="crf-facilities-preview">
                  <h4>🛳️ Available Onboard Facilities</h4>
                  <p className="crf-facilities-note">These facilities will be bookable once your cruise is confirmed.</p>
                  <div className="crf-facilities-grid">
                    {services.map(s => (
                      <div key={s.id} className="crf-facility-chip">
                        <span className="crf-facility-name">{s.name}</span>
                        <span className="crf-facility-cat">{s.category}</span>
                        <span className="crf-facility-price">${parseFloat(s.price || 0).toLocaleString()}/session</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3 — Review & Confirm */}
          {step === 3 && (
            <div className="crf-step-content">
              <h3>Review Your Booking</h3>
              <div className="crf-review-card">
                <div className="crf-review-row">
                  <span>🚢 Ship</span>
                  <span>{cruise?.ship_name || cruise?.name}</span>
                </div>
                <div className="crf-review-row">
                  <span>📍 Route</span>
                  <span>{cruise?.departure_port || ''} → {cruise?.destination || cruise?.route || 'TBA'}</span>
                </div>
                <div className="crf-review-row">
                  <span>📅 Departure</span>
                  <span>{formatDate(cruise?.start_date)}</span>
                </div>
                <div className="crf-review-row">
                  <span>⏱ Duration</span>
                  <span>{cruise?.duration_days} Days</span>
                </div>
                <hr className="crf-divider" />
                <div className="crf-review-row">
                  <span>👥 Group Type</span>
                  <span style={{ textTransform: 'capitalize' }}>{groupType}</span>
                </div>
                <div className="crf-review-row">
                  <span>🧳 Passengers</span>
                  <span>{passengers} person{passengers > 1 ? 's' : ''}</span>
                </div>
                <div className="crf-review-row">
                  <span>🛏️ Cabin Type</span>
                  <span>{cabinType}</span>
                </div>
                <div className="crf-review-row">
                  <span>🚪 Rooms</span>
                  <span>{rooms}</span>
                </div>
                {specialRequests && (
                  <div className="crf-review-row">
                    <span>📝 Requests</span>
                    <span className="crf-requests-text">{specialRequests}</span>
                  </div>
                )}
                <hr className="crf-divider" />
                <div className="crf-review-row crf-total-row">
                  <span>💰 Total Price</span>
                  <span className="crf-total-amount">{formatPrice(totalPrice)}</span>
                </div>
                <p className="crf-review-note">
                  Your booking will be reviewed and confirmed by our fleet administration team. You'll see the update on your dashboard.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="crf-footer">
          {step > 0 && (
            <button className="crf-btn secondary" onClick={() => setStep(s => s - 1)}>← Back</button>
          )}
          {step < 3 ? (
            <button className="crf-btn primary" onClick={() => setStep(s => s + 1)} disabled={!canNext}>
              Next Step →
            </button>
          ) : (
            <button className="crf-btn submit" onClick={handleSubmit} disabled={loading}>
              {loading ? '⏳ Submitting...' : '✅ Submit Booking Request'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CruiseRegistrationForm;
