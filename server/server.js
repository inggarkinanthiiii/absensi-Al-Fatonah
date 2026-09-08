import dotenv from 'dotenv';
import http from 'http';
import app from './app.js';
import connectDB from './config/database.js';
import { initializeSocket } from './config/socket.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Initialize Socket.IO
initializeSocket(server);

// Connect to database
connectDB().then(() => {
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
}).catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
