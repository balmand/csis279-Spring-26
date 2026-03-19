import { api } from "../../../services/api";

export const getItems = async () => {
    const res = await api("/items");
    return Array.isArray(res) ? res : [];
};

export const getItem = (id) => {
    return api(`/items/${id}`);
}

export const saveItem = async (data, id) => {
    return await api(id ? `/items/${id}` : `/items`, {
        method: id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
}

export const deleteItem = async (id) => {
    return await api(`/items/${id}`, { method: "DELETE" });
}
export const adjustStock = async (id, quantityChange) => {
    return await api(`/items/stock/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantityChange }),
    });
};
