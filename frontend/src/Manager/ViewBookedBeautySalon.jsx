import React from 'react';
import './ViewBookedBeautySalon.css';
import ManagerBookingsTable from './ManagerBookingsTable';

const ViewBookedBeautySalon = () => (
  <ManagerBookingsTable
    category="Beauty"
    title="Booked Beauty Salon Appointments"
    containerClassName="view-salon-container"
    tableClassName="salon-table"
    loadingMessage="Loading appointments..."
    emptyMessage="No bookings found."
    columns={['Service', 'Date', 'Start Time', 'End Time', 'Status', 'Voyager']}
    mapBookingToRow={(booking) => [
      booking.service?.name || 'Beauty Salon',
      new Date(booking.start_time).toLocaleDateString(),
      new Date(booking.start_time).toLocaleTimeString(),
      booking.end_time ? new Date(booking.end_time).toLocaleTimeString() : 'N/A',
      booking.status,
      booking.user?.name || 'Member',
    ]}
  />
);

export default ViewBookedBeautySalon;
