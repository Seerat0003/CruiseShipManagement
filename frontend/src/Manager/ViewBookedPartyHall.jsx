import React from 'react';
import './ViewBookedPartyHall.css';
import ManagerBookingsTable from './ManagerBookingsTable';

const ViewBookedPartyHalls = () => (
  <ManagerBookingsTable
    category="Party"
    title="Booked Party Halls"
    containerClassName="view-bookings-container"
    tableClassName="bookings-table"
    loadingMessage="Loading bookings..."
    emptyMessage="No bookings found."
    columns={['Hall Name', 'Date', 'Start Time', 'End Time', 'Status', 'Voyager']}
    mapBookingToRow={(booking) => [
      booking.service?.name || 'Party Hall',
      new Date(booking.start_time).toLocaleDateString(),
      new Date(booking.start_time).toLocaleTimeString(),
      booking.end_time ? new Date(booking.end_time).toLocaleTimeString() : 'N/A',
      booking.status,
      booking.user?.name || 'Member',
    ]}
  />
);

export default ViewBookedPartyHalls;
