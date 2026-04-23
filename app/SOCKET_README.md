# Redux + WebSocket Client Sync

## Overview

This project now uses **Redux** and **Socket.IO** together so that client changes made in one browser session are automatically reflected in other open sessions.

The implementation is focused on the **clients** feature:

- creating a client updates the Redux store immediately
- updating a client updates the Redux store immediately
- the API broadcasts the change through Socket.IO
- other connected sessions receive the event and merge it into their Redux state

This gives us real-time synchronization without requiring a manual page refresh.

## What was added

### Backend

- `socket.io` dependency in the API
- a shared Socket.IO server in `api/src/socket.js`
- Socket.IO initialization in `api/src/server.js`
- event broadcasting from `api/src/controllers/ClientController.js`

### Frontend

- `socket.io-client` dependency in the app
- a shared socket client in `app/src/services/socket.js`
- a listener component in `app/src/app/ClientRealtimeSync.jsx`
- Redux realtime reducers in `app/src/store/slices/clientsSlice.js`
- a small connection status message in `app/src/features/clients/pages/ClientList.jsx`

## File-by-file explanation

### `api/src/socket.js`

This file creates and stores the Socket.IO server instance.

Responsibilities:

- initialize Socket.IO with the HTTP server
- configure CORS for the frontend origin
- listen for connect and disconnect events
- expose `emitClientChanged(type, client)` so the rest of the API can broadcast updates

Broadcast payload shape:

```js
{
  type: "created" | "updated",
  client: {
    client_id,
    client_name,
    client_email,
    client_dob,
    role
  }
}
```

### `api/src/server.js`

This file was updated so the Express app runs inside an HTTP server:

```js
const server = http.createServer(app);
initializeSocket(server);
server.listen(PORT);
```

That is required because Socket.IO attaches to the HTTP server, not directly to the Express app.

### `api/src/controllers/ClientController.js`

When a client is created or updated, the controller now emits a realtime event:

```js
emitClientChanged('created', client);
emitClientChanged('updated', client);
```

This is the point where the API tells all connected browser sessions that shared data changed.

## Frontend realtime flow

### `app/src/services/socket.js`

This file creates a **single reusable socket client**.

Why this matters:

- avoids multiple socket connections
- keeps socket setup in one place
- allows the app to reuse the same connection logic everywhere

The socket URL comes from:

1. `VITE_SOCKET_URL`
2. `VITE_API_URL`
3. fallback: `http://localhost:3001`

### `app/src/app/ClientRealtimeSync.jsx`

This component is mounted once inside `App.jsx`.

Responsibilities:

- connect only when a user is signed in
- listen for socket `connect`
- listen for socket `disconnect`
- listen for `client:changed`
- dispatch Redux actions when events arrive

Important event handling:

```js
socket.on('client:changed', ({ client: changedClient }) => {
  dispatch(clientSynced(changedClient));
});
```

### `app/src/store/slices/clientsSlice.js`

This slice still handles normal HTTP CRUD with async thunks, but it now also handles realtime updates.

Added state:

- `socketConnected`
- `isOffline`
- `pendingChanges`
- `syncingPending`

Added reducers:

- `socketConnected`
- `socketDisconnected`
- `browserOnline`
- `browserOffline`
- `clientSynced`

The `clientSynced` reducer uses an `upsertClient` helper:

- if the client already exists in `items`, it replaces it
- if the client does not exist, it adds it
- then it sorts the list by `client_id`

That means both local saves and remote socket updates use the same merge behavior.

The slice now also supports offline editing:

- when the browser is offline, `saveClient` queues the change instead of sending HTTP immediately
- new offline clients receive a temporary negative `client_id`
- edits to offline-created clients keep updating the same queued create request
- when the connection returns, `syncPendingChanges` replays the queue in order
- once a queued create succeeds, the temporary client is replaced with the real server record

### `app/src/features/clients/pages/ClientList.jsx`

This page now reads `socketConnected` from Redux and shows a small status alert:

- connected: live sync is active
- disconnected: user is told that realtime updates may not appear yet
- offline: user sees how many changes are waiting to sync
- reconnecting: user can trigger a manual sync while pending changes exist

This gives visible feedback that the socket connection is working.

### `app/src/app/ClientRealtimeSync.jsx`

This component now listens to both socket events and browser connectivity events:

- browser `online` marks Redux as online and reconnects the socket
- browser `offline` marks Redux as offline and disables live sync status
- socket reconnect triggers queued change replay
- incoming `client:changed` events still merge into Redux immediately

## End-to-end event flow

Here is the full path when a user edits or adds a client:

1. User submits the form in one browser session.
2. `saveClient` Redux thunk sends the HTTP request.
3. The API saves the record.
4. `ClientController` emits `client:changed`.
5. All connected sessions receive the event.
6. `ClientRealtimeSync` dispatches `clientSynced`.
7. `clientsSlice` merges the updated client into Redux state.
8. `ClientList` re-renders automatically.

## Why Redux and WebSocket are used together

### Redux handles state

Redux is the single source of truth for:

- client list data
- current client data
- loading and saving flags
- socket connection status

### WebSocket handles delivery

Socket.IO is responsible for:

- keeping a persistent connection open
- pushing updates from the server to all connected sessions
- notifying the frontend immediately when shared data changes

### Together

- HTTP is still used for create and update requests
- Redux stores the result
- Socket.IO propagates the same change to other sessions
- Redux merges incoming socket events into the UI

## Environment variables

### API

Optional:

- `CLIENT_URL`

Default:

```bash
http://localhost:5173
```

This must match the frontend origin for socket CORS.

### App

Optional:

- `VITE_SOCKET_URL`
- `VITE_API_URL`

Defaults:

- socket URL falls back to `VITE_API_URL`
- if that is missing, it uses `http://localhost:3001`

## How to run locally

### Start the API

From `api/`:

```bash
npm install
npm run dev
```

### Start the frontend

From `app/`:

```bash
npm install
npm run dev
```

### Test realtime sync

1. Open the app in two browser windows or two different browsers.
2. Sign in to both sessions.
3. Go to the clients page.
4. Create a new client in session A.
5. Confirm the new client appears automatically in session B.
6. Edit a client in session A.
7. Confirm the updated values appear automatically in session B.

## Current scope

The current realtime implementation supports:

- client creation sync
- client update sync
- socket connection status in Redux

Not yet included:

- client delete sync
- socket authentication
- room-based filtering
- cross-server scaling

## Common pitfalls

- Starting only the frontend without the API socket server
- Using a frontend origin that does not match `CLIENT_URL`
- Creating multiple socket connections instead of reusing one shared instance
- Forgetting to remove listeners on cleanup

## Summary

This implementation combines **Redux Toolkit** and **Socket.IO** so that the clients feature works in real time across sessions.

In short:

- Redux stores the client data
- the API broadcasts create and update events
- the frontend listens once
- incoming socket events are merged back into Redux
- all open sessions stay in sync automatically
