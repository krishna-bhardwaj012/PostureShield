const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');
const http = require('http');
const path = require('path');

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// Import routes
const postureRoutes = require('./routes/postureRoutes');
const { setupWebSocket } = require('./routes/websocketHandler');

// API Routes
app.use('/api', postureRoutes);

// Serve static files - frontend
app.use(express.static(path.join(__dirname, '../frontend/public')));
app.use('/static', express.static(path.join(__dirname, '../frontend/src')));

// Serve the main HTML file for all non-API routes
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(path.join(__dirname, '../frontend/public', 'index.html'));
});

// Setup WebSocket server
setupWebSocket(server);

const PORT = process.env.PORT || 5000;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});