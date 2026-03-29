import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      };

      const statsRes = await fetch("http://localhost:5001/api/admin/stats", { headers });
      if (statsRes.ok) {
        setStats(await statsRes.json());
      } else if (statsRes.status === 401 || statsRes.status === 403) {
        alert("Admin Access Denied. Please Sign In as Admin.");
        return;
      }

      const bookingsRes = await fetch("http://localhost:5001/api/admin/bookings", { headers });
      if (bookingsRes.ok) {
        setBookings(await bookingsRes.json());
      }
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
      if (res.ok) {
        fetchDashboardData();
      }
    } catch (err) {
      console.error("Failed to update status");
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

      {stats && (
        <div className="dashboard-grid">
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
            <div className="stat-lbl">Facility Reservations</div>
          </div>
          <div className="stat-card">
            <div className="stat-val" style={{ color: "#ff6b6b" }}>{stats.bookedSeats}</div>
            <div className="stat-lbl">Seats occupied</div>
          </div>
          <div className="stat-card">
            <div className="stat-val" style={{ color: "#51cf66" }}>{stats.availableSeats}</div>
            <div className="stat-lbl">Seats Available</div>
          </div>
        </div>
      )}

      <h3 className="page-title" style={{ fontSize: '1.8rem', border: 'none' }}>Live Activity Reservations</h3>
      <table>
        <thead>
          <tr>
            <th>Booking ID</th>
            <th>Type</th>
            <th>Facility / Service</th>
            <th>Voyager</th>
            <th>Date & Time</th>
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
                <td>{b.User ? b.User.name : "System"}</td>
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
              <td colSpan="5" style={{ textAlign: "center", padding: "2rem" }}>No reservations found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDashboard;
