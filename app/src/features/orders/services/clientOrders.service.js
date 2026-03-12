const BASE = "http://localhost:3001/clients";

export const getClients = async () => {
  const res = await fetch(`${BASE}`);
  const data = await res.json();
  return data;
};

export const getClient = async (id) => {
  const res = await fetch(`${BASE}/${id}`);
  const data = await res.json();
  return data;
};
