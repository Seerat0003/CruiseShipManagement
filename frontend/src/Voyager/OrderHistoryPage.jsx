import React from 'react';
import { useQuery } from '@apollo/client/react';
import { MY_ORDERS_QUERY } from '../graphql/operations';
import './OrderHistoryPage.css';

const OrderHistoryPage = () => {
  const { data, loading, error } = useQuery(MY_ORDERS_QUERY, {
    fetchPolicy: 'cache-and-network',
  });

  const orders = data?.myOrders ?? [];

  return (
    <div className="order-history-page">
      <h1>Order History</h1>
      {loading && !data ? (
        <p>Loading your orders...</p>
      ) : error ? (
        <p>{error.message}</p>
      ) : orders.length === 0 ? (
        <p>No product orders found yet.</p>
      ) : (
        <div className="order-history-list">
          {orders.map((order) => (
            <div className="order-card" key={order.id}>
              <div className="order-card-header">
                <h3>Order #{order.id}</h3>
                <span>{new Date(order.created_at).toLocaleString()}</span>
              </div>

              <div className="order-items">
                {order.items.map((item) => (
                  <div className="order-item" key={item.id}>
                    <span>{item.product?.name}</span>
                    <span>Qty {item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="order-total">Total: ${Number.parseFloat(order.total || 0).toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistoryPage;
