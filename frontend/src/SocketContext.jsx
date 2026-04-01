import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children, user }) => {
  const [socket, setSocket] = useState(null);
  const userId = user?.id;
  const userRole = user?.role;

  useEffect(() => {
    if (user) {
      const newSocket = io("http://localhost:5001", {
        query: {
          role: userRole,
          userId,
        },
      });

      newSocket.on("connect", () => {
        console.log("✅ Connected to Socket.io");
      });

      // Welcome message for Voyagers
      newSocket.on("welcome_msg", (data) => {
        toast.info(
          <div>
            <strong>{data.message}</strong>
            <p style={{ margin: 0, fontSize: '0.85rem' }}>{data.details}</p>
          </div>,
          { position: "top-right", autoClose: 5000 }
        );
      });

      // Status update for Voyagers (Approved/Rejected)
      newSocket.on("booking_requested", (data) => {
        toast.info(
          <div>
            <strong>🗓️ Reservation Requested</strong>
            <p style={{ margin: 0, fontSize: '0.85rem' }}>{data.message}</p>
          </div>,
          { position: "top-right", autoClose: 5000 }
        );
        window.dispatchEvent(new CustomEvent('REFRESH_USER_BOOKINGS'));
      });

      newSocket.on("booking_status_update", (data) => {
        toast.success(
          <div>
            <strong>📑 Booking Update</strong>
            <p style={{ margin: 0, fontSize: '0.85rem' }}>{data.message}</p>
          </div>,
          { position: "top-right", autoClose: 6000 }
        );
        window.dispatchEvent(new CustomEvent('REFRESH_USER_BOOKINGS'));
      });

      // Presence update for Managers
      newSocket.on("online_count_update", (data) => {
        window.dispatchEvent(new CustomEvent('ONLINE_COUNT_CHANGE', { detail: data.count }));
      });

      // New booking alert for Managers
      newSocket.on("new_booking", (data) => {
        if (userRole === 'manager' || userRole === 'admin') {
          toast.success(
            <div>
              <strong>🔔 New Booking!</strong>
              <p style={{ margin: 0, fontSize: '0.85rem' }}>{data.message}</p>
            </div>,
            { position: "top-right", autoClose: false, closeOnClick: true }
          );
          window.dispatchEvent(new CustomEvent('REFRESH_BOOKINGS'));
        }
      });

      // Chat messages
      newSocket.on("chat_message", (data) => {
        // We'll handle this in a custom event so the Chat component can pick it up
        window.dispatchEvent(new CustomEvent('NEW_CHAT_MESSAGE', { detail: data }));
        
        // Show a small toast if the chat is closed
        if (data.senderId !== userId) {
           toast.info(`New message from ${data.senderName}`, { position: "bottom-right", autoClose: 3000 });
        }
      });

      setSocket(newSocket);
      return () => {
        newSocket.close();
        setSocket(null);
      };
    }

    setSocket(null);
    return undefined;
  }, [user, userId, userRole]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
      <ToastContainer />
    </SocketContext.Provider>
  );
};
