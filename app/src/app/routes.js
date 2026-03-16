import ClientList from "../features/clients/pages/ClientList";
import ClientForm from "../features/clients/pages/ClientForm";
import About from "../pages/About";
import Home from "../pages/Home";
import DepartmentList from "../features/departments/pages/DepartmentList";
import DepartmentForm from "../features/departments/pages/DepartmentForm";
import ItemForm from "../features/items/pages/ItemForm";
import ItemList from "../features/items/pages/ItemList";
import EmployeeList from "../features/employees/pages/EmployeeList";
import EmployeeForm from "../features/employees/pages/EmployeeForm";
import Login from "../features/auth/pages/Login";
import Register from "../features/auth/pages/Register";
import OrdersList from "../features/orders/pages/OrdersList";
import ItemsInOrder from "../features/orders/pages/ItemsInOrder";
import ClientListOrders from "../features/orders/pages/ClientListOrders";
import SalesStatisticsPage from "../features/statistics/pages/SalesStatisticsPage";

export const routes = [
    {path: "/", element: Home},
    {path: "/about", element: About},
    {path: "/clients", element: ClientList},
    {path: "/clients/new", element: ClientForm},
    {path: "/clients/:id/edit", element: ClientForm},
    {path: "/departments", element: DepartmentList},
    {path: "/departments/new", element: DepartmentForm},
    {path: "/departments/:id/edit", element: DepartmentForm},
    {path:"/items", element: ItemList},
    {path:"/items/new", element: ItemForm},
    {path:"/items/:id/edit", element: ItemForm},
    {path: "/employees", element: EmployeeList},
    {path: "/employees/new", element: EmployeeForm},
    {path: "/employees/:id/edit", element: EmployeeForm},
    {path: "/orders", element: ClientListOrders},
    {path: "/orders/:id", element: OrdersList},
    {path: "/orders/:id/items", element: ItemsInOrder},
    {path: "/admin/statistics", element: SalesStatisticsPage},
    {path: "/login", element: Login},
    {path: "/register", element: Register},
];
