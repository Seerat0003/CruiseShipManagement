import React, { useEffect, useState } from 'react';
import './ViewBookedResortandMovieTickets.css';

const ViewBookedResortAndMovieTickets = () => {
  // State to store bookings
  const [bookings, setBookings] = useState([]);
  // State to manage loading indicator
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      setBookings([]);
      setLoading(false);
    };

    fetchBookings(); // Trigger fetch when component mounts
  }, []);

  return (
    <main className="view-resort-container">
      <h1 className="view-resort-title">Booked Resort & Movie Tickets</h1>

      {loading ? (
        // While loading is true, show loading message
        <p className="loading-text">Loading bookings...</p>
      ) : bookings.length === 0 ? (
        // If no bookings are found
        <p className="no-bookings-text">No bookings found.</p>
      ) : (
        // Render bookings in a table format
        <table className="resort-table" aria-label="List of booked resort and movie tickets">
          <thead>
            <tr>
              <th scope="col">Service Name</th>
              <th scope="col">Type</th>
              <th scope="col">Date</th>
              <th scope="col">Start Time</th>
              <th scope="col">End Time</th>
              <th scope="col">Quantity</th>
              <th scope="col">Booked At</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map(({ id, hallName, type, date, startTime, endTime, quantity, bookedAt }) => (
              <tr key={id}>
                <td>{hallName}</td>
                <td>{type || 'N/A'}</td>
                <td>{date}</td>
                <td>{startTime}</td>
                <td>{endTime}</td>
                <td>{quantity}</td>
                {/* Use defensive check on bookedAt in case it's undefined */}
                <td>{bookedAt ? new Date(bookedAt).toLocaleString() : 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
};

export default ViewBookedResortAndMovieTickets;
