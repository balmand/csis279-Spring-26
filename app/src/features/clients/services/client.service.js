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