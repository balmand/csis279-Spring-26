import { api } from "../../../services/api";

export const getOrderItems = (id) => {
  return api(`/order-items/order/${id}`);
};
