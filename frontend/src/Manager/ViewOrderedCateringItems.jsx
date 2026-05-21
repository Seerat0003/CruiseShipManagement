import React from 'react';
import './ViewOrderedCateringItems.css';
import ManagerBookingsTable from './ManagerBookingsTable';

const ViewOrderedCateringItems = () => (
  <ManagerBookingsTable
    category="Catering"
    title="Booked Catering Orders"
    titleClassName="view-catering-title"
    containerClassName="view-catering-container"
    tableClassName="bookings-table"
    loadingMessage="Loading orders..."
    emptyMessage="No catering orders found."
    useMain
    columns={['Req ID', 'Voyager', 'Item Name', 'Scheduled Time', 'Status']}
    mapBookingToRow={(booking) => [
      `#${booking.id}`,
      booking.user?.name || 'Member',
      booking.service?.name || 'Catering Item',
      new Date(booking.start_time).toLocaleString(),
      booking.status,
    ]}
  />
);

export default ViewOrderedCateringItems;
