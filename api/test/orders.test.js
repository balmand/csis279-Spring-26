const test = require("node:test");
const assert = require("node:assert");
const {
  createOrder,
  getOrderById,
  getAllOrders,
  updateOrder,
  deleteOrder
} = require("../orders");

let createdOrderId;

test("create order", async () => {
  const order = await createOrder({
    client_id: 1,
    order_date: "2026-03-10",
    order_total: 50,
    order_status: "pending"
  });

  createdOrderId = order.order_id;

  assert.ok(order.order_id);       
  assert.ok(order.client_id);      
});

test("get all orders", async () => {
  const orders = await getAllOrders();

  assert.ok(orders);               
  assert.ok(Array.isArray(orders));
  assert.ok(orders.length > 0);    
});

test("read order", async () => {
  const order = await getOrderById(createdOrderId);

  assert.ok(order);                
  assert.ok(order.order_id);       
});

test("update order", async () => {
  const updated = await updateOrder(createdOrderId, {
    client_id: 1,
    order_total: 80,
    order_status: "completed"
  });

  assert.ok(updated);              
  assert.ok(updated.updated_at);   
});

test("delete order", async () => {
  const result = await deleteOrder(createdOrderId);

  assert.ok(result);               
});