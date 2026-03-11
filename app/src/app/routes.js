import ClientList from "../features/clients/pages/ClientList";
import ClientForm from "../features/clients/pages/ClientForm";
import About from "../pages/About";
import Home from "../pages/Home";
import DepartmentList from "../features/departments/pages/DepartmentList";
import DepartmentForm from "../features/departments/pages/DepartmentForm";
import EmployeeList from "../features/employees/pages/EmployeeList";
import EmployeeForm from "../features/employees/pages/EmployeeForm";
import Login from "../features/auth/pages/Login";
import Register from "../features/auth/pages/Register";

export const routes = [
    {path: "/", element: Home},
    {path: "/about", element: About},
    {path: "/clients", element: ClientList},
    {path: "/clients/new", element: ClientForm},
    {path: "/clients/:id/edit", element: ClientForm},
    {path: "/departments", element: DepartmentList},
    {path: "/departments/new", element: DepartmentForm},
    {path: "/departments/:id/edit", element: DepartmentForm},
    {path: "/employees", element: EmployeeList},
    {path: "/employees/new", element: EmployeeForm},
    {path: "/employees/:id/edit", element: EmployeeForm},
    {path: "/login", element: Login},
    {path: "/register", element: Register},

];