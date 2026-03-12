import { api } from "../../../services/api";

export const getEmployees = () => {
    return api("/employees");
}

export const getEmployee = (id) => {
    return api(`/employees/${id}`);
}

export const saveEmployee = (data, id) => {
    return api(id ? `/employees/${id}` : `/employees`, {
        method: id ? "PUT" : "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(data),
    });
}

export const deleteEmployee = (id) => {
    return api(`/employees/${id}`, {
        method: "DELETE",
    });
}
