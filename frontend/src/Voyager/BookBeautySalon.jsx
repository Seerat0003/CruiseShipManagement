import React from 'react';
import ServiceBookingTemplate from './ServiceBookingTemplate';

const BookBeautySalon = () => {
   return <ServiceBookingTemplate title="Beauty Salon & Spa" categoryFilter={['Beauty', 'Gym', 'Party', 'Entertainment', 'Dining', 'Stationery']} />;
};

export default BookBeautySalon;
