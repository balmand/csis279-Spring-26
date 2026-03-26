const path = require('path');
const http = require('http');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const app = require('./app');
const { initializeSocket } = require('./socket');

const PORT = process.env.PORT || process.env.SERVER_PORT || 3001;
const server = http.createServer(app);

initializeSocket(server);

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
