import React, { useEffect, useState } from 'react';
import './ViewBookedPartyHall.css';

const ViewBookedPartyHalls = () => {
  // State to hold the list of bookings
  const [bookings, setBookings] = useState([]);
  // State to track loading status while fetching data
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5001/api/manager/bookings?category=Party", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setBookings(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();

    // Listen for the custom "REFRESH_BOOKINGS" event from SocketContext
    const handleRefresh = () => {
      console.log("🔄 Auto-refreshing bookings list...");
      fetchBookings();
    };

    window.addEventListener('REFRESH_BOOKINGS', handleRefresh);
    return () => window.removeEventListener('REFRESH_BOOKINGS', handleRefresh);
  }, []);


  return (
    <div className="view-bookings-container">
      <h1>Booked Party Halls</h1>

      {/* Show loading message while fetching */}
      {loading ? (
        <p>Loading bookings...</p>
      ) : 
      // Show message if no bookings are found
      bookings.length === 0 ? (
        <p>No bookings found.</p>
      ) : (
        // Render bookings in a table
        <table className="bookings-table">
          <thead>
            <tr>
              <th>Hall Name</th>
              <th>Date</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Quantity</th>
              <th>Booked At</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map(({ id, hallName, date, startTime, endTime, quantity, bookedAt }) => (
              <tr key={id}>
                <td>{hallName}</td>
                <td>{date}</td>
                <td>{startTime}</td>
                <td>{endTime}</td>
                <td>{quantity}</td>
                {/* Convert bookedAt timestamp to a readable format */}
                <td>{new Date(bookedAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ViewBookedPartyHalls;
