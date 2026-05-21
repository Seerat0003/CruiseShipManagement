import React, { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useCart } from '../cart/CartContext';
import { PLACE_ORDER_MUTATION } from '../graphql/operations';
import './CheckoutPage.css';

const CheckoutPage = () => {
  const { cartItems, totalPrice, clearCart } = useCart();
  const [placeOrder, { loading }] = useMutation(PLACE_ORDER_MUTATION);
  const [confirmation, setConfirmation] = useState(null);

  const submitOrder = async () => {
    if (cartItems.length === 0) {
      toast.info('Your cart is empty.');
      return;
    }

    try {
      const { data } = await placeOrder({
        variables: {
          items: cartItems.map((item) => ({
            product_id: item.id,
            quantity: item.quantity,
          })),
        },
      });

      setConfirmation(data.placeOrder);
      clearCart();
      toast.success('Order placed successfully.');
    } catch (error) {
      toast.error(error?.graphQLErrors?.[0]?.message || error.message || 'Order placement failed.');
    }
  };

  return (
    <div className="checkout-page">
      <h1>Checkout</h1>
      {confirmation ? (
        <div className="checkout-confirmation">
          <h2>Order Confirmed</h2>
          <p>Total Amount: ${Number.parseFloat(confirmation.total || 0).toLocaleString()}</p>
          <div className="confirmation-list">
            {confirmation.items.map((item) => (
              <div key={item.id} className="confirmation-item">
                <span>{item.product?.name}</span>
                <span>Qty {item.quantity}</span>
              </div>
            ))}
          </div>
          <Link to="/voyager/orders" className="btn-luxury">View Order History</Link>
        </div>
      ) : (
        <>
          <div className="checkout-list">
            {cartItems.map((item) => (
              <div className="checkout-item" key={item.id}>
                <div>
                  <h3>{item.name}</h3>
                  <p>{item.category}</p>
                </div>
                <div>
                  Qty {item.quantity}
                </div>
                <div>${(Number.parseFloat(item.price || 0) * item.quantity).toLocaleString()}</div>
              </div>
            ))}
          </div>

          <div className="checkout-footer">
            <div className="checkout-total">Total: ${totalPrice.toLocaleString()}</div>
            <button className="btn-luxury" disabled={loading} onClick={submitOrder}>
              {loading ? 'Placing Order...' : 'Place Order'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CheckoutPage;
