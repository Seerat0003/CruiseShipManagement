import React, { useEffect, useState } from 'react';
import './ViewOrderedStationeryItems.css';

const ViewOrderedStationeryItems = () => {
  // State to hold fetched orders
  const [orders, setOrders] = useState([]);
  // State to track loading
  const [loading, setLoading] = useState(true);
  // State to handle errors
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setOrders([]);
      setError(null);
      setLoading(false);
    };

    fetchOrders();
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
        <ul className="orders-list">
          {orders.map(({ id, items, total, timestamp }) => (
            <li key={id} className="order-card">
              <h3>Order ID: {id}</h3>
              <p>
                <strong>Placed At:</strong>{' '}
                {timestamp?.toDate
                  ? timestamp.toDate().toLocaleString()
                  : new Date(timestamp).toLocaleString()}
              </p>
              <p>
                <strong>Total Amount:</strong> ${total?.toFixed(2) || '0.00'}
              </p>
              <div>
                <strong>Items:</strong>
                <ul className="order-items-list">
                  {items?.map(({ id: itemId, name, quantity, price }) => (
                    <li key={itemId}>
                      {name} — Quantity: {quantity} — Price: $
                      {(price * quantity).toFixed(2)}
                    </li>
                  )) || <li>No items found.</li>}
                </ul>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
};

export default ViewOrderedStationeryItems;
