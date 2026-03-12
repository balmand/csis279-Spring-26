import { api } from "../../../services/api";

export const getClients = () => {
    return api("/clients");
}

export const getClient = (id) =>{
    return api(`/clients/${id}`);
}

export const saveClient = (data, id) => {
    return api(id ? `/clients/${id}` : "/clients", {
        method: id ? "PUT" : "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(data)
    });
}

export const deleteUser = (id) =>{
    return api(`/clients/${id}`, { method: "DELETE" });
}
