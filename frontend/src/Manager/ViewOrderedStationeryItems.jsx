import React from 'react';
import './ViewOrderedStationeryItems.css';
import ManagerBookingsTable from './ManagerBookingsTable';

const ViewOrderedStationeryItems = () => (
  <ManagerBookingsTable
    category="Stationery"
    title="Booked Stationery Orders"
    titleClassName="view-stationery-title"
    containerClassName="view-stationery-container"
    tableClassName="bookings-table"
    loadingMessage="Loading orders..."
    emptyMessage="No stationery orders found."
    useMain
    columns={['Req ID', 'Voyager', 'Item Name', 'Scheduled Time', 'Status']}
    mapBookingToRow={(booking) => [
      `#${booking.id}`,
      booking.user?.name || 'Member',
      booking.service?.name || 'Stationery Item',
      new Date(booking.start_time).toLocaleString(),
      booking.status,
    ]}
  />
);

export default ViewOrderedStationeryItems;
