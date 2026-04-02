import React from 'react';
import { useQuery } from '@apollo/client/react';
import { Link } from 'react-router-dom';
import { PRODUCT_CATALOG_QUERY } from '../graphql/operations';
import ProductCard from './ProductCard';
import './ProductCatalogPage.css';

const ProductCatalogPage = ({ title, subtitle, categories }) => {
  const { data, loading, error } = useQuery(PRODUCT_CATALOG_QUERY, {
    fetchPolicy: 'cache-and-network',
  });

  const allProducts = data?.products ?? [];
  const products = allProducts.filter((product) => categories.includes(product.category));

  return (
    <div className="catalog-page">
      <div className="catalog-header">
        <h1>{title}</h1>
        <p>{subtitle}</p>
        <Link to="/voyager/cart" className="btn-luxury">View Cart</Link>
      </div>

      {loading && !data ? (
        <p className="catalog-message">Loading products...</p>
      ) : error ? (
        <p className="catalog-message">{error.message}</p>
      ) : products.length === 0 ? (
        <p className="catalog-message">No products available right now for this category.</p>
      ) : (
        <div className="catalog-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductCatalogPage;
