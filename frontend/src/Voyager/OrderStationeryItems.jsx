import React from 'react';
import ProductCatalogPage from './ProductCatalogPage';

const OrderStationeryItems = () => {
   return (
      <ProductCatalogPage
         title="Stationery & Boutique"
         subtitle="Browse writing and retail essentials available for your voyage."
         categories={['Gifts', 'Stationery', 'Retail']}
      />
   );
};

export default OrderStationeryItems;
