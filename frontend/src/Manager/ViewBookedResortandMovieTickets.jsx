import React from 'react';
import './ViewBookedResortandMovieTickets.css';
import ManagerBookingsTable from './ManagerBookingsTable';

const ViewBookedResortAndMovieTickets = () => (
  <ManagerBookingsTable
    category="Entertainment"
    title="Booked Resort & Movie Tickets"
    titleClassName="view-resort-title"
    containerClassName="view-resort-container"
    tableClassName="resort-table"
    loadingMessage="Loading bookings..."
    emptyMessage="No bookings found."
    useMain
    columns={['Service Name', 'Type', 'Date', 'Start Time', 'End Time', 'Status', 'Voyager']}
    mapBookingToRow={(booking) => [
      booking.service?.name || 'Entertainment Access',
      booking.service?.category || 'N/A',
      new Date(booking.start_time).toLocaleDateString(),
      new Date(booking.start_time).toLocaleTimeString(),
      booking.end_time ? new Date(booking.end_time).toLocaleTimeString() : 'N/A',
      booking.status,
      booking.user?.name || 'Member',
    ]}
  />
);

export default ViewBookedResortAndMovieTickets;
