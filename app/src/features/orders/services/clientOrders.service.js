const BASE = import.meta.env.VITE_API_URL+"/clients";

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
