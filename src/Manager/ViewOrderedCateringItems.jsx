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
  useEffect(() => {
    const fetchOrders = async () => {
      setOrders([]);
      setError(null);
      setLoading(false);
    };

    // Start fetching orders when component is mounted
    console.log("Component mounted. Triggering fetchOrders...");
    fetchOrders();
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

      // Render the list of orders when available
      ) : (
        <ul className="orders-list">
          {orders.map(({ id, items, total, timestamp }) => (
            <li key={id} className="order-card">
              <h3>Order ID: {id}</h3>
              
              {/* Display the order's timestamp */}
              <p>
                <strong>Placed At:</strong>{" "}
                {
                  // Support either Date-like values or ISO strings
                  timestamp?.toDate
                    ? timestamp.toDate().toLocaleString()
                    : new Date(timestamp).toLocaleString()
                }
              </p>

              {/* Display the total cost */}
              <p><strong>Total Amount:</strong> ${total.toFixed(2)}</p>

              {/* Display all items in the order */}
              <div>
                <strong>Items:</strong>
                <ul className="order-items-list">
                  {items.map(({ id: itemId, name, quantity, price }) => (
                    <li key={itemId}>
                      {name} — Quantity: {quantity} — Price: ${(price * quantity).toFixed(2)}
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
};

export default ViewOrderedCateringItems;
