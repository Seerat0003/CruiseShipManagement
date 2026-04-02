import React from 'react';
import ProductCatalogPage from './ProductCatalogPage';

const cateringCategories = [
   'Dining',
   'Catering',
   'Food',
   'Starter',
   'Friday Special',
   'Dinner',
   'Desserts',
   'Chinese',
   'Japanese',
];

const OrderCaterItems = () => {
   return (
      <ProductCatalogPage
         title="In-Cabin Catering"
         subtitle="Choose real onboard products with live pricing and stock visibility."
         categories={cateringCategories}
      />
   );
};

export default OrderCaterItems;
