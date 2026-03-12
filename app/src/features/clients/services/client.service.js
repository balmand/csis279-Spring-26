<<<<<<< HEAD
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
=======
const BASE = "http://localhost:3001/clients";

export const getClients = async () => {
  const res = await fetch(BASE);
  return res.json();
};

export const getClient = async (id) => {
  const res = await fetch(`${BASE}/${id}`);
  return res.json();
};

export const saveClient = async (data, id) => {
  const res = await fetch(id ? `${BASE}/${id}` : BASE, {
    method: id ? "PUT" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return res.json();
};

export const deleteUser = async (id) => {
  return fetch(`${BASE}/${id}`, { method: "DELETE" });
};

export const sendClientEmail = async (data) => {
  const res = await fetch("http://localhost:3001/email/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Failed to send email");
  }

  return res.json();
};
>>>>>>> 2de70756a4190810e6f1d7cd19b5314d1b36f206
