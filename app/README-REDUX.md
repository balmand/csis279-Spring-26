# Redux in This Project: Why and How

This document explains **why** Redux was introduced and **how** it is implemented step by step in the CSIS279 React app.

---

## Table of Contents

1. [Why Redux?](#why-redux)
2. [Why Redux Toolkit?](#why-redux-toolkit)
3. [Implementation Overview](#implementation-overview)
4. [Step-by-Step Implementation](#step-by-step-implementation)
5. [Data Flow](#data-flow)
6. [File Structure](#file-structure)
7. [Where Redux Is Used](#where-redux-is-used)
8. [Extending Redux](#extending-redux)

---

## Why Redux?

### What problem does it solve?

React components manage their own state with `useState`. When **multiple components** need to share the same data (e.g., “who is logged in”), you have two options:

- **Prop drilling:** Pass the data down through many layers of components. This becomes hard to maintain as the app grows.
- **Global state:** Keep the shared data in one place and let any component read or update it. Redux is a popular way to do this.

### Why use Redux in this project?

1. **Auth is global.** The logged-in user (`client`) is needed in:
   - **App.jsx** — to decide which routes to show (logged-in vs login/register).
   - **Layout.jsx** — to show or hide the navigation bar.
   - **NavBar.jsx** — to show the user’s name and a logout button, and to show “Sales Stats” only for admins.
   - **Login.jsx / Register.jsx** — to call `signIn` after a successful login or registration.
   - **SalesStatisticsPage.jsx** — to pass `client_id` when fetching statistics.

   Without a global store, we would have to pass `client` and `signIn`/`signOut` through many components or duplicate logic.

2. **Predictable updates.** Redux uses a single store and clear rules: the only way to change state is to dispatch an action. That makes it easier to reason about when and why auth state changes (e.g., “user logged in” or “user logged out”).

3. **Easier to extend.** If we later add more global state (e.g., notifications, theme, cached lists), we can add new “slices” to the same store and keep one consistent pattern.

4. **Tooling and debugging.** Redux DevTools let you inspect every action and state change, which helps when debugging auth or other global state.

### When might you *not* use Redux?

- **Small, local state:** Buttons, form inputs, modals that don’t need to be shared → `useState` is enough.
- **Server state only:** If you only need to fetch and display API data per screen, libraries like React Query can be simpler than putting that in Redux.

In this project, auth is clearly shared across the app, so Redux (via Redux Toolkit) is a good fit.

---

## Why Redux Toolkit?

**Redux Toolkit** is the official recommended way to use Redux. It was chosen for this project because it:

- Reduces boilerplate (e.g., action types and action creators are generated from a slice).
- Uses Immer under the hood so we can write “mutating” logic in reducers (e.g., `state.client = action.payload`) while staying immutable.
- Includes sensible defaults (e.g., Redux Thunk for async logic if we need it later).
- Simplifies store setup with `configureStore`.

So in this project, “Redux” means **Redux + Redux Toolkit + react-redux**.

---

## Implementation Overview

At a high level:

1. A **store** holds the global state (e.g., `auth.client`).
2. An **auth slice** defines that state and the reducers that change it (`signIn`, `signOut`).
3. The app is wrapped in a **Provider** so every component can access the store.
4. A custom **useAuth** hook lets components read `client` and call `signIn`/`signOut` without touching Redux APIs directly.
5. **Persistence:** A store subscription writes `auth.client` to `localStorage` when it changes and the slice initializes from `localStorage` on load.

The following sections walk through each of these steps in order.

---

## Step-by-Step Implementation

### Step 1: Install dependencies

Redux is used only in the frontend (`app`), so dependencies were added there:

```bash
cd app
npm install @reduxjs/toolkit react-redux
```

- **@reduxjs/toolkit:** Store setup, `createSlice`, and Redux best practices.
- **react-redux:** `Provider` and hooks (`useSelector`, `useDispatch`) to connect React to the store.

---

### Step 2: Create the auth slice

**File:** `app/src/store/slices/authSlice.js`

A **slice** is a piece of state plus the reducers and actions that update it.

1. **Initial state**  
   We want the app to “remember” the user across page refreshes. So on load we read from `localStorage`:

   ```js
   const loadClientFromStorage = () => {
     try {
       const stored = localStorage.getItem('client');
       return stored ? JSON.parse(stored) : null;
     } catch {
       return null;
     }
   };

   const initialState = {
     client: loadClientFromStorage(),
   };
   ```

   If there is no saved client or parsing fails, `client` is `null` (user is logged out).

2. **Slice definition**  
   We use `createSlice` and give it a name, initial state, and reducers:

   ```js
   const authSlice = createSlice({
     name: 'auth',
     initialState,
     reducers: {
       signIn: (state, action) => {
         state.client = action.payload;  // payload = client object from API
       },
       signOut: (state) => {
         state.client = null;
       },
     },
   });
   ```

   - `signIn`: sets the logged-in user (the payload is the `client` object returned by the auth API).
   - `signOut`: clears the user.

3. **Exports**  
   The slice file exports the generated actions and the reducer:

   ```js
   export const { signIn, signOut } = authSlice.actions;
   export default authSlice.reducer;
   ```

   Components will dispatch `signIn(clientData)` or `signOut()`; they do not need to know about action types or the reducer logic.

---

### Step 3: Create the store

**File:** `app/src/store/index.js`

The **store** is the single source of truth. It is created with `configureStore` and the auth reducer:

```js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});
```

So the state shape is:

```js
{
  auth: {
    client: null | { client_id, client_name, client_email, role, ... }
  }
}
```

**Persistence:** We want every change to `auth.client` to be reflected in `localStorage`. So we subscribe to the store and sync:

```js
store.subscribe(() => {
  const client = store.getState().auth.client;
  try {
    if (client) {
      localStorage.setItem('client', JSON.stringify(client));
    } else {
      localStorage.removeItem('client');
    }
  } catch {
    // ignore storage errors
  }
});
```

- On **signIn**, state updates → subscription runs → client is saved to `localStorage`.
- On **signOut**, state updates → subscription runs → `localStorage` entry is removed.
- On **page load**, the auth slice’s initial state is built from `loadClientFromStorage()`, so the user stays “logged in” until they log out or clear storage.

---

### Step 4: Provide the store to the app

**File:** `app/src/main.jsx`

React components can only use the store if they are rendered inside the **Provider**:

```js
import { Provider } from 'react-redux';
import { store } from './store';

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </Provider>
);
```

Everything under `<App />` can now use `useSelector` and `useDispatch` (or our custom `useAuth` hook).

---

### Step 5: Create the useAuth hook

**File:** `app/src/store/hooks/useAuth.js`

Components used to get auth from React Context via `useAuth()`. To keep the same API and avoid changing every call site, we implemented **useAuth** on top of Redux:

```js
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { signIn as signInAction, signOut as signOutAction } from '../slices/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const client = useSelector((state) => state.auth.client);

  const signIn = useCallback(
    (clientData) => {
      dispatch(signInAction(clientData));
    },
    [dispatch]
  );

  const signOut = useCallback(() => {
    dispatch(signOutAction());
  }, [dispatch]);

  return { client, signIn, signOut };
};
```

- **useSelector:** Reads `state.auth.client` from the store. When it changes, the component re-renders.
- **useDispatch:** Returns the store’s `dispatch` so we can send `signIn` and `signOut` actions.
- **useCallback:** Keeps stable function references for `signIn` and `signOut` so children that depend on them don’t re-render unnecessarily.

So from a component’s perspective, nothing changes: it still calls `const { client, signIn, signOut } = useAuth();` and uses them the same way as before. Only the import path and the implementation (Redux instead of Context) changed.

---

### Step 6: Update components to use the Redux-backed useAuth

No component logic had to change; only the **import** of `useAuth` was updated from the old Context to the new Redux hook:

| File | Change |
|------|--------|
| `app/src/app/App.jsx` | `import { useAuth } from '../store/hooks/useAuth';` |
| `app/src/components/layout/Layout.jsx` | `import { useAuth } from '../../store/hooks/useAuth';` |
| `app/src/components/layout/NavBar.jsx` | `import { useAuth } from '../../store/hooks/useAuth';` |
| `app/src/features/auth/pages/Login.jsx` | `import { useAuth } from '../../../store/hooks/useAuth';` |
| `app/src/features/auth/pages/Register.jsx` | `import { useAuth } from '../../../store/hooks/useAuth';` |
| `app/src/features/statistics/pages/SalesStatisticsPage.jsx` | `import { useAuth } from '../../../store/hooks/useAuth';` |

Usage stays the same, for example:

- **App.jsx:** `const { client } = useAuth();` to decide which routes to show.
- **NavBar.jsx:** `const { client, signOut } = useAuth();` to show name, admin link, and logout.
- **Login.jsx:** `const { signIn } = useAuth();` then `signIn(data.client)` after a successful login.

The old **AuthContext** (`app/src/context/AuthContext.jsx`) is no longer used and can be removed if desired.

---

## Data Flow

A simple way to see how auth flows through the app:

1. **User opens the app**  
   - `authSlice` initial state runs `loadClientFromStorage()` → `client` is set from `localStorage` or `null`.

2. **User logs in (Login.jsx)**  
   - User submits form → `login(form)` calls the API.  
   - On success, component calls `signIn(data.client)`.  
   - `signIn` is the Redux action; dispatching it runs the `signIn` reducer.  
   - Reducer sets `state.auth.client = action.payload`.  
   - Store subscription runs → `localStorage.setItem('client', ...)`.  
   - Any component using `useAuth()` (hence `useSelector(state => state.auth.client)`) re-renders with the new `client`.

3. **User navigates**  
   - App.jsx, Layout, NavBar, and SalesStatisticsPage all read `client` from the same store, so they stay in sync without prop drilling.

4. **User logs out (NavBar.jsx)**  
   - User clicks Logout → `signOut()` is called.  
   - Reducer sets `state.auth.client = null`.  
   - Subscription removes `client` from `localStorage`.  
   - Components re-render; App.jsx shows login/register routes, Layout hides the nav bar, etc.

So: **one store, one auth slice, one useAuth hook** — and the same data and actions everywhere they’re needed.

---

## File Structure

Redux-related code lives under `app/src/store/`:

```
app/src/
├── main.jsx                    # Provider wraps app with store
├── store/
│   ├── index.js                # configureStore, persistence subscription
│   ├── slices/
│   │   └── authSlice.js        # auth state + signIn/signOut reducers
│   └── hooks/
│       └── useAuth.js          # useAuth() using useSelector + useDispatch
├── app/
│   └── App.jsx                 # uses useAuth for routing
├── components/
│   └── layout/
│       ├── Layout.jsx          # uses useAuth to show/hide NavBar
│       └── NavBar.jsx          # uses useAuth for user + signOut
└── features/
    ├── auth/
    │   └── pages/
    │       ├── Login.jsx        # uses useAuth().signIn
    │       └── Register.jsx    # uses useAuth().signIn
    └── statistics/
        └── pages/
            └── SalesStatisticsPage.jsx  # uses useAuth().client
```

---

## Where Redux Is Used

| Component | What it uses | Purpose |
|-----------|----------------|--------|
| **App.jsx** | `client` | Decide which routes to show (auth vs login/register) and redirect for `*`. |
| **Layout.jsx** | `client` | Show NavBar only when the user is logged in. |
| **NavBar.jsx** | `client`, `signOut` | Show nav links, user name, admin “Sales Stats” link, and Logout. |
| **Login.jsx** | `signIn` | After successful login, store the client and redirect. |
| **Register.jsx** | `signIn` | After successful registration, store the client and redirect. |
| **SalesStatisticsPage.jsx** | `client` | Pass `client.client_id` (or similar) when fetching statistics. |

All of this is done through the single `useAuth()` hook backed by Redux.

---

## Extending Redux

To add more global state later (e.g., notifications, theme, or cached data):

1. **Add a new slice** under `app/src/store/slices/`, e.g. `notificationsSlice.js`:
   - Define `initialState`, `name`, and `reducers` with `createSlice`.
   - Export the reducer and any actions.

2. **Register the reducer** in `app/src/store/index.js`:
   ```js
   import notificationsReducer from './slices/notificationsSlice';
   // ...
   reducer: {
     auth: authReducer,
     notifications: notificationsReducer,
   },
   ```

3. **Use in components** via `useSelector` and `useDispatch`, or by creating a custom hook (e.g. `useNotifications()`) that wraps them.

4. **Async logic** (e.g., fetching from the API) can be handled with Redux Toolkit’s `createAsyncThunk` and `extraReducers` in the same slice.

This keeps one store, one place to look for global state, and one pattern for how it’s updated and consumed.

---

## Summary

- **Why Redux:** Auth (and potentially other shared state) is needed in many parts of the app; Redux provides a single, predictable global store and makes it easy to extend.
- **Why Redux Toolkit:** Less boilerplate, clearer reducer code, and official best practices.
- **How it’s implemented:** Auth slice for state and actions → store with persistence → Provider in main.jsx → useAuth hook for components → all auth consumers updated to import useAuth from the store. The app behaves the same as before, with auth now backed by Redux.

For more on Redux and Redux Toolkit, see the official docs: [Redux](https://redux.js.org/) and [Redux Toolkit](https://redux-toolkit.js.org/).
