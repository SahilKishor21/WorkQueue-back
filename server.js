const express = require('express');
const http = require('http');
const { Server } = require('socket.io'); 
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const headRoutes = require('./routes/headRoutes');
require('dotenv').config();

const app = express();

// Create an HTTP server instance to bind with Socket.IO
const server = http.createServer(app);
app.use('/uploads', express.static('uploads'));


const io = new Server(server, {
    cors: {
        origin: '*', 
        methods: ['GET', 'POST'],
    },
});

// Database
connectDB();

// Middleware
app.use(express.json());

// Socket.IO Connection Logic
io.on('connection', (socket) => {
    console.log(`New client connected: ${socket.id}`);

    // Handle custom events or messages if needed
    socket.on('message', (data) => {
        console.log(`Message received: ${data}`);
    });

    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
    });
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/admins', adminRoutes);
app.use('/api/head', headRoutes);



app.set('io', io); // with this we can use app.get('io') to access it in other files

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server started on port ${PORT}`));
