import { requestGraphql } from "../../../services/api";

export const getClients = () => {
  return requestGraphql(
    `query GetClientsForOrders {
      clients {
        client_id
        client_name
        client_email
      }
    }`,
    { dataPath: "clients" }
  );
};

export const getClient = (id) => {
  return requestGraphql(
    `query GetClientForOrders($id: Int!) {
      client(id: $id) {
        client_id
        client_name
        client_email
      }
    }`,
    {
      variables: { id: Number(id) },
      dataPath: "client",
    }
  );
};
