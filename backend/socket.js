const { Server } = require("socket.io");

// Set to track online user IDs
let onlineUsers = new Set();

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*", 
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", async (socket) => {
    console.log("🔗 User connected:", socket.id);

    const { role, userId } = socket.handshake.query;
    
    if (userId) onlineUsers.add(userId);
    
    // Notify managers of new user presence
    io.to("manager-room").emit("online_count_update", {
      count: onlineUsers.size
    });

    if (role === "manager") {
      socket.join("manager-room");
      console.log(`👨‍💼 Manager joined room: ${socket.id}`);
    } else if (role === "voyager" && userId) {
      socket.join(`user-room-${userId}`);
      console.log(`🚢 Voyager ${userId} joined room: ${socket.id}`);

      // Fetch user data for "Welcome" notification
      try {
        const { User, Booking } = require("./models");
        const user = await User.findByPk(userId);
        if (user) {
          const pendingCount = await Booking.count({ where: { user_id: userId, status: "Pending" } });
          socket.emit("welcome_msg", {
            message: `Welcome back, ${user.name}! 🛳️`,
            details: pendingCount > 0 
              ? `You have ${pendingCount} booking(s) pending approval.` 
              : "All your bookings are up to date."
          });
        }
      } catch (err) {
        console.error("Socket welcome error:", err);
      }
    }

    // --- REAL-TIME CHAT ---
    socket.on("chat_message", (data) => {
      // Data: { senderId, senderName, role, message, receiverId }
      if (data.role === "voyager") {
        // Broadcast to all managers
        io.to("manager-room").emit("chat_message", data);
      } else {
        // Targeted message to a specific voyager
        io.to(`user-room-${data.receiverId}`).emit("chat_message", data);
      }
    });

    socket.on("disconnect", () => {
      console.log("❌ User disconnected:", socket.id);
      if (userId) onlineUsers.delete(userId);
      io.to("manager-room").emit("online_count_update", {
        count: onlineUsers.size
      });
    });
  });


  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

module.exports = { initSocket, getIO };
