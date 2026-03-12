const BASE = import.meta.env.VITE_API_URL+"/order-items";
export const getOrderItems = async (id) => {
  const res = await fetch(`${BASE}/order/${id}`);
  const data = await res.json();
  return data;
};
