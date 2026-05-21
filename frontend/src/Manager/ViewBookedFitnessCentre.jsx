import React from 'react';
import './ViewBookedFitnessCentre.css';
import ManagerBookingsTable from './ManagerBookingsTable';

const ViewBookedFitnessCentre = () => (
  <ManagerBookingsTable
    category="Gym"
    title="Fitness Center"
    containerClassName="view-fitness-container"
    tableClassName="fitness-table"
    loadingMessage="Loading bookings..."
    emptyMessage="No bookings found."
    columns={['Service', 'Date', 'Start Time', 'End Time', 'Status', 'Voyager']}
    mapBookingToRow={(booking) => [
      booking.service?.name || 'Fitness Center',
      new Date(booking.start_time).toLocaleDateString(),
      new Date(booking.start_time).toLocaleTimeString(),
      booking.end_time ? new Date(booking.end_time).toLocaleTimeString() : 'N/A',
      booking.status,
      booking.user?.name || 'Member',
    ]}
  />
);

export default ViewBookedFitnessCentre;
