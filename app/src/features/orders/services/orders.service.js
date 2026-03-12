import { api } from "../../../services/api";

export const getOrders = (id) => {
  return api(`/orders/customer/${id}`);
};
