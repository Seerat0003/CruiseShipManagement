import React from 'react';
import ProductCatalogPage from './ProductCatalogPage';

const stationeryCategories = [
   'Gifts',
   'Stationery',
   'Retail',
   'Writing Tools',
   'Notes & Pads',
   'Measuring Tools',
   'Accessories',
];

const OrderStationeryItems = () => {
   return (
      <ProductCatalogPage
         title="Stationery & Boutique"
         subtitle="Browse writing and retail essentials available for your voyage."
         categories={stationeryCategories}
      />
   );
};

export default OrderStationeryItems;
