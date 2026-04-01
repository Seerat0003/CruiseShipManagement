import React, { useEffect, useState } from 'react';
import './ViewBookedFitnessCentre.css';

const ViewBookedFitnessCentre = () => {
  // State to hold the list of fitness center bookings
  const [bookings, setBookings] = useState([]);
  // State to track loading status for user feedback
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5001/api/manager/bookings?category=Gym", {
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

    const handleRefresh = () => {
      console.log("🔄 Auto-refreshing Fitness Centre list...");
      fetchBookings();
    };

    window.addEventListener('REFRESH_BOOKINGS', handleRefresh);
    return () => window.removeEventListener('REFRESH_BOOKINGS', handleRefresh);
  }, []);

  return (
    <div className="view-fitness-container">
      <h1>Fitness Center</h1>

      {loading ? (
        // Show loading message while fetching data
        <p>Loading bookings...</p>
      ) : bookings.length === 0 ? (
        // Show message if no bookings are found
        <p>No bookings found.</p>
      ) : (
        // Display bookings in a table if data is available
        <table className="fitness-table">
          <thead>
            <tr>
              <th>Service</th>
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
                {/* Defensive check for bookedAt */}
                <td>{bookedAt ? new Date(bookedAt).toLocaleString() : 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ViewBookedFitnessCentre;
