import React from 'react';
import ProductCatalogPage from './ProductCatalogPage';

const stationeryCategories = [
   'Safety Equipment',
   'Cabin Furniture',
   'Galley Gear',
   'Boutique Merchandise',
   'Recreation Gear',
   'Gifts',
   'Retail',
];

const OrderStationeryItems = () => {
   return (
      <ProductCatalogPage
         title="Boutique & Onboard Gear"
         subtitle="Browse premium cabin furniture, safety equipment, recreation gear, and boutique items for your voyage."
         categories={stationeryCategories}
      />
   );
};

export default OrderStationeryItems;
