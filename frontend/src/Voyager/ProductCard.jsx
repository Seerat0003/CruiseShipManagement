import React from 'react';
import { useCart } from '../cart/CartContext';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  const stock = Number.parseInt(product.stock, 10) || 0;
  const outOfStock = stock <= 0;
  const lowStock = stock > 0 && stock <= 5;

  return (
    <div className="product-card">
      <div className="product-card-top">
        <h3>{product.name}</h3>
        <span className="product-category">{product.category}</span>
      </div>

      <div className="product-card-meta">
        <span className="product-price">${Number.parseFloat(product.price || 0).toLocaleString()}</span>
        <span className={`stock-chip ${outOfStock ? 'empty' : lowStock ? 'low' : 'ok'}`}>
          {outOfStock ? 'Out of stock' : lowStock ? `Low stock: ${stock}` : `In stock: ${stock}`}
        </span>
      </div>

      <button
        className="btn-luxury product-add-btn"
        disabled={outOfStock}
        onClick={() => addToCart(product)}
      >
        {outOfStock ? 'Unavailable' : 'Add to Cart'}
      </button>
    </div>
  );
};

export default ProductCard;
