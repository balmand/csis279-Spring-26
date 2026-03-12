import { api } from "../../../services/api";

export const getClients = () => {
  return api("/clients");
};

export const getClient = (id) => {
  return api(`/clients/${id}`);
};
