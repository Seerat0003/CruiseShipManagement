import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Get user info from localStorage
    const savedUser = localStorage.getItem("user");
    const user = savedUser ? JSON.parse(savedUser) : null;

    if (user) {
      const newSocket = io("http://localhost:5001", {
        query: {
          role: user.role,
          userId: user.id
        }
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
        if (user.role === 'manager' || user.role === 'admin') {
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
        if (data.senderId !== user.id) {
           toast.info(`New message from ${data.senderName}`, { position: "bottom-right", autoClose: 3000 });
        }
      });

      setSocket(newSocket);


      return () => newSocket.close();
    }
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
      <ToastContainer />
    </SocketContext.Provider>
  );
};
