import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './ShipStatusBanner.css';

const formatDate = (val) => {
  if (!val) return 'TBA';
  const d = new Date(val);
  return isNaN(d.getTime()) ? 'TBA' : d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
};

const getCountdown = (startDateStr) => {
  if (!startDateStr) return null;
  const departure = new Date(startDateStr);
  if (isNaN(departure.getTime())) return null;
  const diff = departure - new Date();
  if (diff <= 0) return 'Departed';
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days > 0) return `${days}d ${hours}h`;
  return `${hours}h`;
};

const ShipStatusBanner = ({ bookings = [] }) => {
  const navigate = useNavigate();

  // Find the most relevant cruise booking (Confirmed first, then Pending)
  const activeBooking = useMemo(() => {
    const cruiseBookings = bookings.filter(b => b.cruise_id);
    return (
      cruiseBookings.find(b => b.status === 'Confirmed') ||
      cruiseBookings.find(b => b.status === 'Pending') ||
      null
    );
  }, [bookings]);

  if (!activeBooking) {
    return (
      <div className="ssb-container ssb-empty">
        <div className="ssb-empty-icon">🚢</div>
        <div className="ssb-empty-text">
          <strong>No active cruise booking</strong>
          <span>Browse available ships and reserve your cabin to begin your voyage.</span>
        </div>
        <button className="ssb-book-btn" onClick={() => navigate('/voyager/cruises')}>
          Browse Ships →
        </button>
      </div>
    );
  }

  const cruise = activeBooking.cruise;
  const status = activeBooking.status;
  const countdown = getCountdown(cruise?.start_date);

  const statusConfig = {
    Confirmed: { color: '#51cf66', bg: 'rgba(81, 207, 102, 0.1)', border: 'rgba(81, 207, 102, 0.3)', icon: '✅', label: 'Confirmed — Bon Voyage!' },
    Pending:   { color: '#fcc419', bg: 'rgba(252, 196, 25, 0.08)', border: 'rgba(252, 196, 25, 0.25)', icon: '⏳', label: 'Awaiting Admin Approval' },
    Rejected:  { color: '#ff6b6b', bg: 'rgba(255, 107, 107, 0.08)', border: 'rgba(255, 107, 107, 0.25)', icon: '❌', label: 'Booking Rejected' },
  };

  const cfg = statusConfig[status] || statusConfig.Pending;

  return (
    <div className="ssb-container" style={{ borderColor: cfg.border, background: `linear-gradient(135deg, rgba(13,27,42,0.9), ${cfg.bg})` }}>
      <div className="ssb-left">
        <div className="ssb-ship-header">
          <span className="ssb-icon">🚢</span>
          <div>
            <h3 className="ssb-ship-name">{cruise?.ship_name || cruise?.name || 'Your Ship'}</h3>
            {cruise?.name && cruise?.ship_name && <span className="ssb-trip-name">{cruise.name}</span>}
          </div>
          <span className="ssb-status-badge" style={{ background: cfg.bg, color: cfg.color, borderColor: cfg.border }}>
            {cfg.icon} {cfg.label}
          </span>
        </div>
        <div className="ssb-details">
          {(cruise?.departure_port || cruise?.destination) && (
            <div className="ssb-detail-item">
              <span className="ssb-detail-icon">📍</span>
              <span>{cruise.departure_port || '—'} → {cruise.destination || '—'}</span>
            </div>
          )}
          <div className="ssb-detail-item">
            <span className="ssb-detail-icon">📅</span>
            <span>Departure: <strong>{formatDate(cruise?.start_date)}</strong></span>
          </div>
          {activeBooking.cabin_type && (
            <div className="ssb-detail-item">
              <span className="ssb-detail-icon">🛏️</span>
              <span>{activeBooking.cabin_type} Cabin · {activeBooking.passengers} Passenger{activeBooking.passengers > 1 ? 's' : ''} · {activeBooking.rooms} Room{activeBooking.rooms > 1 ? 's' : ''}</span>
            </div>
          )}
          {activeBooking.total_price && (
            <div className="ssb-detail-item">
              <span className="ssb-detail-icon">💰</span>
              <span>Total Booking: <strong>${parseFloat(activeBooking.total_price).toLocaleString()}</strong></span>
            </div>
          )}
        </div>
      </div>
      {countdown && status !== 'Rejected' && (
        <div className="ssb-countdown">
          <div className="ssb-countdown-val">{countdown}</div>
          <div className="ssb-countdown-lbl">until departure</div>
        </div>
      )}
    </div>
  );
};

export default ShipStatusBanner;
