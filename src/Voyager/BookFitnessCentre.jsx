import React, { useState } from 'react';
import './BookFitnessCenter.css';
import { FaDumbbell, FaRunning, FaSpa, FaSwimmer } from 'react-icons/fa';

// Fitness center services list
const fitnessItems = [
  { id: 1, name: 'Gym Session', description: 'Access to full gym facilities', icon: <FaDumbbell aria-label="Gym Session icon" /> },
  { id: 2, name: 'Yoga Class', description: 'Relaxing and revitalizing session', icon: <FaSpa aria-label="Yoga Class icon" /> },
  { id: 3, name: 'Zumba Dance', description: 'Fun cardio workout', icon: <FaRunning aria-label="Zumba Dance icon" /> },
  { id: 4, name: 'Swimming', description: 'Access to indoor heated pool', icon: <FaSwimmer aria-label="Swimming icon" /> },
];

const BookFitnessCentre = () => {
  // State variables
  const [cart, setCart] = useState([]);
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Convert HH:mm to total minutes
  const timeToMinutes = (time) => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  };

  // Add selected item to cart
  const addToCart = (item) => {
    console.log(`Adding item to cart:`, item);
    const exists = cart.find((i) => i.id === item.id);
    if (exists) {
      setCart(cart.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  // Remove item from cart
  const removeFromCart = (id) => {
    console.log(`Removing item with ID ${id} from cart`);
    setCart(cart.filter((item) => item.id !== id));
  };

  // Increase item quantity
  const incrementQty = (id) => {
    console.log(`Increasing quantity of item ID ${id}`);
    setCart(cart.map((item) => item.id === id ? { ...item, quantity: item.quantity + 1 } : item));
  };

  // Decrease item quantity
  const decrementQty = (id) => {
    console.log(`Decreasing quantity of item ID ${id}`);
    setCart(cart.map((item) =>
      item.id === id ? { ...item, quantity: Math.max(1, item.quantity - 1) } : item
    ));
  };

  // Clear entire cart
  const clearCart = () => {
    console.log('Clearing cart');
    setCart([]);
  };

  // Booking placement logic
  const placeOrder = async () => {
    console.log('Attempting to place order...');

    // Validation
    if (cart.length === 0) {
      console.warn('Cart is empty.');
      alert('Your cart is empty!');
      return;
    }
    if (!date || !startTime || !endTime) {
      console.warn('Date or time not selected.');
      alert('Please select date and both start and end times.');
      return;
    }
    if (startTime >= endTime) {
      console.warn('Invalid time range.');
      alert('Start time must be before end time.');
      return;
    }

    const startInput = timeToMinutes(startTime);
    const endInput = timeToMinutes(endTime);

    setIsSubmitting(true); // Disable submit button

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
    setIsSubmitting(false);
  };

  return (
    <main className="fitness-container">
      <h1 className="fitness-title">Book Fitness Centre</h1>

      {/* Booking form */}
      <section className="fitness-form" aria-label="Booking time and date form">
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
      </section>

      {/* Fitness items listing */}
      <section className="fitness-grid" aria-label="Available fitness services">
        {fitnessItems.map(({ id, name, description, icon }) => (
          <article key={id} className="fitness-card" tabIndex={0} aria-describedby={`desc-${id}`}>
            <div className="fitness-icon" aria-hidden="true">{icon}</div>
            <h3>{name}</h3>
            <p id={`desc-${id}`}>{description}</p>
            <button onClick={() => addToCart({ id, name, description })}>
              Add
            </button>
          </article>
        ))}
      </section>

      {/* Cart section */}
      <aside className="fitness-cart" aria-label="Selected bookings">
        <h2>Your Bookings</h2>
        {cart.length === 0 ? (
          <p style={{ textAlign: 'center' }}>No bookings yet.</p>
        ) : (
          <>
            <ul>
              {cart.map(({ id, name, quantity }) => (
                <li key={id} className="fitness-cart-item">
                  <span>{name} x {quantity}</span>
                  <div className="fitness-cart-buttons" role="group" aria-label={`${name} quantity controls`}>
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
            <div className='fitness-button-group'>
              <button className="fitness-clear-button" onClick={clearCart}>
                Clear All
              </button>
              <button
                className="fitness-order-button"
                onClick={placeOrder}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Booking...' : 'Confirm'}
              </button>
            </div>
          </>
        )}
      </aside>
    </main>
  );
};

export default BookFitnessCentre;
