import React, { useState } from 'react';
import './BookPartyHall.css';

// List of available halls
const hallItems = [
  { id: 1, name: 'Banquet Hall A', description: 'Spacious hall with stage and lighting' },
  { id: 2, name: 'Garden Venue', description: 'Outdoor garden for ceremonies and parties' },
  { id: 3, name: 'Kids Party Room', description: 'Colorful room ideal for birthday parties' },
  { id: 4, name: 'Luxury Lounge', description: 'Elegant lounge with modern décor' },
];

const BookPartyHall = () => {
  // State for booking cart and form fields
  const [cart, setCart] = useState([]);
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  // Converts HH:MM string to total minutes
  const timeToMinutes = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Add hall to cart
  const addToCart = (item) => {
    console.log(`Adding hall to cart: ${item.name}`);
    const exists = cart.find((i) => i.id === item.id);
    if (exists) {
      setCart(cart.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  // Remove hall from cart
  const removeFromCart = (id) => {
    const removedItem = cart.find((i) => i.id === id);
    console.log(`Removing hall from cart: ${removedItem?.name}`);
    setCart(cart.filter((item) => item.id !== id));
  };

  // Increase quantity of a selected hall
  const incrementQty = (id) => {
    const item = cart.find((i) => i.id === id);
    console.log(`Increasing quantity for: ${item?.name}`);
    setCart(cart.map((item) => item.id === id ? { ...item, quantity: item.quantity + 1 } : item));
  };

  // Decrease quantity or limit to 1
  const decrementQty = (id) => {
    const item = cart.find((i) => i.id === id);
    console.log(`Decreasing quantity for: ${item?.name}`);
    setCart(cart.map((item) =>
      item.id === id ? { ...item, quantity: Math.max(1, item.quantity - 1) } : item
    ));
  };

  // Clear the cart completely
  const clearCart = () => {
    console.log('Clearing all selected halls.');
    setCart([]);
  };

  // Handle booking confirmation logic
  const placeOrder = async () => {
    console.log('Attempting to place booking...');

    // Validate input fields
    if (cart.length === 0) {
      console.warn('Booking failed: Cart is empty');
      alert('Your cart is empty!');
      return;
    }

    if (!date || !startTime || !endTime) {
      console.warn('Booking failed: Missing date/time fields');
      alert('Please select a date and both start and end times.');
      return;
    }

    const startInput = timeToMinutes(startTime);
    const endInput = timeToMinutes(endTime);

    if (startInput >= endInput) {
      console.warn('Booking failed: Invalid time range');
      alert('Start time must be before end time.');
      return;
    }

    console.log('Booking submitted locally.', {
      cart,
      date,
      startTime,
      endTime,
      durationInMinutes: endInput - startInput,
    });
    alert('Booking confirmed locally. Persistence is not wired.');
    clearCart();
    setDate('');
    setStartTime('');
    setEndTime('');
  };

  return (
    <main className="booking-container">
      <h1 className="booking-title">Book a Party Hall</h1>

      {/* Booking Form Section */}
      <div className="booking-form">
        <label>
          Select Date:
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </label>
        <label>
          Start Time:
          <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
        </label>
        <label>
          End Time:
          <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
        </label>
      </div>

      {/* Hall Display Section */}
      <section className="booking-grid" aria-label="Available party halls">
        {hallItems.map(({ id, name, description }) => (
          <article key={id} className="booking-card" tabIndex={0}>
            <h3>{name}</h3>
            <p>{description}</p>
            <button onClick={() => addToCart({ id, name, description })}>
              Add
            </button>
          </article>
        ))}
      </section>

      {/* Cart Sidebar Section */}
      <aside className="booking-cart" aria-label="Selected party halls for booking">
        <h2>Your Booking List</h2>
        {cart.length === 0 ? (
          <p style={{ textAlign: 'center' }}>No halls selected.</p>
        ) : (
          <>
            <ul>
              {cart.map(({ id, name, quantity }) => (
                <li key={id} className="booking-cart-item">
                  <span>{name} × {quantity}</span>
                  <div className="booking-cart-buttons">
                    <button onClick={() => incrementQty(id)}>+</button>
                    {quantity > 1 ? (
                      <button onClick={() => decrementQty(id)}>−</button>
                    ) : (
                      <button onClick={() => removeFromCart(id)}>Remove</button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            <div className="booking-button-group">
              <button className="booking-clear-button" onClick={clearCart}>
                Clear All
              </button>
              <button className="booking-order-button" onClick={placeOrder}>
                Confirm Booking
              </button>
            </div>
          </>
        )}
      </aside>
    </main>
  );
};

export default BookPartyHall;
