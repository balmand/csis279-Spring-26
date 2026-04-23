# GraphQL Integration: React App -> Nest API

This document explains how GraphQL is integrated in this project from the React front-end in `app/` to the Nest API in `api-nest/`.

## Overview

The request flow is:

1. A React page or Redux thunk calls a feature service in `app/src/features/**/services`.
2. That service sends a GraphQL query or mutation through `requestGraphql()` in `app/src/services/api.js`.
3. The request goes to the Nest GraphQL endpoint at:

```txt
http://localhost:3000/graphql
```

4. Nest resolves the operation in `api-nest/src/gateway/gateway.resolver.ts`.
5. The resolver delegates to `api-nest/src/gateway/app-data.service.ts`.
6. `AppDataService` runs SQL through `api-nest/src/database/database.service.ts`.
7. The GraphQL response comes back to the React service, then to the page or Redux slice.

## Front-End Side

### 1. Shared GraphQL request helper

File: [app/src/services/api.js](/Users/cbf/dev/edu/csis279-Spring-26/app/src/services/api.js:1)

This file is the shared GraphQL transport layer for the app.

It:

- Builds `GRAPHQL_URL` from `VITE_API_URL` or `VITE_GRAPHQL_URL`
- Sends a `POST` request to `/graphql`
- Passes `query` and `variables` in the request body
- Extracts `payload.data[dataPath]` for convenience
- Normalizes GraphQL errors into `{ message, code }`

Example shape:

```js
requestGraphql(document, {
  variables: { id: 1 },
  dataPath: "client",
});
```

### 2. Feature service modules

Each feature keeps its GraphQL operations in a local service file.

Examples:

- [app/src/features/clients/services/client.service.js](/Users/cbf/dev/edu/csis279-Spring-26/app/src/features/clients/services/client.service.js:1)
- [app/src/features/auth/services/auth.service.js](/Users/cbf/dev/edu/csis279-Spring-26/app/src/features/auth/services/auth.service.js:1)
- [app/src/features/departments/services/departments.service.js](/Users/cbf/dev/edu/csis279-Spring-26/app/src/features/departments/services/departments.service.js:1)
- [app/src/features/employees/services/employees.service.js](/Users/cbf/dev/edu/csis279-Spring-26/app/src/features/employees/services/employees.service.js:1)
- [app/src/features/items/services/items.service.js](/Users/cbf/dev/edu/csis279-Spring-26/app/src/features/items/services/items.service.js:1)
- [app/src/features/orders/services/orders.service.js](/Users/cbf/dev/edu/csis279-Spring-26/app/src/features/orders/services/orders.service.js:1)
- [app/src/features/statistics/services/statistics.service.js](/Users/cbf/dev/edu/csis279-Spring-26/app/src/features/statistics/services/statistics.service.js:1)

These service files:

- Define GraphQL query strings or mutation strings
- Pass variables to `requestGraphql`
- Return the extracted payload back to the UI

Example from the client feature:

```js
export const getClients = () => {
  return requestGraphql(
    `query GetClients {
      clients {
        client_id
        client_name
        client_email
        client_dob
        role
      }
    }`,
    { dataPath: "clients" }
  );
};
```

### 3. UI and Redux usage

The React pages and Redux slices do not talk to GraphQL directly.

Instead they call service functions such as:

- `getClients()`
- `saveClient()`
- `login()`
- `getSalesDashboard()`

That keeps GraphQL details out of page components.

Examples:

- [app/src/store/slices/clientsSlice.js](/Users/cbf/dev/edu/csis279-Spring-26/app/src/store/slices/clientsSlice.js:1)
- [app/src/store/slices/departementSlice.js](/Users/cbf/dev/edu/csis279-Spring-26/app/src/store/slices/departementSlice.js:1)

## Nest API Side

### 1. GraphQL module setup

File: [api-nest/src/app.module.ts](/Users/cbf/dev/edu/csis279-Spring-26/api-nest/src/app.module.ts:1)

Nest enables GraphQL with `GraphQLModule.forRoot(...)`.

Important details:

- Apollo driver is used
- Schema is generated automatically
- GraphQL is exposed at `/graphql`

### 2. GraphQL schema types

File: [api-nest/src/gateway/graphql.types.ts](/Users/cbf/dev/edu/csis279-Spring-26/api-nest/src/gateway/graphql.types.ts:1)

This file defines the GraphQL object types and input types used by the API.

Examples:

- `Client`
- `Department`
- `Employee`
- `Item`
- `Order`
- `OrderItem`
- `ClientInput`
- `LoginInput`
- `RegisterInput`
- `SalesDashboardFiltersInput`

These classes define the contract between the React app and the Nest API.

### 3. Resolver layer

File: [api-nest/src/gateway/gateway.resolver.ts](/Users/cbf/dev/edu/csis279-Spring-26/api-nest/src/gateway/gateway.resolver.ts:1)

This file maps GraphQL operations to application logic.

Examples:

- `clients()` -> returns all clients
- `client(id)` -> returns one client
- `saveClient(input, id)` -> creates or updates a client
- `deleteClient(id)` -> deletes a client
- `login(input)` -> authenticates a user
- `salesDashboard(clientId, filters)` -> returns admin dashboard data

The resolver should stay thin. Most real work is delegated to `AppDataService`.

### 4. Data and business logic layer

File: [api-nest/src/gateway/app-data.service.ts](/Users/cbf/dev/edu/csis279-Spring-26/api-nest/src/gateway/app-data.service.ts:1)

This file contains the real application logic that used to live in the legacy API:

- SQL queries for CRUD operations
- Login and registration logic
- Password hashing with `bcryptjs`
- Email sending with `nodemailer`
- Sales statistics aggregation
- Validation and error handling

This is what makes `api-nest` standalone now.

### 5. Database access

File: [api-nest/src/database/database.service.ts](/Users/cbf/dev/edu/csis279-Spring-26/api-nest/src/database/database.service.ts:1)

This service creates the Postgres connection pool using values from:

- [api-nest/.env](/Users/cbf/dev/edu/csis279-Spring-26/api-nest/.env:1)

The GraphQL API no longer depends on the old `api/` server being running.

## Environment Configuration

### Front-end env

File: [app/.env.exmaple](/Users/cbf/dev/edu/csis279-Spring-26/app/.env.exmaple:1)

Current front-end setup:

```env
VITE_API_URL=http://localhost:3000
```

This tells the React app to send GraphQL requests to `api-nest`.

### Nest env

Files:

- [api-nest/.env.example](/Users/cbf/dev/edu/csis279-Spring-26/api-nest/.env.example:1)
- [api-nest/.env](/Users/cbf/dev/edu/csis279-Spring-26/api-nest/.env:1)

These hold:

- `PORT`
- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`

## Special Case: Sales Dashboard

File: [app/src/features/statistics/services/statistics.service.js](/Users/cbf/dev/edu/csis279-Spring-26/app/src/features/statistics/services/statistics.service.js:1)

The `salesDashboard` GraphQL field currently returns a JSON string from Nest, and the front-end parses it back into an object.

Why:

- The dashboard payload is large and dynamic
- This avoided extra GraphQL output-type complexity during the migration

Flow:

1. Front-end requests `salesDashboard(clientId, filters)`
2. Resolver builds the dashboard object in `AppDataService`
3. Resolver returns `JSON.stringify(dashboard)`
4. Front-end parses it with `JSON.parse(response.data)`

This works, but later it could be improved by defining a fully typed GraphQL dashboard object.

## Example End-to-End: Client List

### Front-end request

File: [app/src/features/clients/services/client.service.js](/Users/cbf/dev/edu/csis279-Spring-26/app/src/features/clients/services/client.service.js:1)

`getClients()` sends:

```graphql
query GetClients {
  clients {
    client_id
    client_name
    client_email
    client_dob
    role
  }
}
```

### Resolver

File: [api-nest/src/gateway/gateway.resolver.ts](/Users/cbf/dev/edu/csis279-Spring-26/api-nest/src/gateway/gateway.resolver.ts:1)

This maps to:

```ts
@Query(() => [Client])
clients() {
  return this.data.getClients();
}
```

### Data access

File: [api-nest/src/gateway/app-data.service.ts](/Users/cbf/dev/edu/csis279-Spring-26/api-nest/src/gateway/app-data.service.ts:1)

This runs SQL:

```sql
SELECT client_id, client_name, client_email, client_dob, role
FROM clients
ORDER BY client_id ASC
```

### Response back to UI

The client list page and Redux slice receive a plain array of clients and render it normally.

## Summary

The integration is organized in four layers:

1. React pages and Redux slices call feature service functions
2. Feature service functions send GraphQL operations through `requestGraphql()`
3. Nest resolvers translate GraphQL operations into service calls
4. `AppDataService` runs SQL and returns the data

This gives the app:

- A single API endpoint: `/graphql`
- Front-end feature-level separation
- Standalone Nest backend behavior
- No runtime dependency on the old legacy API server
