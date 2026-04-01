import React, { useEffect, useState } from 'react';
import './ViewOrderedCateringItems.css';

const ViewOrderedCateringItems = () => {
  // State to hold fetched catering orders
  const [orders, setOrders] = useState([]);

  // State to manage loading status
  const [loading, setLoading] = useState(true);

  // State to capture any errors during data fetching
  const [error, setError] = useState(null);

  // useEffect to fetch data when the component mounts
  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5001/api/manager/bookings?category=Catering", {
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
      console.log("🔄 Auto-refreshing Catering orders...");
      fetchOrders();
    };

    window.addEventListener('REFRESH_BOOKINGS', handleRefresh);
    return () => window.removeEventListener('REFRESH_BOOKINGS', handleRefresh);
  }, []);

  return (
    <main className="view-catering-container">
      <h1 className="view-catering-title">Booked Catering Orders</h1>

      {/* Show loading message while data is being fetched */}
      {loading ? (
        <p className="loading-text">Loading orders...</p>

      // Show error message if there was an issue fetching data
      ) : error ? (
        <p className="error-text">{error}</p>

      // Show message when there are no orders
      ) : orders.length === 0 ? (
        <p className="no-orders-text">No catering orders found.</p>
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
                <td>{order.Service?.name || "Catering Item"}</td>
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

export default ViewOrderedCateringItems;
