import React, { useState, useEffect } from 'react';
import './OrderCaterItems.css';

function OrderCaterItems() {
  // State to store the menu items grouped by category
  // Example: { "Starters": [...], "Main Course": [...], ... }
  const [menu, setMenu] = useState({});

  // State to store the user's current cart selections
  // The cart is an object keyed by item ID for quick lookup and modification
  // Example: { itemId1: { id, name, price, quantity }, itemId2: {...}, ... }
  const [cart, setCart] = useState({});

  // useEffect hook to initialize menu data when the component mounts
  useEffect(() => {
    // Async function to fetch the menu items
    const fetchMenu = async () => {
      console.log("Menu loading placeholder.");
      setMenu({});
    };

    fetchMenu();
  }, []); // Empty dependency array means this runs once on mount

  /**
   * Adds an item to the cart or increments its quantity if already present.
   * @param {Object} item - The menu item object to add
   */
  const addToCart = (item) => {
    console.log(`Adding to cart: ${item.name}`);

    // Use functional form to access previous state safely
    setCart(prev => ({
      ...prev,
      [item.id]: {
        ...item,
        quantity: (prev[item.id]?.quantity || 0) + 1  // Increment quantity or start at 1
      }
    }));
  };

  /**
   * Increments the quantity of an item already in the cart.
   * @param {string} id - The selected item ID
   */
  const increment = (id) => {
    console.log(`Incrementing quantity for item ID: ${id}`);
    setCart(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        quantity: prev[id].quantity + 1
      }
    }));
  };

  /**
   * Decrements the quantity of an item in the cart.
   * If quantity reaches 0, the item is removed from the cart.
   * @param {string} id - The selected item ID
   */
  const decrement = (id) => {
    console.log(`Decrementing quantity for item ID: ${id}`);

    setCart(prev => {
      // Create a shallow copy of cart state
      const updated = { ...prev };

      // Check if quantity is greater than 1, then decrement
      if (updated[id].quantity > 1) {
        updated[id].quantity -= 1;
      } else {
        // Quantity would drop below 1, so remove item completely
        console.log(`Removing item ID ${id} from cart because quantity reached 0`);
        delete updated[id];
      }
      return updated; // Return updated cart state
    });
  };

  /**
   * Removes an item from the cart regardless of quantity.
   * @param {string} id - The selected item ID to remove
   */
  const removeFromCart = (id) => {
    console.log(`Removing item ID ${id} from cart`);

    setCart(prev => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
  };

  /**
   * Clears the entire cart, removing all selected items.
   */
  const clearCart = () => {
    console.log("Clearing cart...");
    setCart({});
  };

  // Convert the cart object to an array for iteration and rendering
  const orderItems = Object.values(cart);

  // Calculate the total price of all items in the cart
  const totalAmount = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  /**
   * Handles the submission of the order.
   * Validates the cart before submitting.
   */
  const placeOrder = async () => {
    // Prevent submission if cart is empty
    if (orderItems.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    console.log("Order submitted locally.", orderItems);
    alert(`Order confirmed locally. Persistence is not wired. Total: $${totalAmount.toFixed(2)}`);
    clearCart();
  };

  return (
    <div className="catering-container">
      {/* Main heading */}
      <h1 className="caterting-title">Catering Order</h1>

      {/* Render menu categories and items */}
      {Object.entries(menu).map(([category, items]) => (
        <div key={category}>
          {/* Category title */}
          <h2 style={{ color: '#1558b0', margin: '1.5rem 0 1rem' }}>{category}</h2>

          {/* Grid layout for menu items */}
          <div className="catering-grid">
            {items.map(item => (
              <div key={item.id} className="catering-card">
                {/* Item name */}
                <h3>{item.name}</h3>

                {/* Item price formatted to 2 decimal places */}
                <p>Price: ${item.price.toFixed(2)}</p>

                {/* Button to add item to cart */}
                <button onClick={() => addToCart(item)}>Add</button>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Cart section */}
      <div className="catering-cart">
        <h2>Your Order</h2>

        {/* Conditional rendering based on cart content */}
        {orderItems.length > 0 ? (
          <>
            {/* List each cart item */}
            <ul>
              {orderItems.map(({ id, name, quantity }) => (
                <li key={id} className="catering-cart-item">
                  {/* Display item name and quantity */}
                  <span>{name} (x{quantity})</span>

                  {/* Buttons to increment, decrement, or remove item */}
                  <div className="catering-cart-buttons">
                    <button onClick={() => increment(id)}>+</button>

                    {/* If quantity is more than 1, show decrement, else remove */}
                    {quantity > 1 ? (
                      <button onClick={() => decrement(id)}>−</button>
                    ) : (
                      <button onClick={() => removeFromCart(id)}>Remove</button>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            {/* Action buttons for cart management */}
            <div className="catering-button-group">
              <button className="catering-clear-button" onClick={clearCart}>
                Clear Cart
              </button>
              <button className="catering-order-button" onClick={placeOrder}>
                Confirm Booking
              </button>
            </div>
          </>
        ) : (
          // Message when cart is empty
          <p style={{ textAlign: 'center' }}>No items added.</p>
        )}
      </div>
    </div>
  );
}

export default OrderCaterItems;
