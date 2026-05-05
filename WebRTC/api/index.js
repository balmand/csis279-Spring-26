// Import required modules
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http'); // Import the HTTP module
const socketIO = require('socket.io');
const videoCallSocketHandler = require('./sockets/videoCallSocketHandler');

// Create an Express app
const app = express();
const server = http.createServer(app); // Create an HTTP server

const io = socketIO(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Enable CORS for all origins
app.use(cors());

// Parse JSON request bodies
app.use(bodyParser.json());

// Parse URL-encoded request bodies
app.use(bodyParser.urlencoded({ extended: true }));

// Define a sample route
app.get('/', (req, res) => {
  res.send('Hello, this is your Express server with CORS allowing all traffic!');
});

videoCallSocketHandler(io);

// Start the server
const port = process.env.PORT || 3001;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
