import React, { useEffect, useState } from 'react';
import './ViewOrderedStationeryItems.css';

const ViewOrderedStationeryItems = () => {
  // State to hold fetched orders
  const [orders, setOrders] = useState([]);
  // State to track loading
  const [loading, setLoading] = useState(true);
  // State to handle errors
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5001/api/manager/bookings?category=Stationery", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setOrders(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    const handleRefresh = () => {
      console.log("🔄 Auto-refreshing Stationery orders...");
      fetchOrders();
    };

    window.addEventListener('REFRESH_BOOKINGS', handleRefresh);
    return () => window.removeEventListener('REFRESH_BOOKINGS', handleRefresh);
  }, []);

  return (
    <main className="view-stationery-container">
      <h1 className="view-stationery-title">Booked Stationery Orders</h1>

      {loading ? (
        <p className="loading-text">Loading orders...</p>
      ) : error ? (
        <p className="error-text">{error}</p>
      ) : orders.length === 0 ? (
        <p className="no-orders-text">No stationery orders found.</p>
      ) : (
        <table className="bookings-table">
          <thead>
            <tr>
              <th>Req ID</th>
              <th>Voyager</th>
              <th>Item Name</th>
              <th>Scheduled Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>#{order.id}</td>
                <td>{order.User?.name || "Member"}</td>
                <td>{order.Service?.name || "Stationery Item"}</td>
                <td>{new Date(order.start_time).toLocaleString()}</td>
                <td>
                  <span style={{ color: order.status === 'Confirmed' ? '#51cf66' : '#fcc419' }}>
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

    </main>
  );
};

export default ViewOrderedStationeryItems;
