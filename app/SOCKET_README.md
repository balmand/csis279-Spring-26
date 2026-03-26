# Socket.IO in a Node.js + React Application

## Overview

Socket.IO enables **real-time, bidirectional communication** between a client (React) and a server (Node.js). Unlike HTTP (request/response), Socket.IO keeps a persistent connection open using **WebSockets (with fallbacks)**.

### Typical use cases

- Chat apps
- Live notifications
- Multiplayer games
- Live dashboards

## How it works (high level)

1. The client connects to the server via Socket.IO.
2. A persistent connection is established.
3. Both client and server can:
   - Emit events (`socket.emit`)
   - Listen for events (`socket.on`)
4. Data flows instantly in both directions.

## Project structure

```text
project/
├── server/
│   └── index.js
└── client/
    └── src/
        └── App.js
```

## Server setup (Node.js)

### 1. Install dependencies

```bash
npm install express socket.io cors
```

### 2. Basic server code

```js
// server/index.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// Listen for connections
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Listen for event from client
  socket.on("send_message", (data) => {
    console.log("Message received:", data);

    // Broadcast to all clients
    io.emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(3001, () => {
  console.log("Server running on port 3001");
});
```

## Client setup (React)

### 1. Install Socket.IO client

```bash
npm install socket.io-client
```

### 2. Basic React integration

```js
// client/src/App.js
import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3001");

function App() {
  const [message, setMessage] = useState("");
  const [messageList, setMessageList] = useState([]);

  const sendMessage = () => {
    if (message !== "") {
      socket.emit("send_message", message);
    }
  };

  useEffect(() => {
    socket.on("receive_message", (data) => {
      setMessageList((list) => [...list, data]);
    });

    // Cleanup
    return () => socket.off("receive_message");
  }, []);

  return (
    <div>
      <input placeholder="Message..." onChange={(e) => setMessage(e.target.value)} />
      <button onClick={sendMessage}>Send</button>

      <div>
        {messageList.map((msg, index) => (
          <p key={index}>{msg}</p>
        ))}
      </div>
    </div>
  );
}

export default App;
```

## Event flow example

1. User types a message in React
2. React emits:

```js
socket.emit("send_message", message);
```

3. Server receives:

```js
socket.on("send_message", ...);
```

4. Server broadcasts:

```js
io.emit("receive_message", data);
```

5. All clients receive:

```js
socket.on("receive_message", ...);
```

## Key concepts

### 1. `io` vs `socket`

- `io`: the Socket.IO server instance (all connections)
- `socket`: a single client connection

### 2. Emitting events

```js
socket.emit("event_name", data);
```

### 3. Listening for events

```js
socket.on("event_name", callback);
```

### 4. Broadcasting

- To all clients:

```js
io.emit(...);
```

- To all except sender:

```js
socket.broadcast.emit(...);
```

- To a specific room:

```js
io.to("room").emit(...);
```

### 5. Rooms (optional advanced)

```js
socket.join("room1");
io.to("room1").emit("message", data);
```

Useful for:

- Private chats
- Game lobbies

## Common pitfalls

- Multiple socket connections (create the socket in a single place)
- Forgetting cleanup (`socket.off`)
- CORS issues (server `origin` must match frontend URL)
- Emitting before connection is ready

## Production tips

- Use environment variables for server URL
- Add authentication (JWT + middleware)
- Handle reconnections
- Scale with Redis adapter for multiple servers

## Summary

Socket.IO turns your app into a real-time system by:

- Maintaining a persistent connection
- Using event-based communication
- Allowing instant updates between client and server

