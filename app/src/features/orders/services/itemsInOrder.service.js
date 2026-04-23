import { requestGraphql } from "../../../services/api";

export const getOrderItems = (id) => {
  return requestGraphql(
    `query GetOrderItems($orderId: Int!) {
      orderItemsByOrder(orderId: $orderId) {
        order_item_id
        order_id
        item_id
        quantity
        unit_price
      }
    }`,
    {
      variables: { orderId: Number(id) },
      dataPath: "orderItemsByOrder",
    }
  );
};
