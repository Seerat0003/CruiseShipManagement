import React from 'react';
import ServiceBookingTemplate from './ServiceBookingTemplate';

const OrderCaterItems = () => {
   return <ServiceBookingTemplate title="In-Cabin Catering Options" categoryFilter={['Dining', 'Catering', 'Food']} />;
};

export default OrderCaterItems;
