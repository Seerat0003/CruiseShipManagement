import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CART_KEY = 'voyager_ecommerce_cart';

const CartContext = createContext(null);

const parseSavedCart = () => {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(parseSavedCart);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product) => {
    if (!product) {
      return;
    }

    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => String(item.id) === String(product.id));
      if (!existingItem) {
        return [...prevItems, { ...product, quantity: 1 }];
      }

      const maxStock = Number.parseInt(product.stock, 10) || 0;
      return prevItems.map((item) => {
        if (String(item.id) !== String(product.id)) {
          return item;
        }

        const nextQuantity = Math.min(item.quantity + 1, maxStock || item.quantity + 1);
        return { ...item, quantity: nextQuantity };
      });
    });
  };

  const removeFromCart = (productId) => {
    setCartItems((prevItems) => prevItems.filter((item) => String(item.id) !== String(productId)));
  };

  const increaseQuantity = (productId) => {
    setCartItems((prevItems) => prevItems.map((item) => {
      if (String(item.id) !== String(productId)) {
        return item;
      }

      const maxStock = Number.parseInt(item.stock, 10) || item.quantity;
      return {
        ...item,
        quantity: Math.min(item.quantity + 1, maxStock),
      };
    }));
  };

  const decreaseQuantity = (productId) => {
    setCartItems((prevItems) => prevItems
      .map((item) => {
        if (String(item.id) !== String(productId)) {
          return item;
        }

        return {
          ...item,
          quantity: Math.max(item.quantity - 1, 1),
        };
      }));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const totalItems = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  );

  const totalPrice = useMemo(
    () => cartItems.reduce((sum, item) => sum + (Number.parseFloat(item.price) || 0) * item.quantity, 0),
    [cartItems]
  );

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
    totalItems,
    totalPrice,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used inside CartProvider');
  }

  return context;
};
