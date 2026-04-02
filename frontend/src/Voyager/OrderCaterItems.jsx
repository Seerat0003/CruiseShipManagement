import React from 'react';
import ProductCatalogPage from './ProductCatalogPage';

const OrderCaterItems = () => {
   return (
      <ProductCatalogPage
         title="In-Cabin Catering"
         subtitle="Choose real onboard products with live pricing and stock visibility."
         categories={['Dining', 'Catering', 'Food']}
      />
   );
};

export default OrderCaterItems;
