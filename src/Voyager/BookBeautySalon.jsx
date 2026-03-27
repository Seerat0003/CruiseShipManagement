import React, { useState } from 'react';
import './BookBeautySalon.css';
import { FaCut, FaSpa, FaPaintBrush, FaHotTub } from 'react-icons/fa';

// List of available salon services
const salonItems = [
  { id: 1, name: 'Haircut', description: 'Professional styling and trimming', icon: <FaCut aria-label="Haircut icon" /> },
  { id: 2, name: 'Facial', description: 'Rejuvenating skincare treatment', icon: <FaSpa aria-label="Facial icon" /> },
  { id: 3, name: 'Manicure', description: 'Nail shaping and polish', icon: <FaPaintBrush aria-label="Manicure icon" /> },
  { id: 4, name: 'Body Spa', description: 'Full-body relaxation massage', icon: <FaHotTub aria-label="Body Spa icon" /> },
];

const BookBeautySalon = () => {
  // State for cart and booking form inputs
  const [cart, setCart] = useState([]);
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  // Add an item to the cart or increase its quantity if already in cart
  const addToCart = (item) => {
    const exists = cart.find((i) => i.id === item.id);
    if (exists) {
      setCart(cart.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  // Remove an item from the cart
  const removeFromCart = (id) => setCart(cart.filter((item) => item.id !== id));

  // Increase quantity of an item
  const incrementQty = (id) => {
    setCart(cart.map((item) => item.id === id ? { ...item, quantity: item.quantity + 1 } : item));
  };

  // Decrease quantity (minimum 1) or remove if 1 and user chooses to
  const decrementQty = (id) => {
    setCart(cart.map((item) =>
      item.id === id ? { ...item, quantity: Math.max(1, item.quantity - 1) } : item
    ));
  };

  // Clear all selected services
  const clearCart = () => setCart([]);

  // Handle the booking confirmation process
  const placeOrder = async () => {
    // Validation: Empty cart
    if (cart.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    // Validation: Empty date/time
    if (!date || !startTime || !endTime) {
      alert('Please select date and both start and end times.');
      return;
    }

    // Validation: Time logic
    if (startTime >= endTime) {
      alert('Start time must be before end time.');
      return;
    }

    console.log('Booking submitted locally.', { cart, date, startTime, endTime });
    alert('Booking confirmed locally. Persistence is not wired.');
    clearCart();
    setDate('');
    setStartTime('');
    setEndTime('');
  };

  return (
    <main className="salon-container">
      <h1 className="salon-title">Book Beauty Salon</h1>

      {/* Booking form for date, start time, and end time */}
      <div className="salon-form">
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

      {/* Display of available salon services */}
      <section className="salon-grid" aria-label="Available salon services">
        {salonItems.map(({ id, name, description, icon }) => (
          <article key={id} className="salon-card" tabIndex={0} aria-describedby={`desc-${id}`}>
            <div className="salon-icon" aria-hidden="true">{icon}</div>
            <h3>{name}</h3>
            <p id={`desc-${id}`}>{description}</p>
            <button onClick={() => addToCart({ id, name, description })} aria-label={`Add ${name} to booking`}>
              Add
            </button>
          </article>
        ))}
      </section>

      {/* Cart for selected services */}
      <aside className="salon-cart" aria-label="Selected bookings">
        <h2>Your Bookings</h2>

        {cart.length === 0 ? (
          <p style={{ textAlign: 'center' }}>No services selected.</p>
        ) : (
          <>
            <ul>
              {cart.map(({ id, name, quantity }) => (
                <li key={id} className="salon-cart-item">
                  <span>{name} × {quantity}</span>
                  <div className="salon-cart-buttons" role="group" aria-label={`${name} quantity controls`}>
                    <button onClick={() => incrementQty(id)} aria-label={`Increase quantity of ${name}`}>+</button>
                    {quantity > 1 ? (
                      <button onClick={() => decrementQty(id)} aria-label={`Decrease quantity of ${name}`}>−</button>
                    ) : (
                      <button onClick={() => removeFromCart(id)} aria-label={`Remove ${name} from booking`}>Remove</button>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            {/* Action buttons to clear or confirm */}
            <div className='salon-button-group'>
              <button className="salon-clear-button" onClick={clearCart} aria-label="Clear all bookings">
                Clear All
              </button>
              <button className="salon-order-button" onClick={placeOrder} aria-label="Confirm booking">
                Confirm
              </button>
            </div>
          </>
        )}
      </aside>
    </main>
  );
};

export default BookBeautySalon;
