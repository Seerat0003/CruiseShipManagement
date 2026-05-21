import React from 'react';
import './ViewOrderedStationeryItems.css';
import ManagerBookingsTable from './ManagerBookingsTable';

const ViewOrderedStationeryItems = () => (
  <ManagerBookingsTable
    category="Stationery"
    title="Booked Gear & Equipment Orders"
    titleClassName="view-stationery-title"
    containerClassName="view-stationery-container"
    tableClassName="bookings-table"
    loadingMessage="Loading orders..."
    emptyMessage="No gear or equipment orders found."
    useMain
    columns={['Req ID', 'Voyager', 'Item Name', 'Scheduled Time', 'Status']}
    mapBookingToRow={(booking) => [
      `#${booking.id}`,
      booking.user?.name || 'Member',
      booking.service?.name || 'Onboard Gear',
      new Date(booking.start_time).toLocaleString(),
      booking.status,
    ]}
  />
);

export default ViewOrderedStationeryItems;
