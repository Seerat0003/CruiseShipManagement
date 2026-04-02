import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from './CartContext';
import './CartPage.css';

const CartPage = () => {
  const navigate = useNavigate();
  const {
    cartItems,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
    totalPrice,
  } = useCart();

  return (
    <div className="cart-page">
      <div className="cart-header">
        <h1>My Cart</h1>
        <p>Review selected products before checkout.</p>
      </div>

      {cartItems.length === 0 ? (
        <div className="cart-empty">
          <p>Your cart is empty.</p>
          <Link className="btn-luxury" to="/voyager/catering">Start Shopping</Link>
        </div>
      ) : (
        <>
          <div className="cart-list">
            {cartItems.map((item) => (
              <div className="cart-item" key={item.id}>
                <div>
                  <h3>{item.name}</h3>
                  <p>{item.category}</p>
                  <span>${Number.parseFloat(item.price || 0).toLocaleString()} each</span>
                </div>

                <div className="cart-controls">
                  <button onClick={() => decreaseQuantity(item.id)}>-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => increaseQuantity(item.id)}>+</button>
                </div>

                <div className="cart-line-total">
                  ${(Number.parseFloat(item.price || 0) * item.quantity).toLocaleString()}
                </div>

                <button className="cart-remove" onClick={() => removeFromCart(item.id)}>
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="cart-footer">
            <button className="btn-luxury" onClick={clearCart}>Clear Cart</button>
            <div className="cart-summary">
              <span>Total</span>
              <strong>${totalPrice.toLocaleString()}</strong>
            </div>
            <button className="btn-luxury" onClick={() => navigate('/voyager/checkout')}>Proceed to Checkout</button>
          </div>
        </>
      )}
    </div>
  );
};

export default CartPage;
