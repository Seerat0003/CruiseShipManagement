import React, { useEffect, useState } from 'react';
import './ViewBookedBeautySalon.css';

const ViewBookedBeautySalon = () => {
  // State to hold the list of appointments
  const [appointments, setAppointments] = useState([]);
  // State to track loading status for user feedback
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5001/api/manager/bookings?category=Beauty", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setAppointments(data);
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
      console.log("🔄 Auto-refreshing Beauty Salon list...");
      fetchBookings();
    };

    window.addEventListener('REFRESH_BOOKINGS', handleRefresh);
    return () => window.removeEventListener('REFRESH_BOOKINGS', handleRefresh);
  }, []);

  return (
    <div className="view-salon-container">
      <h1>Booked Beauty Salon Appointments</h1>

      {loading ? (
        // Display loading indicator while fetching data
        <p>Loading appointments...</p>
      ) : appointments.length === 0 ? (
        // Show message if no appointments found
        <p>No bookings found.</p>
      ) : (
        // Render table of appointments when data is available
        <table className="salon-table">
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
            {appointments.map(({ id, hallName, date, startTime, endTime, quantity, bookedAt }) => (
              <tr key={id}>
                <td>{hallName}</td>
                <td>{date}</td>
                <td>{startTime}</td>
                <td>{endTime}</td>
                <td>{quantity}</td>
                {/* Format the bookedAt timestamp nicely */}
                <td>{bookedAt ? new Date(bookedAt).toLocaleString() : 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ViewBookedBeautySalon;
