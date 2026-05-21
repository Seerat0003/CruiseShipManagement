import React, { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import './AdminDashboard.css';
import {
  ADMIN_DASHBOARD_QUERY,
  ADMIN_ORDERS_QUERY,
  CREATE_CRUISE_MUTATION,
  UPDATE_BOOKING_STATUS_MUTATION,
} from '../graphql/operations';

const emptyStats = {
  users: 0,
  cruises: 0,
  services: 0,
  bookings: 0,
  totalSeats: 0,
  bookedSeats: 0,
  availableSeats: 0,
};

const formatDateTime = (value) => {
  if (!value) {
    return 'N/A';
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? 'N/A' : parsed.toLocaleString();
};

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

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [onlineCount, setOnlineCount] = useState(0);
  const [newTrip, setNewTrip] = useState({
    name: '',
    ship_name: '',
    departure_port: '',
    destination: '',
    route: '',
    start_date: '',
    duration_days: '',
    total_seats: '',
    price: '',
    image_url: '',
  });

  const { data, loading, error, refetch } = useQuery(ADMIN_DASHBOARD_QUERY, {
    fetchPolicy: 'cache-and-network',
  });
  const { data: ordersData } = useQuery(ADMIN_ORDERS_QUERY, {
    fetchPolicy: 'cache-and-network',
  });
  const [updateBookingStatus] = useMutation(UPDATE_BOOKING_STATUS_MUTATION);
  const [createCruise] = useMutation(CREATE_CRUISE_MUTATION);

  useEffect(() => {
    const handlePresence = (event) => {
      setOnlineCount(event.detail);
    };

    const handleRefresh = () => {
      refetch();
    };

    window.addEventListener('ONLINE_COUNT_CHANGE', handlePresence);
    window.addEventListener('REFRESH_BOOKINGS', handleRefresh);

    return () => {
      window.removeEventListener('ONLINE_COUNT_CHANGE', handlePresence);
      window.removeEventListener('REFRESH_BOOKINGS', handleRefresh);
    };
  }, [refetch]);

  const handleUpdateStatus = async (id, status) => {
    try {
      await updateBookingStatus({
        variables: { id, status },
      });
      refetch();
    } catch (mutationError) {
      console.error(mutationError);
      alert('Failed to update status');
    }
  };

  const handleCreateTrip = async (event) => {
    event.preventDefault();

    try {
      await createCruise({
        variables: {
          name: newTrip.name,
          ship_name: newTrip.ship_name || null,
          departure_port: newTrip.departure_port || null,
          destination: newTrip.destination || null,
          route: newTrip.route,
          start_date: newTrip.start_date,
          duration_days: Number.parseInt(newTrip.duration_days, 10),
          total_seats: Number.parseInt(newTrip.total_seats, 10),
          price: Number.parseFloat(newTrip.price),
          image_url: newTrip.image_url || null,
        },
      });

      alert('Trip successfully created!');
      setNewTrip({
        name: '',
        ship_name: '',
        departure_port: '',
        destination: '',
        route: '',
        start_date: '',
        duration_days: '',
        total_seats: '',
        price: '',
        image_url: '',
      });
      refetch();
    } catch (mutationError) {
      console.error(mutationError);
      alert('Failed to create cruise trip');
    }
  };

  const bookings = data?.bookings ?? [];
  const users = data?.voyagers ?? [];
  const facilityStats = data?.facilityStats ?? [];
  const cruises = data?.cruises ?? [];
  const stats = data?.adminStats ?? emptyStats;
  const productOrders = ordersData?.orders ?? [];
  const todayStr = getLocalDateString();

  if (loading && !data) {
    return <div className="page-container hero-bg"><p style={{ color: '#fff', padding: '2rem' }}>Loading dashboard...</p></div>;
  }

  if (error) {
    return <div className="page-container hero-bg"><p style={{ color: '#fff', padding: '2rem' }}>{error.message}</p></div>;
  }

  return (
    <div className="page-container hero-bg">
      <div className="admin-header">
        <h2 className="page-title">Fleet Command Center</h2>
        <button className="refresh-btn" onClick={() => refetch()}>Refresh Metrics</button>
      </div>

      <div className="admin-tabs">
        {['Overview', 'Cruise Bookings', 'Facilities & Locations', 'Active Trips', 'Registered Voyagers', 'Product Orders'].map((tab) => (
          <button
            key={tab}
            className={`admin-tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Overview' && (
        <>
          <div className="dashboard-grid">
            <div className="stat-card" style={{ borderColor: '#51cf66' }}>
              <div className="stat-val" style={{ color: '#51cf66' }}>{onlineCount}</div>
              <div className="stat-lbl">Online Users (Live)</div>
            </div>
            <div className="stat-card">
              <div className="stat-val">{stats.users}</div>
              <div className="stat-lbl">Registered Voyagers</div>
            </div>
            <div className="stat-card">
              <div className="stat-val">{stats.cruises}</div>
              <div className="stat-lbl">Active Trips</div>
            </div>
            <div className="stat-card">
              <div className="stat-val">{stats.bookings}</div>
              <div className="stat-lbl">Total Reservations</div>
            </div>
          </div>

          <h3 className="page-title" style={{ fontSize: '1.8rem', border: 'none', marginBottom: '1rem' }}>Global Live Reservations</h3>
          <table>
            <thead>
              <tr>
                <th>Req ID</th>
                <th>Type</th>
                <th>Facility / Trip Name</th>
                <th>Voyager Name</th>
                <th>Requested Time</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length > 0 ? (
                bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>#{booking.id}</td>
                    <td>{booking.cruise ? 'Cruise Trip' : booking.service ? 'Facility' : 'Other'}</td>
                    <td>{booking.service?.name || booking.cruise?.name || 'Unknown'}</td>
                    <td>{booking.user?.name || 'System User'}</td>
                    <td>{formatDateTime(booking.start_time)}</td>
                    <td><span style={{ color: booking.status === 'Confirmed' ? '#51cf66' : '#fcc419' }}>{booking.status}</span></td>
                    <td>
                      {booking.status === 'Pending' && (
                        <button
                          className="btn-luxury"
                          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                          onClick={() => handleUpdateStatus(booking.id, 'Confirmed')}
                        >
                          Approve
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>No reservations found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </>
      )}

      {/* ── CRUISE BOOKINGS TAB ── */}
      {activeTab === 'Cruise Bookings' && (
        <>
          <h3 className="page-title" style={{ fontSize: '1.8rem', border: 'none', marginBottom: '1rem' }}>🚢 Cruise Booking Registrations</h3>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Voyager</th>
                <th>Ship</th>
                <th>Route</th>
                <th>Cabin</th>
                <th>Passengers</th>
                <th>Rooms</th>
                <th>Total Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.filter(b => b.cruise).length > 0 ? (
                bookings.filter(b => b.cruise).map((booking) => (
                  <tr key={booking.id}>
                    <td>#{booking.id}</td>
                    <td>{booking.user?.name || '—'}<br /><small style={{ color: 'rgba(255,255,255,0.4)' }}>{booking.user?.email}</small></td>
                    <td>{booking.cruise?.ship_name || booking.cruise?.name || '—'}</td>
                    <td style={{ fontSize: '0.8rem' }}>
                      {booking.cruise?.departure_port || '—'} → {booking.cruise?.destination || booking.cruise?.route || '—'}
                    </td>
                    <td><span style={{ color: '#f7d6a5' }}>{booking.cabin_type || '—'}</span></td>
                    <td>{booking.passengers || '—'}</td>
                    <td>{booking.rooms || '—'}</td>
                    <td style={{ color: '#51cf66', fontWeight: 700 }}>
                      {booking.total_price ? `$${Number.parseFloat(booking.total_price).toLocaleString()}` : '—'}
                    </td>
                    <td>
                      <span style={{
                        color: booking.status === 'Confirmed' ? '#51cf66' : booking.status === 'Rejected' ? '#ff6b6b' : '#fcc419',
                        fontWeight: 600
                      }}>
                        {booking.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {booking.status !== 'Confirmed' && (
                          <button
                            className="btn-luxury"
                            id={`confirm-booking-${booking.id}`}
                            style={{ padding: '5px 12px', fontSize: '0.78rem', background: 'rgba(81,207,102,0.15)', color: '#51cf66', border: '1px solid rgba(81,207,102,0.3)' }}
                            onClick={() => handleUpdateStatus(booking.id, 'Confirmed')}
                          >
                            ✅ Confirm
                          </button>
                        )}
                        {booking.status !== 'Rejected' && (
                          <button
                            className="btn-luxury"
                            id={`reject-booking-${booking.id}`}
                            style={{ padding: '5px 12px', fontSize: '0.78rem', background: 'rgba(255,107,107,0.12)', color: '#ff6b6b', border: '1px solid rgba(255,107,107,0.25)' }}
                            onClick={() => handleUpdateStatus(booking.id, 'Rejected')}
                          >
                            ❌ Reject
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255,255,255,0.4)' }}>No cruise booking registrations yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </>
      )}

      {activeTab === 'Facilities & Locations' && (
        <>
          <h3 className="page-title" style={{ fontSize: '1.8rem', border: 'none', marginBottom: '1.5rem' }}>Location Capacity & Metrics</h3>
          <div className="facility-grid">
            {facilityStats.map((service) => {
              const maxCapacity = service.category === 'Dining' ? 120 : service.category === 'Party' ? 300 : service.category === 'Spa' ? 20 : 100;
              const fillPercentage = Math.min(((service.confirmed + service.pending) / maxCapacity) * 100, 100);
              const isFull = fillPercentage >= 100;

              return (
                <div className="facility-card" key={service.id}>
                  <div className="facility-card-header">
                    <span className="facility-title">{service.name}</span>
                    <span className="facility-cat">{service.category}</span>
                  </div>

                  <div className="facility-details">
                    <span>Total Booked</span>
                    <span>{service.total_bookings}</span>
                  </div>
                  <div className="facility-details">
                    <span>Confirmed Entries</span>
                    <span style={{ color: '#51cf66' }}>{service.confirmed}</span>
                  </div>
                  <div className="facility-details">
                    <span>Pending Approval</span>
                    <span style={{ color: '#fcc419' }}>{service.pending}</span>
                  </div>
                  <div className="facility-details" style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <span>Remaining Capacity</span>
                    <span style={{ color: isFull ? '#ff6b6b' : '#fff' }}>{Math.max(maxCapacity - (service.confirmed + service.pending), 0)} spaces</span>
                  </div>

                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${fillPercentage}%`, background: isFull ? '#ff6b6b' : 'var(--secondary-color)' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {activeTab === 'Registered Voyagers' && (
        <>
          <h3 className="page-title" style={{ fontSize: '1.8rem', border: 'none', marginBottom: '1rem' }}>Registered Voyage Members</h3>
          <table>
            <thead>
              <tr>
                <th>Member ID</th>
                <th>Full Name</th>
                <th>Contact Email</th>
                <th>Role</th>
                <th>Registration Date</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id}>
                    <td>V-{user.id * 832}</td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td style={{ textTransform: 'uppercase' }}>{user.role}</td>
                    <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>No voyagers registered yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </>
      )}

      {activeTab === 'Active Trips' && (
        <>
          <div className="admin-create-form">
            <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#f7d6a5' }}>Launch New Cruise Trip</h3>
            <form onSubmit={handleCreateTrip}>
              <div className="form-row">
                <input type="text" placeholder="Trip Name (e.g. Sapphire Seas Tour)" value={newTrip.name} onChange={(event) => setNewTrip({ ...newTrip, name: event.target.value })} required />
                <input type="text" placeholder="Ship Name (e.g. Ocean Serenity I)" value={newTrip.ship_name} onChange={(event) => setNewTrip({ ...newTrip, ship_name: event.target.value })} />
              </div>
              <div className="form-row">
                <input type="text" placeholder="Departure Port (e.g. Mumbai Port, India)" value={newTrip.departure_port} onChange={(event) => setNewTrip({ ...newTrip, departure_port: event.target.value })} />
                <input type="text" placeholder="Destination (e.g. Maldives)" value={newTrip.destination} onChange={(event) => setNewTrip({ ...newTrip, destination: event.target.value })} />
              </div>
              <div className="form-row">
                <input type="text" placeholder="Route (e.g. Miami → Bahamas → Nassau)" value={newTrip.route} onChange={(event) => setNewTrip({ ...newTrip, route: event.target.value })} required />
                <input type="date" min={todayStr} value={newTrip.start_date} onChange={(event) => setNewTrip({ ...newTrip, start_date: event.target.value })} required title="Start Date" />
              </div>
              <div className="form-row">
                <input type="number" placeholder="Duration (Days)" value={newTrip.duration_days} onChange={(event) => setNewTrip({ ...newTrip, duration_days: event.target.value })} required />
                <input type="number" placeholder="Total Seats" value={newTrip.total_seats} onChange={(event) => setNewTrip({ ...newTrip, total_seats: event.target.value })} required />
                <input type="number" placeholder="Base Price / Person ($)" value={newTrip.price} onChange={(event) => setNewTrip({ ...newTrip, price: event.target.value })} required />
                <input type="text" placeholder="Image key (med / carib / alaska)" value={newTrip.image_url} onChange={(event) => setNewTrip({ ...newTrip, image_url: event.target.value })} />
              </div>
              <button type="submit" className="create-btn">🚀 Deploy Cruise</button>
            </form>
          </div>

          <h3 className="page-title" style={{ fontSize: '1.8rem', border: 'none', marginBottom: '1rem' }}>Active Cruise Deployments</h3>
          <table>
            <thead>
              <tr>
                <th>Cruise Name</th>
                <th>Route Schedule</th>
                <th>Departure Date</th>
                <th>Duration</th>
                <th>Capacity</th>
                <th>Pricing</th>
              </tr>
            </thead>
            <tbody>
              {cruises.length > 0 ? (
                cruises.map((cruise) => (
                  <tr key={cruise.id}>
                    <td>{cruise.name}</td>
                    <td>{cruise.route}</td>
                    <td>{new Date(cruise.start_date).toLocaleDateString()}</td>
                    <td>{cruise.duration_days} Days</td>
                    <td>
                      <span style={{ color: '#51cf66' }}>{cruise.available_seats} Available</span> / {cruise.total_seats}
                    </td>
                    <td>${cruise.price}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>No active trips deployed.</td>
                </tr>
              )}
            </tbody>
          </table>
        </>
      )}

      {activeTab === 'Product Orders' && (
        <>
          <h3 className="page-title" style={{ fontSize: '1.8rem', border: 'none', marginBottom: '1rem' }}>Product Order Ledger</h3>
          <table>
            <thead>
              <tr>
                <th>Order #</th>
                <th>Voyager</th>
                <th>Timestamp</th>
                <th>Items</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {productOrders.length > 0 ? (
                productOrders.map((order) => (
                  <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td>{order.user?.name || order.user?.email || 'Voyager'}</td>
                    <td>{formatDateTime(order.created_at)}</td>
                    <td>{order.items.map((item) => `${item.product?.name} x${item.quantity}`).join(', ')}</td>
                    <td>${Number.parseFloat(order.total || 0).toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>No product orders found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
