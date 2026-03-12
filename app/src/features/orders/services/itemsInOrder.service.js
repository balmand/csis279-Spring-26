const BASE = "http://localhost:3001/order-items";

export const getOrderItems = async (id) => {
  const res = await fetch(`${BASE}/order/${id}`);
  const data = await res.json();
  return data;
};
