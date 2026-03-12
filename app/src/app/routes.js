import ClientList from "../features/clients/pages/ClientList";
import ClientForm from "../features/clients/pages/ClientForm";
import About from "../pages/About";
import Home from "../pages/Home";
import DepartmentList from "../features/departments/pages/DepartmentList";
import DepartmentForm from "../features/departments/pages/DepartmentForm";
import ClientListOrders from "../features/orders/pages/ClientListOrders.jsx";
import OrdersList from "../features/orders/pages/OrdersList.jsx";
import Login from "../features/auth/pages/Login";
import Register from "../features/auth/pages/Register";
import ItemsList from "../features/orders/pages/ItemsInOrder.jsx";

export const routes = [
  { path: "/", element: Home },
  { path: "/about", element: About },
  { path: "/clients", element: ClientList },
  { path: "/clients/new", element: ClientForm },
  { path: "/clients/:id/edit", element: ClientForm },
  { path: "/departments", element: DepartmentList },
  { path: "/departments/new", element: DepartmentForm },
  { path: "/departments/:id/edit", element: DepartmentForm },
  { path: "/orders", element: ClientListOrders },
  { path: "/orders/:id", element: OrdersList },
  { path: "/itemsList/:id", element: ItemsList },
  { path: "/login", element: Login },
  { path: "/register", element: Register },
];
