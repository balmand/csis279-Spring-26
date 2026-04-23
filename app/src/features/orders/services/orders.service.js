import { requestGraphql } from "../../../services/api";

export const getOrders = (id) => {
  return requestGraphql(
    `query GetOrdersByClient($clientId: Int!) {
      ordersByClient(clientId: $clientId) {
        order_id
        customer_id
        order_date
        order_total
        order_status
      }
    }`,
    {
      variables: { clientId: Number(id) },
      dataPath: "ordersByClient",
    }
  );
};
