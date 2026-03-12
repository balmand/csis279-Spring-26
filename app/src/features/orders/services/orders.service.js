const BASE = "http://localhost:3001/orders";

export const getOrders = async (id) => {
  const res = await fetch(`${BASE}/customer/${id}`);
  const data = await res.json();
  return data;
};
