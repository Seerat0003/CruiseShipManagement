import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [stats, setStats] = useState({
    users: 0, cruises: 0, services: 0, bookings: 0,
    totalSeats: 0, bookedSeats: 0, availableSeats: 0
  });
  const [onlineCount, setOnlineCount] = useState(0);

  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [facilityStats, setFacilityStats] = useState([]);
  const [cruises, setCruises] = useState([]);
  
  // Trip creation form state
  const [newTrip, setNewTrip] = useState({ name: '', route: '', start_date: '', duration_days: '', total_seats: '', price: '', image_url: '' });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5001/api/admin/stats", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) setStats(data);
      } catch (err) {
        console.error("Stats error:", err);
      }
    };

    fetchStats();

    // Socket presence update
    const handlePresence = (e) => {
      setOnlineCount(e.detail);
    };

    window.addEventListener('ONLINE_COUNT_CHANGE', handlePresence);
    return () => window.removeEventListener('ONLINE_COUNT_CHANGE', handlePresence);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      };

      // Ensure parallel fast loading
      const requests = [
        fetch("http://localhost:5001/api/admin/bookings", { headers }),
        fetch("http://localhost:5001/api/admin/users", { headers }),
        fetch("http://localhost:5001/api/admin/facility-stats", { headers }),
        fetch("http://localhost:5001/api/public/cruises", { headers }),
        fetch("http://localhost:5001/api/admin/stats", { headers })
      ];

      const [resBookings, resUsers, resFacility, resCruises, resStats] = await Promise.all(requests);
      
      if (resBookings.status === 401 || resBookings.status === 403) {
        alert("Admin Access Denied. Please Sign In as Admin.");
        return;
      }

      setBookings(await resBookings.json());
      setUsers(await resUsers.json());
      setFacilityStats(await resFacility.json());
      setCruises(await resCruises.json());
      setStats(await resStats.json());


      
    } catch (err) {
      console.error("Dashboard error:", err);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5001/api/admin/bookings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      if (res.ok) fetchDashboardData();
    } catch (err) {
      console.error("Failed to update status");
    }
  };

  const handleCreateTrip = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5001/api/admin/cruises", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(newTrip)
      });
      if (res.ok) {
        alert("Trip successfully created!");
        setNewTrip({ name: '', route: '', start_date: '', duration_days: '', total_seats: '', price: '', image_url: '' });
        fetchDashboardData();
      }
    } catch (err) {
      console.error("Failed to create cruise trip");
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="page-container hero-bg">
      <div className="admin-header">
        <h2 className="page-title">Fleet Command Center</h2>
        <button className="refresh-btn" onClick={fetchDashboardData}>Refresh Metrics</button>
      </div>

      <div className="admin-tabs">
        {['Overview', 'Facilities & Locations', 'Active Trips', 'Registered Voyagers'].map(tab => (
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
          {stats && (
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
          )}


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
                bookings.map((b) => (
                  <tr key={b.id}>
                    <td>#{b.id}</td>
                    <td>{b.Cruise ? "Cruise Trip" : b.Service ? "Facility" : "Other"}</td>
                    <td>{b.Service?.name || b.Cruise?.name || "Unknown"}</td>
                    <td>{b.User ? b.User.name : "System User"}</td>
                    <td>{new Date(b.start_time).toLocaleString()}</td>
                    <td><span style={{color: b.status === 'Confirmed' ? '#51cf66' : '#fcc419'}}>{b.status}</span></td>
                    <td>
                      {b.status === 'Pending' && (
                        <button 
                          className="btn-luxury" 
                          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                          onClick={() => handleUpdateStatus(b.id, 'Confirmed')}
                        >
                          Approve
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "2rem" }}>No reservations found.</td>
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
            {facilityStats.map(srv => {
              // Creating a simulated mock capacity for beautiful UI representation
              const maxCapacity = srv.category === 'Dining' ? 120 : srv.category === 'Party' ? 300 : srv.category === 'Spa' ? 20 : 100;
              const fillPercentage = Math.min(((srv.confirmed + srv.pending) / maxCapacity) * 100, 100);
              const isFull = fillPercentage >= 100;

              return (
                <div className="facility-card" key={srv.id}>
                  <div className="facility-card-header">
                    <span className="facility-title">{srv.name}</span>
                    <span className="facility-cat">{srv.category}</span>
                  </div>
                  
                  <div className="facility-details">
                    <span>Total Booked</span>
                    <span>{srv.total_bookings}</span>
                  </div>
                  <div className="facility-details">
                    <span>Confirmed Entries</span>
                    <span style={{color: '#51cf66'}}>{srv.confirmed}</span>
                  </div>
                  <div className="facility-details">
                    <span>Pending Approval</span>
                    <span style={{color: '#fcc419'}}>{srv.pending}</span>
                  </div>
                  <div className="facility-details" style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.05)'}}>
                    <span>Remaining Capacity</span>
                    <span style={{color: isFull ? '#ff6b6b' : '#fff'}}>{Math.max(maxCapacity - (srv.confirmed + srv.pending), 0)} spaces</span>
                  </div>

                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${fillPercentage}%`, background: isFull ? '#ff6b6b' : 'var(--secondary-color)' }}></div>
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
                users.map(u => (
                  <tr key={u.id}>
                    <td>V-${u.id * 832}</td>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td style={{ textTransform: 'uppercase' }}>{u.role}</td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", padding: "2rem" }}>No voyagers registered yet.</td>
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
                <input type="text" placeholder="Cruise Name (e.g. Sapphire Seas Tour)" value={newTrip.name} onChange={e => setNewTrip({...newTrip, name: e.target.value})} required />
                <input type="text" placeholder="Route (e.g. Miami -> Bahamas)" value={newTrip.route} onChange={e => setNewTrip({...newTrip, route: e.target.value})} required />
              </div>
              <div className="form-row">
                <input type="date" value={newTrip.start_date} onChange={e => setNewTrip({...newTrip, start_date: e.target.value})} required title="Start Date"/>
                <input type="number" placeholder="Duration (Days)" value={newTrip.duration_days} onChange={e => setNewTrip({...newTrip, duration_days: e.target.value})} required />
              </div>
              <div className="form-row">
                <input type="number" placeholder="Total Seats" value={newTrip.total_seats} onChange={e => setNewTrip({...newTrip, total_seats: e.target.value})} required />
                <input type="number" placeholder="Base Price ($)" value={newTrip.price} onChange={e => setNewTrip({...newTrip, price: e.target.value})} required />
                <input type="text" placeholder="Image Name (e.g. cruise1.png)" value={newTrip.image_url} onChange={e => setNewTrip({...newTrip, image_url: e.target.value})} />
              </div>
              <button type="submit" className="create-btn">Deploy Cruise</button>
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
                cruises.map(c => (
                  <tr key={c.id}>
                    <td>{c.name}</td>
                    <td>{c.route}</td>
                    <td>{new Date(c.start_date).toLocaleDateString()}</td>
                    <td>{c.duration_days} Days</td>
                    <td>
                      <span style={{ color: '#51cf66' }}>{c.available_seats} Available</span> / {c.total_seats}
                    </td>
                    <td>${c.price}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "2rem" }}>No active trips deployed.</td>
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
