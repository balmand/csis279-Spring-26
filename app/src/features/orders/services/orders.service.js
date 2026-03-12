const BASE = import.meta.env.VITE_API_URL+"/orders";

export const getOrders = async (id) => {
  const res = await fetch(`${BASE}/customer/${id}`);
  const data = await res.json();
  return data;
};
